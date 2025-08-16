'use server';

/**
 * @fileOverview This file contains the Genkit flow for analyzing SMART data from disks.
 *
 * - analyzeSmartData - A function that analyzes SMART data and provides a summary of potential risks.
 * - AnalyzeSmartDataInput - The input type for the analyzeSmartData function.
 * - AnalyzeSmartDataOutput - The return type for the analyzeSmartData function.
 */

import { googleAI } from '@genkit-ai/googleai';
import { getSettings } from '@/services/settings-service';
import { z } from 'zod';

const AnalyzeSmartDataInputSchema = z.object({
  smartData: z.string().describe('The SMART data from a disk.'),
});
export type AnalyzeSmartDataInput = z.infer<typeof AnalyzeSmartDataInputSchema>;

const AnalyzeSmartDataOutputSchema = z.object({
  summary: z.string().describe('A plain English summary of potential risks or predicted failures based on the SMART data.'),
});
export type AnalyzeSmartDataOutput = z.infer<typeof AnalyzeSmartDataOutputSchema>;

export async function analyzeSmartData(input: AnalyzeSmartDataInput): Promise<AnalyzeSmartDataOutput> {
  const settings = await getSettings();
  const apiKey = settings.googleAiApiKey;

  if (!apiKey) {
    return { summary: 'AI analysis disabled. Please configure the Google AI API key in settings.' };
  }

  const model = googleAI({ apiKey }).model('gemini-1.5-flash');

  const prompt = `You are an expert in analyzing SMART data from hard drives and SSDs.
  You will be provided with SMART data from a disk. Your task is to analyze this data and provide a plain English summary of any potential risks or predicted failures.

  SMART Data:
  ${input.smartData}
  `;

  const { candidates } = await model.generate({ prompt });

  try {
    const output = JSON.parse(candidates[0].message.text);
    return AnalyzeSmartDataOutputSchema.parse(output);
  } catch (e) {
    return { summary: candidates[0].message.text };
  }
}
