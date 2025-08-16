import type { Pool, VDev, Disk, PoolStatus } from './types';

export function parseZpoolStatus(statusOutput: string, listOutput: string, iostatOutput: string, poolName: string): Partial<Pool> {
    const pool: Partial<Pool> = {
        name: poolName,
        vdevs: [],
        status: 'offline',
        size: 0,
        allocated: 0,
        free: 0,
    };

    // --- Parse zpool list output for size, allocated, free ---
    const listLines = listOutput.trim().split('\n');
    if (listLines.length > 1) {
        const headers = listLines[0].trim().split(/\s+/);
        const values = listLines[1].trim().split(/\s+/);

        const sizeIndex = headers.indexOf('SIZE');
        const allocIndex = headers.indexOf('ALLOC');
        const freeIndex = headers.indexOf('FREE');

        if (sizeIndex !== -1) pool.size = parseInt(values[sizeIndex], 10);
        if (allocIndex !== -1) pool.allocated = parseInt(values[allocIndex], 10);
        if (freeIndex !== -1) pool.free = parseInt(values[freeIndex], 10);
    }

    // --- Parse zpool iostat output for pool and vdev alloc/free ---
    const iostatLines = iostatOutput.trim().split('\n');
    let inIostatDataSection = false;

    iostatLines.forEach(line => {
        const processedLine = line.replace(/\t/g, '        '); // Replace tabs with 8 spaces
        const trimmedLine = processedLine.trim();
        const parts = trimmedLine.split(/\s+/);
        const leadingSpaces = processedLine.match(/^\s*/)?.[0].length || 0;

        // Skip header lines and separator lines
        if (line.includes('capacity') || line.includes('---')) {
            inIostatDataSection = true;
            return;
        }
        if (!inIostatDataSection || trimmedLine === '') {
            return;
        }

        // Pool line in iostat output (e.g., "ZFSRAIDZ1  80.2G   276G ...")
        if (leadingSpaces === 0 && parts[0] === poolName) {
            pool.allocated = Math.round(parseSizeStringToBytes(parts[1]));
            pool.free = Math.round(parseSizeStringToBytes(parts[2]));
        }
        // Vdev line in iostat output (e.g., "  raidz1-0   80.2G   276G ...")
        else if (leadingSpaces === 2 && (parts[0].startsWith('raidz') || ['mirror', 'logs', 'cache', 'spares'].includes(parts[0]))) {
            const vdevName = parts[0];
            const vdevAlloc = parseSizeStringToBytes(parts[1]);
            const vdevFree = parseSizeStringToBytes(parts[2]);

            // Find the corresponding vdev in the pool object and update its alloc/free
            const vdev = pool.vdevs?.find(v => v.type === vdevName.split('-')[0]); // Assuming vdev.type is 'raidz1'
            if (vdev) {
                vdev.allocated = Math.round(vdevAlloc);
                vdev.free = Math.round(vdevFree);
            }
        }
        // Disk lines in iostat output (e.g., "    ata-BR_128GB_GV230316YC00000235      -      - ...")
        else if (leadingSpaces === 4 && parts.length >= 6) {
            // For disks, alloc/free are '-', so we can't get size directly from here.
            // We will rely on zpool status for disk names and errors.
            // Disk size will remain 0 for now.
        }
    });

    // Helper function to parse size strings (e.g., "80.2G", "276G") to bytes
    function parseSizeStringToBytes(sizeStr: string): number {
        let sizeInBytes = 0;
        const value = parseFloat(sizeStr);
        if (sizeStr.endsWith('T')) {
            sizeInBytes = value * 1024 * 1024 * 1024 * 1024;
        } else if (sizeStr.endsWith('G')) {
            sizeInBytes = value * 1024 * 1024 * 1024;
        } else if (sizeStr.endsWith('M')) {
            sizeInBytes = value * 1024 * 1024;
        } else if (sizeStr.endsWith('K')) {
            sizeInBytes = value * 1024;
        } else {
            sizeInBytes = value; // Assume bytes if no suffix
        }
        return sizeInBytes;
    }

    // --- Parse zpool status output for status, vdevs, and disks ---
    const statusLines = statusOutput.trim().split('\n');
    let currentVdev: VDev | null = null;
    let inConfigSection = false;
    let inPoolRootConfig = false; // To identify lines directly under the pool in config

    statusLines.forEach(line => {
        const processedLine = line.replace(/\t/g, '        '); // Replace tabs with 8 spaces
        console.log(`Processing line: '${processedLine}'`);
        const trimmedLine = processedLine.trim();
        const parts = trimmedLine.split(/\s+/);
        const leadingSpaces = processedLine.match(/^\s*/)?.[0].length || 0;
        console.log(`  Leading spaces: ${leadingSpaces}, First part: ${parts[0]}`);

        if (line.includes('config:')) {
            inConfigSection = true;
            inPoolRootConfig = false; // Reset
            currentVdev = null; // Reset
            console.log('  Entered config section.');
            return;
        }

        if (!inConfigSection) {
            // Parse overall pool status outside config section
            if (parts.includes('state:')) {
                const state = parts[parts.indexOf('state:') + 1].toLowerCase() as PoolStatus;
                if (['online', 'degraded', 'faulted'].includes(state)) {
                    pool.status = state;
                    console.log(`  Pool status set to: ${pool.status}`);
                }
            }
            return;
        }

        // Inside config section
        // Check indentation to determine if it's a pool, vdev, or disk line
        if (leadingSpaces === 8 && parts[0] === poolName) { // Example: "        mypool"
            // This is the main pool line within the config section
            inPoolRootConfig = true;
            currentVdev = null; // Reset current vdev
            console.log('  Detected pool root in config.');
        } else if (leadingSpaces === 10 && (['mirror', 'raidz1', 'raidz2', 'raidz3', 'logs', 'cache', 'spares'].includes(parts[0]) || parts[0].startsWith('raidz'))) { // Example: "          mirror-0"
            // This is a vdev line
            let vdevType = parts[0];
            if (vdevType.startsWith('raidz') && vdevType.includes('-')) {
                vdevType = vdevType.split('-')[0]; // Extract 'raidz1' from 'raidz1-0'
            }
            currentVdev = {
                id: pool.vdevs!.length.toString(), // Use array index as temporary ID, convert to string
                type: vdevType as any,
                disks: [],
            };
            pool.vdevs!.push(currentVdev);
            inPoolRootConfig = false; // No longer directly under pool line
            console.log(`  Detected vdev: ${vdevType}, currentVdev set.`);
        } else if (leadingSpaces === 12 && parts.length >= 5) { // Example: "            /dev/sdb"
            // This is a disk line
            const disk: Disk = {
                id: parts[0], // Use disk name as ID for now
                name: parts[0],
                status: parts[1].toLowerCase() as any,
                errors: {
                    read: parseInt(parts[2], 10),
                    write: parseInt(parts[3], 10),
                    checksum: parseInt(parts[4], 10),
                },
                model: 'N/A',
                size: 0,
                temperature: 0,
                smartData: '',
            };
            if (currentVdev) {
                currentVdev.disks.push(disk);
                console.log(`  Added disk ${disk.name} to currentVdev.`);
            } else if (inPoolRootConfig) {
                // This handles single-disk pools where the disk is directly under the pool
                // without an explicit vdev type like mirror-0
                const implicitVdev: VDev = {
                    id: pool.vdevs!.length.toString(),
                    type: 'stripe', // Assume stripe for single disks directly under pool
                    disks: [disk],
                };
                pool.vdevs!.push(implicitVdev);
                console.log(`  Added disk ${disk.name} to implicit vdev.`);
            }
        }
    });

    console.log('Parsed Pool Object (from zfs-parser):', JSON.stringify(pool, null, 2));

    return pool;
}