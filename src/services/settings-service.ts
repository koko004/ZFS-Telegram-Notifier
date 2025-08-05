'use server';

import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { Settings } from '@/lib/types';

const settingsDocRef = doc(db, 'settings', 'app-settings');

export async function getSettings(): Promise<Settings> {
    const docSnap = await getDoc(settingsDocRef);
    if (docSnap.exists()) {
        return docSnap.data() as Settings;
    }
    // Return default settings if none are found
    return {
        telegram: {
            botToken: '',
            chatId: '',
        },
        notifications: {
            poolDegraded: true,
            poolFaulted: true,
            diskErrors: false,
            smartFailures: true,
        }
    };
}

export async function saveSettings(settings: Settings): Promise<void> {
    await setDoc(settingsDocRef, settings);
}
