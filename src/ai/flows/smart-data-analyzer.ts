'use server';

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

  const prompt = `You are an expert in analyzing SMART data from hard drives and SSDs.
  You will be provided with SMART data from a disk. Your task is to analyze this data and provide a plain English summary of any potential risks or predicted failures.

  SMART Data:
  ${input.smartData}
  `;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
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
      throw new Error(error.error.message || 'Failed to analyze SMART data');
    }

    const result = await response.json();
    const summary = result.candidates[0].content.parts[0].text;
    return { summary };
  } catch (error: any) {
    console.error("SMART analysis failed:", error);
    throw new Error('Could not analyze SMART data. Please try again later.');
  }
}