
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
  assignedUstadzId?: string; // Teacher assigned to this student
}

export interface IbadahLog {
  id?: string;
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
