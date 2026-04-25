export type UserRole = 'santri' | 'ustadz' | 'wali';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  totalExp: number;
  streak: number;
  school?: string;
  class?: string;
  photoUrl?: string;
  studentId?: string; // For Wali link
  linkedStudents?: string[]; // For Wali
}

export interface IbadahLog {
  uid: string;
  date: string;
  activities: {
    prayers: string[]; // List of completed prayer names
    quranPages: number;
    hafalanText: string;
    others: string[]; // Daily activities checked
    dzikir: boolean;
    murottalMinutes: number;
  };
  isVerified: boolean;
  isRevised: boolean;
  revisionNote?: string;
  awardedExp: number;
}
