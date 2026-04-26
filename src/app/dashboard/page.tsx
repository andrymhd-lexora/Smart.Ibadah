
"use client"

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, Suspense } from "react";
import { UserRole, UserProfile } from "@/lib/types";
import { NavHeader } from "@/components/falaah/nav-header";
import { SantriDashboard } from "@/components/falaah/santri-dashboard";
import { UstadzDashboard } from "@/components/falaah/ustadz-dashboard";
import { WaliDashboard } from "@/components/falaah/wali-dashboard";
import { Footer } from "@/components/falaah/footer";
import { Loader2 } from "lucide-react";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";

function DashboardContent() {
  const { user: authUser, isUserLoading } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const db = useFirestore();
  
  const role = (searchParams.get('role') as UserRole) || 'santri';

  // Redirect ke landing page jika tidak ada user dan tidak sedang loading
  useEffect(() => {
    if (!isUserLoading && !authUser) {
      router.push('/');
    }
  }, [isUserLoading, authUser, router]);

  // Fetch real profile from Firestore
  const userDocRef = useMemoFirebase(() => {
    if (!db || !authUser) return null;
    return doc(db, 'users', authUser.uid);
  }, [db, authUser]);

  const { data: profileData, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  const handleLogout = () => {
    router.push('/');
  };

  if (isUserLoading || isProfileLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-12 h-12 animate-spin text-primary" />
    </div>
  );

  // Jika authUser belum tersedia (saat redirect), jangan render apa-apa agar tidak memicu query Firestore
  if (!authUser) return null;

  // Fallback to local profile if document doesn't exist yet for prototyping
  const finalUser: UserProfile = profileData || {
    uid: authUser.uid,
    name: authUser.displayName || 'User Falaah',
    email: authUser.email || '',
    role: role,
    totalExp: 0,
    streak: 0
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NavHeader user={finalUser} onLogout={handleLogout} />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 md:px-8">
        {role === 'santri' && <SantriDashboard user={finalUser} />}
        {role === 'ustadz' && <UstadzDashboard user={finalUser} />}
        {role === 'wali' && <WaliDashboard user={finalUser} />}
      </main>
      <Footer />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
