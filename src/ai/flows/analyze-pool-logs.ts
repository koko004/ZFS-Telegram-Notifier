'use server';

/**
 * @fileOverview This file defines a Genkit flow for analyzing ZFS pool logs using GenAI.
 *
 * - analyzePoolLogs -  Analyzes ZFS pool logs for anomalies.
 * - AnalyzePoolLogsInput - The input type for the analyzePoolLogs function.
 * - AnalyzePoolLogsOutput - The return type for the analyzePoolLogs function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzePoolLogsInputSchema = z.object({
  poolLogs: z.string().describe('ZFS pool logs to analyze.'),
  baselineErrorRate: z.number().describe('The baseline error rate for the pool.'),
});
export type AnalyzePoolLogsInput = z.infer<typeof AnalyzePoolLogsInputSchema>;

const AnalyzePoolLogsOutputSchema = z.object({
  hasAnomalies: z.boolean().describe('Whether anomalies were detected in the logs.'),
  anomaliesDescription: z.string().describe('A description of the anomalies detected, if any.'),
});
export type AnalyzePoolLogsOutput = z.infer<typeof AnalyzePoolLogsOutputSchema>;

export async function analyzePoolLogs(input: AnalyzePoolLogsInput): Promise<AnalyzePoolLogsOutput> {
  return analyzePoolLogsFlow(input);
}

const analyzePoolLogsPrompt = ai.definePrompt({
  name: 'analyzePoolLogsPrompt',
  input: {schema: AnalyzePoolLogsInputSchema},
  output: {schema: AnalyzePoolLogsOutputSchema},
  prompt: `You are an expert system administrator specializing in ZFS pool health.

You will analyze the provided ZFS pool logs to detect anomalies and potential issues.
Compare the current logs against the provided baseline error rate to determine if the rate of errors is above normal.

Logs:
{{poolLogs}}

Baseline Error Rate: {{baselineErrorRate}}

Based on your analysis, determine if there are any anomalies or potential issues in the logs.
Set the hasAnomalies output field to true if anomalies are detected, otherwise set it to false.
Provide a detailed description of the anomalies in the anomaliesDescription output field.
If no anomalies are detected, set anomaliesDescription to an empty string.

Consider errors, warnings, unusual patterns, and deviations from the baseline error rate when making your determination.
`,
});

const analyzePoolLogsFlow = ai.defineFlow(
  {
    name: 'analyzePoolLogsFlow',
    inputSchema: AnalyzePoolLogsInputSchema,
    outputSchema: AnalyzePoolLogsOutputSchema,
  },
  async input => {
    const {output} = await analyzePoolLogsPrompt(input);
    return output!;
  }
);
