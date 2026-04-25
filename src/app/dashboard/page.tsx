"use client"

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { UserRole, UserProfile, IbadahLog } from "@/lib/types";
import { NavHeader } from "@/components/falaah/nav-header";
import { SantriDashboard } from "@/components/falaah/santri-dashboard";
import { UstadzDashboard } from "@/components/falaah/ustadz-dashboard";
import { WaliDashboard } from "@/components/falaah/wali-dashboard";
import { Footer } from "@/components/falaah/footer";
import { Loader2 } from "lucide-react";

const MOCK_USER: UserProfile = {
  uid: 'current-user-1',
  name: 'Ahmad Faiz',
  email: 'faiz@example.com',
  role: 'santri',
  totalExp: 32550,
  streak: 15
};

const MOCK_USTADZ: UserProfile = {
  uid: 'current-user-2',
  name: 'Ustadz Mansyur',
  email: 'mansyur@example.com',
  role: 'ustadz',
  totalExp: 0,
  streak: 0
};

const MOCK_WALI: UserProfile = {
  uid: 'current-user-3',
  name: 'Pak Budi',
  email: 'budi@example.com',
  role: 'wali',
  totalExp: 0,
  streak: 0
};

const MOCK_LOG: IbadahLog = {
  uid: 'current-user-1',
  date: new Date().toISOString().split('T')[0],
  activities: {
    prayers: ['Subuh', 'Dzuhur'],
    quranPages: 2,
    hafalanText: "Inna a'tainakal kauthar. Fasalli lirabbika wanhar. Inna syani'aka huwal abtar.",
    others: ['Sedekah'],
    dzikir: true,
    murottalMinutes: 15,
  },
  isVerified: false,
  isRevised: false,
  awardedExp: 450,
};

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const role = (searchParams.get('role') as UserRole) || 'santri';
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (role === 'santri') setUser(MOCK_USER);
    else if (role === 'ustadz') setUser(MOCK_USTADZ);
    else if (role === 'wali') setUser(MOCK_WALI);
  }, [role]);

  const handleLogout = () => {
    router.push('/');
  };

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-12 h-12 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NavHeader user={user} onLogout={handleLogout} />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 md:px-8">
        {role === 'santri' && <SantriDashboard user={user} initialLog={MOCK_LOG} />}
        {role === 'ustadz' && <UstadzDashboard />}
        {role === 'wali' && <WaliDashboard />}
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
