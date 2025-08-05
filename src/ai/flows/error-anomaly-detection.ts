'use server';

/**
 * @fileOverview A flow to detect anomalies in the rate of reported errors using GenAI-powered analysis.
 *
 * - detectErrorAnomaly - A function that handles the error anomaly detection process.
 * - DetectErrorAnomalyInput - The input type for the detectErrorAnomaly function.
 * - DetectErrorAnomalyOutput - The return type for the detectErrorAnomaly function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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
  return detectErrorAnomalyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectErrorAnomalyPrompt',
  input: {schema: DetectErrorAnomalyInputSchema},
  output: {schema: DetectErrorAnomalyOutputSchema},
  prompt: `You are an expert system administrator specializing in detecting anomalies in ZFS pool logs.

You will use the provided logs and baseline to determine if there is an anomaly in the rate of reported errors.

Logs: {{{logs}}}
Baseline: {{{baseline}}}

Determine if there is an anomaly in the logs compared to the baseline. Explain your reasoning.
Set the isAnomaly field to true if there is an anomaly, and false if there is not. Provide a detailed explanation in the explanation field.
`,
});

const detectErrorAnomalyFlow = ai.defineFlow(
  {
    name: 'detectErrorAnomalyFlow',
    inputSchema: DetectErrorAnomalyInputSchema,
    outputSchema: DetectErrorAnomalyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
