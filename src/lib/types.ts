
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
  whatsapp?: string;
  participantId?: string;
  linkedStudentIds?: string[]; // Sesuai dengan backend.json
  assignedUstadzId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IbadahLog {
  id?: string;
  uid: string;
  date: string;
  activities: {
    prayers: string[];
    quranPages: number;
    hafalanText: string;
    others: string[];
    dzikir: boolean;
    murottalMinutes: number;
  };
  isVerified: boolean;
  isRevised: boolean;
  revisionNote?: string;
  awardedExp: number;
  updatedAt?: string;
}

export interface HafalanSubmission {
  id?: string;
  santriId: string;
  santriName?: string;
  ibadahLogId: string;
  submissionDate: string;
  hafalanContent: string;
  status: 'PENDING_REVIEW' | 'VERIFIED' | 'REVISED';
  expAwarded: number;
  ustadzId?: string;
  ustadzNotes?: string;
  verificationDate?: string;
  createdAt: string;
  updatedAt: string;
  assignedUstadzId?: string;
}
