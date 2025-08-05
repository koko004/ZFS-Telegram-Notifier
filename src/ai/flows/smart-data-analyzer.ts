'use server';

/**
 * @fileOverview This file contains the Genkit flow for analyzing SMART data from disks.
 *
 * - analyzeSmartData - A function that analyzes SMART data and provides a summary of potential risks.
 * - AnalyzeSmartDataInput - The input type for the analyzeSmartData function.
 * - AnalyzeSmartDataOutput - The return type for the analyzeSmartData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeSmartDataInputSchema = z.object({
  smartData: z.string().describe('The SMART data from a disk.'),
});
export type AnalyzeSmartDataInput = z.infer<typeof AnalyzeSmartDataInputSchema>;

const AnalyzeSmartDataOutputSchema = z.object({
  summary: z.string().describe('A plain English summary of potential risks or predicted failures based on the SMART data.'),
});
export type AnalyzeSmartDataOutput = z.infer<typeof AnalyzeSmartDataOutputSchema>;

export async function analyzeSmartData(input: AnalyzeSmartDataInput): Promise<AnalyzeSmartDataOutput> {
  return analyzeSmartDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeSmartDataPrompt',
  input: {schema: AnalyzeSmartDataInputSchema},
  output: {schema: AnalyzeSmartDataOutputSchema},
  prompt: `You are an expert in analyzing SMART data from hard drives and SSDs.
  You will be provided with SMART data from a disk. Your task is to analyze this data and provide a plain English summary of any potential risks or predicted failures.

  SMART Data:
  {{smartData}}
  `,
});

const analyzeSmartDataFlow = ai.defineFlow(
  {
    name: 'analyzeSmartDataFlow',
    inputSchema: AnalyzeSmartDataInputSchema,
    outputSchema: AnalyzeSmartDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
