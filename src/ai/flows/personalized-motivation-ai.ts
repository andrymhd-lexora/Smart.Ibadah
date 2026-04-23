'use server';
/**
 * @fileOverview A Genkit flow for generating personalized motivational messages.
 *
 * - getPersonalizedMotivation - A function that handles the personalized motivation generation process.
 * - PersonalizedMotivationInput - The input type for the getPersonalizedMotivation function.
 * - PersonalizedMotivationOutput - The return type for the getPersonalizedMotivation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedMotivationInputSchema = z.object({
  name: z.string().describe("The user's name."),
  currentExp: z.number().describe('The user\'s current experience points.'),
  expNeededForNextRank: z
    .number()
    .describe('The experience points needed to reach the next rank.'),
  nextRankName: z
    .string()
    .describe('The name of the next rank the user is aiming for.'),
  suggestedActivity: z
    .string()
    .describe('A specific activity to suggest to the user for encouragement.'),
});
export type PersonalizedMotivationInput = z.infer<
  typeof PersonalizedMotivationInputSchema
>;

const PersonalizedMotivationOutputSchema = z.object({
  message: z.string().describe('A personalized motivational message.'),
});
export type PersonalizedMotivationOutput = z.infer<
  typeof PersonalizedMotivationOutputSchema
>;

export async function getPersonalizedMotivation(
  input: PersonalizedMotivationInput
): Promise<PersonalizedMotivationOutput> {
  return personalizedMotivationFlow(input);
}

const personalizedMotivationPrompt = ai.definePrompt({
  name: 'personalizedMotivationPrompt',
  input: {schema: PersonalizedMotivationInputSchema},
  output: {schema: PersonalizedMotivationOutputSchema},
  prompt: `Generate a personalized motivational message for the user based on their progress.

Here are the user's details:
Name: {{{name}}}
Current Experience Points: {{{currentExp}}}
Experience Points Needed for Next Rank: {{{expNeededForNextRank}}}
Next Rank: {{{nextRankName}}}
Suggested Activity: {{{suggestedActivity}}}

Craft a warm and encouraging message. For example, you could say: "Assalamu'alaikum [Name], you are [expNeededForNextRank] EXP away from reaching Rank [nextRankName]! Let's complete your [suggestedActivity]!"

Ensure the message is inspiring and encourages the user to continue their Ibadah journey.`,
});

const personalizedMotivationFlow = ai.defineFlow(
  {
    name: 'personalizedMotivationFlow',
    inputSchema: PersonalizedMotivationInputSchema,
    outputSchema: PersonalizedMotivationOutputSchema,
  },
  async input => {
    const {output} = await personalizedMotivationPrompt(input);
    return output!;
  }
);
