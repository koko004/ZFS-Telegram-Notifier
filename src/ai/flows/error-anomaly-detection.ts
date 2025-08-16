'use server';

/**
 * @fileOverview A flow to detect anomalies in the rate of reported errors using GenAI-powered analysis.
 *
 * - detectErrorAnomaly - A function that handles the error anomaly detection process.
 * - DetectErrorAnomalyInput - The input type for the detectErrorAnomaly function.
 * - DetectErrorAnomalyOutput - The return type for the detectErrorAnomaly function.
 */

import { googleAI } from '@genkit-ai/googleai';
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

    const model = googleAI({ apiKey }).model('gemini-1.5-flash');

    const prompt = `You are an expert system administrator specializing in detecting anomalies in ZFS pool logs.
    You will use the provided logs and baseline to determine if there is an anomaly in the rate of reported errors.

    Logs: ${input.logs}
    Baseline: ${input.baseline}

    Determine if there is an anomaly in the logs compared to the baseline. Explain your reasoning.
    Set the isAnomaly field to true if there is an anomaly, and false if there is not. Provide a detailed explanation in the explanation field.
    `;

    const { candidates } = await model.generate({ prompt });

    try {
        const output = JSON.parse(candidates[0].message.text);
        return DetectErrorAnomalyOutputSchema.parse(output);
    } catch (e) {
        return { isAnomaly: false, explanation: candidates[0].message.text };
    }
}
