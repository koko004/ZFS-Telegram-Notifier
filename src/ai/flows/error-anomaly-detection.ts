'use server';

import { getSettings } from '@/services/settings-service';
import { z } from 'zod';

const DetectErrorAnomalyInputSchema = z.object({
  logs: z.string().describe('The logs from the ZFS pool.'),
  baseline: z.string().describe('The baseline logs from the ZFS pool.'),
});
export type DetectErrorAnomalyInput = z.infer<typeof DetectErrorAnomalyInputSchema>;

const DetectErrorAnomalyOutputSchema = z.object({
  isAnomaly: z.boolean().describe('Whether or not there is an anomaly in the rate of reported errors.'),
  explanation: z.string().describe('The explanation of why there is or is not an anomaly.'),
});
export type DetectErrorAnomalyOutput = z.infer<typeof DetectErrorAnomalyOutputSchema>;

export async function detectErrorAnomaly(input: DetectErrorAnomalyInput): Promise<DetectErrorAnomalyOutput> {
    const settings = await getSettings();
    const apiKey = settings.googleAiApiKey;

    if (!apiKey) {
        return { 
            isAnomaly: false, 
            explanation: 'AI analysis disabled. Please configure the Google AI API key in settings.' 
        };
    }

    const model = 'gemini-1.5-flash';

    const prompt = `You are an expert system administrator specializing in detecting anomalies in ZFS pool logs.
    You will use the provided logs and baseline to determine if there is an anomaly in the rate of reported errors.

    Logs: ${input.logs}
    Baseline: ${input.baseline}

    Determine if there is an anomaly in the logs compared to the baseline. Explain your reasoning.
    Respond with a JSON object with two fields: "isAnomaly" (boolean) and "explanation" (string).
    `;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error.message || 'Failed to detect error anomaly');
        }

        const result = await response.json();
        const text = result.candidates[0].content.parts[0].text;
        // Clean the text to make sure it is a valid JSON
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '');
        const output = JSON.parse(cleanedText);
        return DetectErrorAnomalyOutputSchema.parse(output);
    } catch (error: any) {
        console.error("Error anomaly detection failed:", error);
        throw new Error('Could not detect error anomaly. Please try again later.');
    }
}