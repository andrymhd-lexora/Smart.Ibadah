'use server';
/**
 * @fileOverview Flow Genkit untuk menghasilkan pesan motivasi yang dipersonalisasi dalam Bahasa Indonesia.
 *
 * - getPersonalizedMotivation - Fungsi yang menangani proses pembuatan motivasi.
 * - PersonalizedMotivationInput - Tipe input untuk fungsi getPersonalizedMotivation.
 * - PersonalizedMotivationOutput - Tipe output untuk fungsi getPersonalizedMotivation.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedMotivationInputSchema = z.object({
  name: z.string().describe("Nama pengguna."),
  currentExp: z.number().describe('Poin pengalaman pengguna saat ini.'),
  expNeededForNextRank: z
    .number()
    .describe('Poin pengalaman yang dibutuhkan untuk mencapai peringkat berikutnya.'),
  nextRankName: z
    .string()
    .describe('Nama peringkat berikutnya yang dituju pengguna.'),
  suggestedActivity: z
    .string()
    .describe('Aktivitas spesifik untuk disarankan kepada pengguna sebagai penyemangat.'),
});
export type PersonalizedMotivationInput = z.infer<
  typeof PersonalizedMotivationInputSchema
>;

const PersonalizedMotivationOutputSchema = z.object({
  message: z.string().describe('Pesan motivasi yang dipersonalisasi.'),
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
  prompt: `Hasilkan pesan motivasi yang dipersonalisasi untuk pengguna berdasarkan kemajuan mereka.

Detail pengguna:
Nama: {{{name}}}
EXP Saat Ini: {{{currentExp}}}
EXP yang Dibutuhkan untuk Peringkat Berikutnya: {{{expNeededForNextRank}}}
Peringkat Berikutnya: {{{nextRankName}}}
Aktivitas yang Disarankan: {{{suggestedActivity}}}

Buatlah pesan yang hangat dan menyemangat dalam Bahasa Indonesia. Contoh: "Assalamu'alaikum [Nama], kamu tinggal [expNeededForNextRank] EXP lagi untuk mencapai peringkat [nextRankName]! Semangat ya, jangan lupa selesaikan [suggestedActivity] hari ini!"

Pastikan pesannya inspiratif dan mendorong pengguna untuk terus beristiqomah dalam perjalanan ibadah mereka.`,
});

const personalizedMotivationFlow = ai.defineFlow(
  {
    name: 'personalizedMotivationFlow',
    inputSchema: PersonalizedMotivationInputSchema,
    outputSchema: PersonalizedMotivationOutputSchema,
  },
  async input => {
    try {
      const {output} = await personalizedMotivationPrompt(input);
      if (!output) {
        throw new Error('Output AI kosong');
      }
      return output;
    } catch (error) {
      // Log error secara internal tapi berikan fallback ke pengguna agar UI tidak crash
      console.error('Genkit error or service unavailable:', error);
      
      return {
        message: `Assalamu'alaikum ${input.name}, tetap istiqomah ya! Kamu tinggal sedikit lagi mencapai peringkat ${input.nextRankName}. Mari selesaikan ${input.suggestedActivity} hari ini untuk terus bertumbuh.`
      };
    }
  }
);
