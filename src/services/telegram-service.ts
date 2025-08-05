'use server';

import { getSettings } from './settings-service';

export async function sendTelegramMessage(message: string): Promise<{ ok: boolean, description?: string }> {
    const settings = await getSettings();
    const { botToken, chatId } = settings.telegram;

    if (!botToken || !chatId) {
        console.error('Telegram bot token or chat ID is not configured.');
        return { ok: false, description: 'Telegram bot not configured.' };
    }

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'Markdown',
            }),
        });

        return await response.json();

    } catch (error) {
        console.error('Failed to send Telegram message:', error);
        return { ok: false, description: 'Failed to send message.' };
    }
}

export async function testTelegramConnection(): Promise<{ ok: boolean, description?: string }> {
    return sendTelegramMessage('🚀 *ZFS Notifier*: Connection test successful! 🚀');
}
