'use server';
/**
 * @fileOverview Flow Genkit untuk menghasilkan pesan motivasi yang dipersonalisasi dari persona "Ustadz AI".
 * Fokus pada nilai-nilai: Istiqomah, Adab, Tawadhu, Taat, dan Pantang Menyerah.
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
  prompt: `Anda adalah "Ustadz AI" dari Rumah Tahfidz Ikhsan, seorang guru yang sangat bijak, hangat, dan sangat peduli pada pembentukan karakter (akhlak) santri.

Tujuan Anda adalah memberikan pesan motivasi harian yang berbeda-beda dan mendalam kepada Santri berdasarkan kemajuan mereka.

DETAIL SANTRI:
- Nama: {{{name}}}
- Peringkat Saat Ini: Berdasarkan {{{currentExp}}} EXP.
- Target Berikutnya: Peringkat {{{nextRankName}}} (butuh {{{expNeededForNextRank}}} EXP lagi).
- Aktivitas Hari Ini: {{{suggestedActivity}}}.

TEMA PESAN (Pilih salah satu tema secara acak untuk setiap pesan):
1. ADAB: Tekankan bahwa "Adab lebih tinggi dari Ilmu". Ilmu tanpa adab hanya akan membuat sombong.
2. ISTIQOMAH: Semangati untuk terus konsisten, meski sedikit demi sedikit.
3. TAWADHU: Ingatkan untuk tetap rendah hati meski hafalan sudah banyak.
4. PANTANG MENYERAH: Berikan kekuatan saat menghadapi ayat yang sulit dihafal.
5. TAAT: Ingatkan pentingnya bakti kepada orang tua sebagai kunci kemudahan menghafal.

GAYA BAHASA:
- Gunakan Bahasa Indonesia yang hangat, kebapakan, dan inspiratif.
- Gunakan sapaan yang akrab seperti "Ananda [Nama]" atau "Anakku [Nama]".
- Awali dengan Salam.
- Pastikan pesan terasa baru dan tidak membosankan setiap kali dibaca.

CONTOH TONE:
"Assalamu'alaikum Ananda Faiz. Ingatlah, adab lebih tinggi dari ilmu. Tetaplah tawadhu meski hafalanmu terus bertambah. Sedikit lagi menuju peringkat Mitos, ayo tuntaskan tugas hari ini dengan penuh keikhlasan."`,
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
      console.error('Genkit error or service unavailable:', error);
      
      // Fallback tetap dengan nilai-nilai karakter yang diminta
      const fallbacks = [
        `Assalamu'alaikum ${input.name}, ingatlah bahwa adab lebih tinggi dari ilmu. Tetaplah istiqomah dan tawadhu dalam menghafal. Kamu hebat!`,
        `Assalamu'alaikum Ananda ${input.name}, sedikit lagi menuju peringkat ${input.nextRankName}. Pantang menyerah ya, setiap huruf yang kamu baca adalah pahala jariyah.`,
        `Assalamu'alaikum ${input.name}, jadilah santri yang taat dan berbakti. Kesuksesanmu menghafal Al-Quran ada pada ridha orang tuamu.`
      ];
      
      return {
        message: fallbacks[Math.floor(Math.random() * fallbacks.length)]
      };
    }
  }
);
