export type Rank = {
  name: string;
  minExp: number;
  icon: string;
  color: string;
};

export const RANKS: Rank[] = [
  { name: 'Warrior', minExp: 0, icon: '⚔️', color: '#94A3B8' },
  { name: 'Elite', minExp: 1000, icon: '🛡️', color: '#10B981' },
  { name: 'Master', minExp: 3000, icon: '⭐', color: '#3B82F6' },
  { name: 'Grandmaster', minExp: 7000, icon: '💎', color: '#8B5CF6' },
  { name: 'Epic', minExp: 15000, icon: '🔥', color: '#EC4899' },
  { name: 'Legend', minExp: 30000, icon: '🐉', color: '#F59E0B' },
  { name: 'Mythic', minExp: 60000, icon: '👑', color: '#EF4444' },
];

export const EXP_VALUES = {
  SHOLAT_WAJIB: 50,
  SHOLAT_SUNNAH: 30,
  QURAN_PAGE: 100,
  DZIKIR: 20,
  DAILY_ACTIVITY: 40,
  MUMTAZ_BONUS: 200,
};

export const PRAYERS_WAJIB = ['Subuh', 'Dzuhur', 'Ashar', 'Maghrib', 'Isya'];
export const PRAYERS_SUNNAH = ['Tahajjud', 'Duha', 'Rawatib'];
export const DAILY_IBADAH = ['Sahur', 'Puasa', 'Terawih', 'Sedekah'];

export function getRankByExp(exp: number): Rank {
  return [...RANKS].reverse().find(r => exp >= r.minExp) || RANKS[0];
}

export function getNextRank(exp: number): Rank | null {
  const currentRankIndex = RANKS.findIndex(r => r.name === getRankByExp(exp).name);
  return RANKS[currentRankIndex + 1] || null;
}
