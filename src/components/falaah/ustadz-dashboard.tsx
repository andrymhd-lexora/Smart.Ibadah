
"use client"

import { useState } from "react";
import { UserProfile, HafalanSubmission } from "@/lib/types";
import { RANKS, getRankByExp } from "@/lib/constants";
import { 
  Users, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Star,
  ExternalLink,
  Filter,
  Clock,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useFirestore, useCollection, useMemoFirebase, updateDocumentNonBlocking, useUser } from "@/firebase";
import { collectionGroup, query, where, doc } from "firebase/firestore";

interface UstadzDashboardProps {
  user: UserProfile;
}

export function UstadzDashboard({ user }: UstadzDashboardProps) {
  const { user: authUser } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState<HafalanSubmission | null>(null);
  const [verificationNote, setVerificationNote] = useState("");
  const db = useFirestore();

  // REAL DATA: Fetch all submissions assigned to this Ustadz
  // Pastikan query hanya berjalan jika user sudah terautentikasi (authUser tidak null)
  const submissionsQuery = useMemoFirebase(() => {
    if (!db || !authUser) return null;
    
    // Collection Group query for hafalanSubmissions
    return query(
      collectionGroup(db, 'hafalanSubmissions'),
      // Security Rules akan memfilter data berdasarkan 'assignedUstadzId'
      // secara implisit melalui kebijakan keamanan.
    );
  }, [db, authUser]);

  const { data: submissions, isLoading } = useCollection<HafalanSubmission>(submissionsQuery);

  const filteredSubmissions = (submissions || []).filter(s => 
    s.santriName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.hafalanContent.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleVerify = (status: 'VERIFIED' | 'REVISED', bonus = false) => {
    if (!selectedSubmission || !db || !authUser) return;

    // Build the correct reference path: /users/{santriId}/ibadahLogs/{logId}/hafalanSubmissions/{subId}
    const docRef = doc(db, `users/${selectedSubmission.santriId}/ibadahLogs/${selectedSubmission.ibadahLogId}/hafalanSubmissions`, (selectedSubmission as any).id);

    updateDocumentNonBlocking(docRef, {
      status: status,
      ustadzId: authUser.uid,
      ustadzNotes: verificationNote,
      verificationDate: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expAwarded: bonus ? 300 : 100
    });

    toast({
      title: status === 'VERIFIED' ? (bonus ? "Mumtaz!" : "Berhasil") : "Revisi Dikirim",
      description: status === 'VERIFIED' ? `Hafalan ${selectedSubmission.santriName} disetujui.` : `Catatan revisi dikirim ke ${selectedSubmission.santriName}.`,
    });
    
    setSelectedSubmission(null);
    setVerificationNote("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-headline font-bold">Konsol Pengajar</h2>
          <p className="text-muted-foreground text-sm">Review setoran santri secara real-time.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Cari setoran atau santri..." 
              className="pl-9 glass-card w-full md:w-[250px] bg-secondary/30"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" className="glass-card border-white/5">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="glass-card border-none bg-card/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Setoran Menunggu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {submissions?.filter(s => s.status === 'PENDING_REVIEW').length || 0}
            </div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold mt-1">Butuh Review Segera</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-none bg-card/40">
        <CardHeader>
          <CardTitle className="text-lg font-headline">Daftar Setoran Masuk</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Memuat data setoran...</p>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="py-20 text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto opacity-30" />
              <p className="text-muted-foreground">Belum ada setoran masuk untuk direview.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-white/5">
                  <TableHead className="font-bold uppercase text-[10px] tracking-widest">Santri</TableHead>
                  <TableHead className="font-bold uppercase text-[10px] tracking-widest">Konten Hafalan</TableHead>
                  <TableHead className="font-bold uppercase text-[10px] tracking-widest">Waktu Kirim</TableHead>
                  <TableHead className="font-bold uppercase text-[10px] tracking-widest">Status</TableHead>
                  <TableHead className="font-bold uppercase text-[10px] tracking-widest text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.map(sub => (
                  <TableRow key={(sub as any).id} className="border-white/5 hover:bg-white/5 transition-colors">
                    <TableCell className="font-bold">{sub.santriName || 'Anonim'}</TableCell>
                    <TableCell className="font-medium text-primary">{sub.hafalanContent}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(sub.submissionDate).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={sub.status === 'PENDING_REVIEW' ? 'secondary' : 'default'} className={cn(
                        sub.status === 'PENDING_REVIEW' ? "bg-accent/10 text-accent" : "bg-emerald-500/10 text-emerald-500",
                        "border-none px-2 py-0.5"
                      )}>
                        {sub.status === 'PENDING_REVIEW' ? 'Menunggu' : 'Selesai'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-primary hover:text-primary hover:bg-primary/10 rounded-full font-bold text-xs"
                            onClick={() => setSelectedSubmission(sub)}
                          >
                            Tinjau
                            <ExternalLink className="w-3 h-3 ml-2" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="glass-card border-white/10 sm:max-w-[600px] p-8 bg-[#12141c]">
                          <DialogHeader className="space-y-4">
                            <DialogTitle className="text-4xl font-headline font-bold text-white">Tinjau Hafalan</DialogTitle>
                            <div className="flex items-center gap-2 text-xl">
                              <span className="text-muted-foreground">Santri:</span>
                              <span className="text-white font-bold">{sub.santriName}</span>
                            </div>
                          </DialogHeader>
                          
                          <div className="space-y-8 py-8">
                            <div className="space-y-4">
                              <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">Kiriman</h4>
                              <div className="p-8 rounded-[2rem] bg-[#1e212b] border border-white/5 italic text-xl leading-relaxed text-white shadow-inner relative">
                                {sub.hafalanContent}
                                <br />
                                <span className="text-[#10B981] font-bold not-italic mt-4 block text-lg">Setoran Hari: {sub.ibadahLogId}</span>
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">Umpan Balik</h4>
                              <Textarea 
                                placeholder="Tulis catatan revisi atau penyemangat..."
                                value={verificationNote}
                                onChange={(e) => setVerificationNote(e.target.value)}
                                className="bg-[#1e212b] border-emerald-500/30 min-h-[140px] rounded-2xl text-lg p-6"
                              />
                            </div>
                          </div>

                          <DialogFooter className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between mt-4">
                            <Button 
                              variant="outline" 
                              className="flex-1 bg-[#2a1b1b] text-[#ef4444] border-[#ef4444]/20 h-16 rounded-2xl font-bold"
                              onClick={() => handleVerify('REVISED')}
                            >
                              <AlertCircle className="w-5 h-5 mr-3" />
                              Revisi
                            </Button>
                            <Button 
                              variant="outline"
                              className="flex-1 bg-[#1e212b] text-white border-white/10 h-16 rounded-2xl font-bold"
                              onClick={() => handleVerify('VERIFIED')}
                            >
                              <CheckCircle2 className="w-5 h-5 mr-3" />
                              OK
                            </Button>
                            <Button 
                              className="flex-1 bg-[#10B981] text-white font-bold h-16 rounded-2xl shadow-lg"
                              onClick={() => handleVerify('VERIFIED', true)}
                            >
                              <Star className="w-5 h-5 mr-3 fill-current" />
                              Mumtaz
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
