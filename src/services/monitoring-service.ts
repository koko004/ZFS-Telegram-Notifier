'use server';

import { getPools, getPool } from './pool-service';
import { getSettings } from './settings-service';
import { sendTelegramMessage } from './telegram-service';

export async function checkPoolsAndNotify() {
    console.log('Checking pool statuses...');
    const settings = await getSettings();
    const allPools = await getPools();

    for (const p of allPools) {
        // This will fetch live data and update the database
        const pool = await getPool(p.id);
        if (!pool) continue;

        let message = '';
        if (settings.notifications.poolDegraded && pool.status === 'degraded') {
            message = `*Pool Degraded*\n\nPool ${pool.name} is in a DEGRADED state.`;
        } else if (settings.notifications.poolFaulted && pool.status === 'faulted') {
            message = `*Pool Faulted*\n\nPool ${pool.name} is in a FAULTED state. Immediate action required.`;
        }

        // You can add more checks here, for example for disk errors or SMART failures.

        if (message) {
            await sendTelegramMessage(message);
        }
    }
    console.log('Finished checking pool statuses.');
}
