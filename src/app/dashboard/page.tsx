
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
import { useUser, useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking, useAuth } from "@/firebase";
import { doc } from "firebase/firestore";
import { signOut } from "firebase/auth";

function DashboardContent() {
  const { user: authUser, isUserLoading } = useUser();
  const auth = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const db = useFirestore();
  
  const roleFromUrl = searchParams.get('role') as UserRole;
  const nameFromUrl = searchParams.get('name');

  useEffect(() => {
    if (!isUserLoading && !authUser) {
      router.push('/');
    }
  }, [isUserLoading, authUser, router]);

  const userDocRef = useMemoFirebase(() => {
    if (!db || !authUser) return null;
    return doc(db, 'users', authUser.uid);
  }, [db, authUser]);

  const { data: profileData, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  // Inisialisasi User Baru jika belum ada di Firestore
  useEffect(() => {
    if (authUser && !isProfileLoading && !profileData && db && roleFromUrl) {
      const newUser: UserProfile = {
        uid: authUser.uid,
        name: nameFromUrl ? decodeURIComponent(nameFromUrl) : (authUser.displayName || `Pahlawan ${authUser.uid.slice(0, 4)}`),
        email: authUser.email || '',
        role: roleFromUrl,
        totalExp: 0,
        streak: 0,
        whatsapp: '',
        participantId: `RTI-${Math.floor(1000 + Math.random() * 9000)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const docRef = doc(db, 'users', authUser.uid);
      setDocumentNonBlocking(docRef, newUser, { merge: true });
    }
  }, [authUser, isProfileLoading, profileData, db, roleFromUrl, nameFromUrl]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error("Gagal keluar:", error);
    }
  };

  if (isUserLoading || (authUser && isProfileLoading)) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Mempersiapkan Markas Pahlawan...</p>
      </div>
    </div>
  );

  if (!authUser) return null;

  // Nama diprioritaskan dari profileData agar sinkron dengan Firestore
  const finalUser: UserProfile = {
    uid: authUser.uid,
    name: profileData?.name || (nameFromUrl ? decodeURIComponent(nameFromUrl!) : (authUser.displayName || 'Pahlawan')),
    email: profileData?.email || authUser.email || '',
    role: profileData?.role || roleFromUrl || 'santri',
    totalExp: profileData?.totalExp || 0,
    streak: profileData?.streak || 0,
    whatsapp: profileData?.whatsapp || '',
    participantId: profileData?.participantId || '',
    photoUrl: profileData?.photoUrl || '',
    school: profileData?.school || '',
    class: profileData?.class || '',
  } as UserProfile;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NavHeader user={finalUser} onLogout={handleLogout} />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 md:px-8">
        {finalUser.role === 'santri' && <SantriDashboard user={finalUser} />}
        {finalUser.role === 'ustadz' && <UstadzDashboard user={finalUser} />}
        {finalUser.role === 'wali' && <WaliDashboard user={finalUser} />}
      </main>
      <Footer />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
