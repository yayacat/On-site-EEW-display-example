// use server'
'use server';
/**
 * @fileOverview An AI agent that estimates event attendance based on a description.
 *
 * - estimateAttendance - A function that estimates event attendance.
 * - EstimateAttendanceInput - The input type for the estimateAttendance function.
 * - EstimateAttendanceOutput - The return type for the estimateAttendance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EstimateAttendanceInputSchema = z.object({
  eventDescription: z
    .string()
    .describe('A detailed description of the event, including the type of event, target audience, location, time, and any other relevant details.'),
});
export type EstimateAttendanceInput = z.infer<typeof EstimateAttendanceInputSchema>;

const EstimateAttendanceOutputSchema = z.object({
  estimatedAttendance: z
    .number()
    .describe('The estimated number of people who will attend the event.'),
  reasoning: z
    .string()
    .describe('The reasoning behind the estimated attendance number, based on the event description.'),
});
export type EstimateAttendanceOutput = z.infer<typeof EstimateAttendanceOutputSchema>;

export async function estimateAttendance(input: EstimateAttendanceInput): Promise<EstimateAttendanceOutput> {
  return estimateAttendanceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'estimateAttendancePrompt',
  input: {schema: EstimateAttendanceInputSchema},
  output: {schema: EstimateAttendanceOutputSchema},
  prompt: `You are an expert event attendance estimator. Given the following event description, provide an estimate of the number of people who will attend the event, and explain your reasoning.\n\nEvent Description: {{{eventDescription}}}`,
});

const estimateAttendanceFlow = ai.defineFlow(
  {
    name: 'estimateAttendanceFlow',
    inputSchema: EstimateAttendanceInputSchema,
    outputSchema: EstimateAttendanceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
