'use server';

import pool from '@/lib/postgres';
import { parseZpoolStatus } from '@/lib/zfs-parser';
import { executeSSHCommand, SSHCredentials } from './ssh-service';
import type { Pool, PoolInput, VDev, Disk } from '@/lib/types';
import { NodeSSH } from 'node-ssh';

export async function getPools(): Promise<Pool[]> {
    const client = await pool.connect();
    try {
        const result = await client.query('SELECT * FROM pools');
        const pools = result.rows;

        for (const p of pools) {
            const vdevsResult = await client.query('SELECT * FROM vdevs WHERE pool_id = $1', [p.id]);
            p.vdevs = vdevsResult.rows;

            for (const vdev of p.vdevs) {
                const disksResult = await client.query('SELECT * FROM disks WHERE vdev_id = $1', [vdev.id]);
                vdev.disks = disksResult.rows;
            }

            const logsResult = await client.query('SELECT message FROM logs WHERE pool_id = $1 ORDER BY timestamp DESC', [p.id]);
            p.logs = logsResult.rows.map(row => row.message);
        }

        return pools as Pool[];
    } finally {
        client.release();
    }
}

export async function getPool(id: string): Promise<Pool | null> {
    const client = await pool.connect();
    try {
        const result = await client.query('SELECT * FROM pools WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return null;
        }
        const p = result.rows[0];

        // Fetch vdevs and disks from the database
        const vdevsResult = await client.query('SELECT * FROM vdevs WHERE pool_id = $1', [p.id]);
        const dbVdevs = vdevsResult.rows;

        // Extract credentials from remote_address (e.g., user:pass@host)
        const [credentialsPart, host] = p.remote_address.split('@');
        const [username, password] = credentialsPart.split(':');

        const sshCredentials: SSHCredentials = { host, username, password };

        // Get real data from the server
        const zpoolStatusOutput = await executeSSHCommand(sshCredentials, `zpool status ${p.name} -v -p`);
        const zpoolListOutput = await executeSSHCommand(sshCredentials, `zpool list -p ${p.name}`);
        const zpoolIostatOutput = await executeSSHCommand(sshCredentials, `zpool iostat -v ${p.name}`);
        const devDiskByIdOutput = await executeSSHCommand(sshCredentials, `ls -l /dev/disk/by-id/`);
        
        console.log('zpool status output:', zpoolStatusOutput);
        console.log('zpool list output:', zpoolListOutput);
        console.log('zpool iostat output:', zpoolIostatOutput);
        console.log('ls -l /dev/disk/by-id/ output:', devDiskByIdOutput);

        const parsedData = parseZpoolStatus(zpoolStatusOutput, zpoolListOutput, zpoolIostatOutput, p.name);

        // Map ZFS disk names to /dev/ paths
        const diskZfsIdToDevPathMap: { [key: string]: string } = {};
                devDiskByIdOutput.split('\n').forEach(line => {
            const match = line.match(/(ata-[^\s]+|scsi-[^\s]+)\s->\s\.\.\/\.\.\/([^\s]+)/);
            if (match) {
                const zfsDiskId = match[1];
                const devPath = `/dev/${match[2]}`;
                diskZfsIdToDevPathMap[zfsDiskId] = devPath;
            }
        });
        console.log('Disk ZFS ID to /dev/ path map:', diskZfsIdToDevPathMap);

        // Use parsed data as the source of truth for vdevs and disks, and fetch SMART data
        const mergedVdevs: VDev[] = await Promise.all((parsedData.vdevs || []).map(async (parsedVdev: VDev) => {
            const mergedDisks: Disk[] = await Promise.all(parsedVdev.disks.map(async (parsedDisk: Disk) => {
                const devPath = diskZfsIdToDevPathMap[parsedDisk.id]; // Use parsedDisk.id as zfsId
                if (devPath) {
                    try {
                        const smartctlOutput = await executeSSHCommand(sshCredentials, `smartctl -a -T permissive ${devPath}`);
                        console.log(`SMARTCTL output for ${devPath}:`, smartctlOutput);
                        // Parse smartctl output for temperature, model, and size
                        const tempRegex = /194 Temperature_Celsius.* (\d+)$|Current Drive Temperature:\s*(\d+)/m;
                        const tempMatch = smartctlOutput.match(tempRegex);
                        console.log(`  tempMatch for ${devPath}:`, tempMatch);
                        if (tempMatch) {
                            const tempValue = tempMatch[1] || tempMatch[2];
                            if (tempValue) {
                                parsedDisk.temperature = parseInt(tempValue, 10);
                            }
                        }
                        const modelMatch = smartctlOutput.match(/Device Model:\s*(.+)/);
                        console.log(`  modelMatch for ${devPath}:`, modelMatch);
                        if (modelMatch) {
                            parsedDisk.model = modelMatch[1].trim();
                        }
                        const userCapacityMatch = smartctlOutput.match(/User Capacity:\s*([\d,]+)\s*bytes/);
                        console.log(`  userCapacityMatch for ${devPath}:`, userCapacityMatch);
                        if (userCapacityMatch) {
                            const bytes = parseInt(userCapacityMatch[1].replace(/,/g, ''), 10);
                            parsedDisk.size = Math.round(bytes / (1024 * 1024 * 1024)); // Convert bytes to GB
                        }
                        parsedDisk.smartData = smartctlOutput; // Store raw SMART data
                    } catch (smartError) {
                        console.error(`Failed to get SMART data for ${parsedDisk.id} (${devPath}):`, smartError);
                    }
                }

                return {
                    ...parsedDisk,
                    path: devPath || parsedDisk.path, // Ensure path is updated
                    zfsId: parsedDisk.id, // Use parsedDisk.id as zfsId for consistency
                };
            }));
            return { ...parsedVdev, disks: mergedDisks };
        }));

        console.log('Merged Vdevs before fullPoolDetails construction:', JSON.stringify(mergedVdevs, null, 2));

        const fullPoolDetails: Pool = {
            id: p.id,
            name: p.name,
            status: parsedData.status || p.status,
            size: parsedData.size || p.size,
            allocated: parsedData.allocated || p.allocated,
            free: parsedData.free || p.free,
            remoteAddress: p.remote_address,
            vdevs: mergedVdevs,
            logs: [zpoolStatusOutput], // For now, logs are just the raw command output
            errorAnalysis: p.error_analysis_is_anomaly ? {
                isAnomaly: p.error_analysis_is_anomaly,
                explanation: p.error_analysis_explanation,
            } : undefined,
        };

        await updatePoolInDatabase(p.id, fullPoolDetails);

        console.log('Full Pool Details after parsing and merging:', JSON.stringify(fullPoolDetails, null, 2));

        return fullPoolDetails;
    } finally {
        client.release();
    }
}

async function updatePoolInDatabase(poolId: number, poolData: Pool) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Update the main pool table
        await client.query(
            'UPDATE pools SET status = $1, size = $2, allocated = $3, free = $4, error_analysis_is_anomaly = $5, error_analysis_explanation = $6 WHERE id = $7',
            [poolData.status, poolData.size, poolData.allocated, poolData.free, poolData.errorAnalysis?.isAnomaly || null, poolData.errorAnalysis?.explanation || null, poolId]
        );

        // Handle vdevs and disks
        for (const vdevData of poolData.vdevs) {
            let vdevId;
            // Try to find existing vdev by type and pool_id
            const existingVdev = await client.query(
                'SELECT id FROM vdevs WHERE pool_id = $1 AND type = $2',
                [poolId, vdevData.type]
            );

            if (existingVdev.rows.length > 0) {
                vdevId = existingVdev.rows[0].id;
            } else {
                // Insert new vdev if not found
                const vdevResult = await client.query(
                    'INSERT INTO vdevs (pool_id, type) VALUES ($1, $2) RETURNING id',
                    [poolId, vdevData.type]
                );
                vdevId = vdevResult.rows[0].id;
            }

            for (const diskData of vdevData.disks) {
                // Try to find existing disk by zfs_id
                const existingDisk = await client.query(
                    'SELECT id FROM disks WHERE zfs_id = $1 AND vdev_id = $2',
                    [diskData.zfsId, vdevId]
                );

                if (existingDisk.rows.length > 0) {
                    // Update existing disk
                    await client.query(
                        'UPDATE disks SET name = $1, path = $2, model = $3, status = $4, read_errors = $5, write_errors = $6, checksum_errors = $7, size = $8, temperature = $9, smart_data = $10, smart_analysis = $11 WHERE id = $12',
                        [
                            diskData.name,
                            diskData.path || null,
                            diskData.model,
                            diskData.status,
                            diskData.errors.read,
                            diskData.errors.write,
                            diskData.errors.checksum,
                            diskData.size || null,
                            diskData.temperature || null,
                            diskData.smartData || null,
                            diskData.smartAnalysis || null,
                            existingDisk.rows[0].id
                        ]
                    );
                } else {
                    // Insert new disk
                    await client.query(
                        'INSERT INTO disks (vdev_id, zfs_id, name, path, model, status, read_errors, write_errors, checksum_errors, size, temperature, smart_data, smart_analysis) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)',
                        [
                            vdevId,
                            diskData.zfsId,
                            diskData.name,
                            diskData.path || null,
                            diskData.model,
                            diskData.status,
                            diskData.errors.read,
                            diskData.errors.write,
                            diskData.errors.checksum,
                            diskData.size || null,
                            diskData.temperature || null,
                            diskData.smartData || null,
                            diskData.smartAnalysis || null,
                        ]
                    );
                }
            }
        }

        // Delete vdevs or disks that are no longer present in poolData
        // This is a more complex task and might require a separate strategy
        // For now, we assume that vdevs and disks are only added or updated, not removed.

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(`Failed to update pool ${poolId} in database:`, error);
        throw error;
    } finally {
        client.release();
    }
}

export async function addPool(poolData: PoolInput): Promise<string> {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const fullPoolData = {
            status: 'online',
            size: 0,
            allocated: 0,
            free: 0,
            ...poolData,
        };

        const poolResult = await client.query(
            'INSERT INTO pools (name, status, size, allocated, free, remote_address) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [fullPoolData.name, fullPoolData.status, fullPoolData.size, fullPoolData.allocated, fullPoolData.free, fullPoolData.remoteAddress]
        );
        const poolId = poolResult.rows[0].id;

        

        if (poolData.logs) {
            for (const logMessage of poolData.logs) {
                await client.query(
                    'INSERT INTO logs (pool_id, message) VALUES ($1, $2)',
                    [poolId, logMessage]
                );
            }
        }

        await client.query('COMMIT');
        return poolId.toString();
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

export async function updatePool(id: string, poolData: Partial<PoolInput>): Promise<void> {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Update pool table
        const updateFields: string[] = [];
        const updateValues: any[] = [];
        let paramCount = 1;

        for (const [key, value] of Object.entries(poolData)) {
            if (key !== 'vdevs' && key !== 'logs') {
                updateFields.push(`${key} = $${paramCount++}`);
                updateValues.push(value);
            }
        }

        if (updateFields.length > 0) {
            updateValues.push(id);
            const queryText = `UPDATE pools SET ${updateFields.join(', ')} WHERE id = $${paramCount}`;
            await client.query(queryText, updateValues);
        }

        // For simplicity, we'll delete and recreate vdevs, disks, and logs
        // A more sophisticated implementation would handle updates individually

        if (poolData.vdevs) {
            await client.query('DELETE FROM vdevs WHERE pool_id = $1', [id]);
            for (const vdevData of poolData.vdevs) {
                const vdevResult = await client.query(
                    'INSERT INTO vdevs (pool_id, type) VALUES ($1, $2) RETURNING id',
                    [id, vdevData.type]
                );
                const vdevId = vdevResult.rows[0].id;

                for (const diskData of vdevData.disks) {
                    await client.query(
                        'INSERT INTO disks (vdev_id, name, model, status, read_errors, write_errors, checksum_errors, size, temperature, smart_data) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
                        [vdevId, diskData.name, diskData.model, diskData.status, diskData.errors.read, diskData.errors.write, diskData.errors.checksum, diskData.size, diskData.temperature, diskData.smartData]
                    );
                }
            }
        }

        if (poolData.logs) {
            await client.query('DELETE FROM logs WHERE pool_id = $1', [id]);
            for (const logMessage of poolData.logs) {
                await client.query(
                    'INSERT INTO logs (pool_id, message) VALUES ($1, $2)',
                    [id, logMessage]
                );
            }
        }

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

export async function deletePool(id: string): Promise<void> {
    const client = await pool.connect();
    try {
        await client.query('DELETE FROM pools WHERE id = $1', [id]);
    } finally {
        client.release();
    }
}