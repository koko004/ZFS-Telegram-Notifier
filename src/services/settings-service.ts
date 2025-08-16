'use server';

import pool from '@/lib/postgres';
import type { Settings } from '@/lib/types';

export async function getSettings(): Promise<Settings> {
    const client = await pool.connect();
    try {
        const result = await client.query('SELECT telegram_bot_token, telegram_chat_id, google_ai_api_key, notifications_pool_degraded, notifications_pool_faulted, notifications_disk_errors, notifications_smart_failures FROM settings WHERE id = 1');
        if (result.rows.length > 0) {
            const dbSettings = result.rows[0];
            return {
                telegram: {
                    botToken: dbSettings.telegram_bot_token || '',
                    chatId: dbSettings.telegram_chat_id || '',
                },
                googleAiApiKey: dbSettings.google_ai_api_key || '',
                notifications: {
                    poolDegraded: dbSettings.notifications_pool_degraded,
                    poolFaulted: dbSettings.notifications_pool_faulted,
                    diskErrors: dbSettings.notifications_disk_errors,
                    smartFailures: dbSettings.notifications_smart_failures,
                },
            };
        }
        // Return default settings if none are found
        return {
            telegram: {
                botToken: '',
                chatId: '',
            },
            googleAiApiKey: '',
            notifications: {
                poolDegraded: true,
                poolFaulted: true,
                diskErrors: false,
                smartFailures: true,
            }
        };
    } finally {
        client.release();
    }
}

export async function saveSettings(settings: Settings): Promise<void> {
    const client = await pool.connect();
    try {
        await client.query(
            `UPDATE settings SET 
                telegram_bot_token = $1,
                telegram_chat_id = $2,
                google_ai_api_key = $3,
                notifications_pool_degraded = $4,
                notifications_pool_faulted = $5,
                notifications_disk_errors = $6,
                notifications_smart_failures = $7
            WHERE id = 1`,
            [
                settings.telegram.botToken,
                settings.telegram.chatId,
                settings.googleAiApiKey,
                settings.notifications.poolDegraded,
                settings.notifications.poolFaulted,
                settings.notifications.diskErrors,
                settings.notifications.smartFailures
            ]
        );
    } finally {
        client.release();
    }
}