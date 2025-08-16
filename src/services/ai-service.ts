'use server';

import { googleAI } from '@genkit-ai/googleai';

export async function testGoogleAIConnection(apiKey: string): Promise<{ ok: boolean; message: string; }> {
    if (!apiKey) {
        return { ok: false, message: 'API key is empty.' };
    }
    try {
        const model = googleAI({ apiKey }).model('gemini-1.5-flash');
        // Make a lightweight call to check if the key is valid
        await model.countTokens('test');
        return { ok: true, message: 'Connection successful.' };
    } catch (error: any) {
        console.error("Google AI connection test failed:", error);
        // Try to return a more user-friendly error message
        if (error.message.includes('API key not valid')) {
            return { ok: false, message: 'The provided API key is not valid.' };
        }
        return { ok: false, message: 'Connection failed. Check console for details.' };
    }
}
