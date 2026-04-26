
"use client"

import { useState } from "react";
import { UserProfile, HafalanSubmission } from "@/lib/types";
import { 
  Users, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Star,
  ExternalLink,
  Filter,
  Loader2,
  Mic,
  ArrowRight
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
import { collectionGroup, query, doc } from "firebase/firestore";

interface UstadzDashboardProps {
  user: UserProfile;
}

export function UstadzDashboard({ user }: UstadzDashboardProps) {
  const { user: authUser } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState<HafalanSubmission | null>(null);
  const [verificationNote, setVerificationNote] = useState("");
  const db = useFirestore();

  const submissionsQuery = useMemoFirebase(() => {
    if (!db || !authUser) return null;
    return collectionGroup(db, 'hafalanSubmissions');
  }, [db, authUser]);

  const { data: submissions, isLoading } = useCollection<HafalanSubmission>(submissionsQuery);

  const filteredSubmissions = (submissions || [])
    .sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime())
    .filter(s => 
      (s.santriName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.hafalanContent.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  const handleVerify = (status: 'VERIFIED' | 'REVISED', bonus = false) => {
    if (!selectedSubmission || !db || !authUser) return;

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
      title: status === 'VERIFIED' ? (bonus ? "Mumtaz!" : "Berhasil Verifikasi") : "Revisi Dikirim",
      description: status === 'VERIFIED' ? `Hafalan ${selectedSubmission.santriName} telah diverifikasi.` : `Catatan revisi telah dikirim.`,
    });
    
    setSelectedSubmission(null);
    setVerificationNote("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-headline font-bold">Konsol Pengajar</h2>
          <p className="text-muted-foreground text-sm">Tinjau semua setoran masuk secara real-time.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Cari santri..." 
              className="pl-9 glass-card w-full md:w-[250px] bg-secondary/30"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" className="glass-card"><Filter className="w-4 h-4" /></Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card border-none bg-card/40">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10 text-primary"><Users className="w-6 h-6" /></div>
              <div><p className="text-xs text-muted-foreground uppercase font-bold">Total Masuk</p><p className="text-2xl font-black">{submissions?.length || 0}</p></div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-none bg-card/40">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-accent/10 text-accent"><AlertCircle className="w-6 h-6" /></div>
              <div><p className="text-xs text-muted-foreground uppercase font-bold">Pending</p><p className="text-2xl font-black">{submissions?.filter(s => s.status === 'PENDING_REVIEW').length || 0}</p></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-none bg-card/40">
        <CardHeader>
          <CardTitle className="text-lg font-headline">Daftar Hafalan Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Memuat setoran...</p>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground italic">Belum ada setoran masuk.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-white/5">
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Santri</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Hafalan</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Status</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.map(sub => (
                  <TableRow key={(sub as any).id} className="border-white/5 hover:bg-white/5 transition-colors">
                    <TableCell className="font-bold">{sub.santriName || 'Santri'}</TableCell>
                    <TableCell className="font-medium text-primary">{sub.hafalanContent}</TableCell>
                    <TableCell>
                      <Badge variant={sub.status === 'PENDING_REVIEW' ? 'secondary' : 'default'} className={cn(
                        sub.status === 'PENDING_REVIEW' ? "bg-accent/10 text-accent" : "bg-emerald-500/10 text-emerald-500",
                        "border-none"
                      )}>
                        {sub.status === 'PENDING_REVIEW' ? 'Pending' : 'Verified'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-primary hover:bg-primary/10 font-bold"
                            onClick={() => setSelectedSubmission(sub)}
                          >
                            Tinjau <ExternalLink className="w-3 h-3 ml-2" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="glass-card border-white/10 sm:max-w-[600px] p-8 bg-[#12141c]">
                          <DialogHeader className="space-y-4">
                            <DialogTitle className="text-3xl font-headline font-bold">Tinjau Hafalan</DialogTitle>
                            <p className="text-muted-foreground">Santri: <span className="text-white font-bold">{sub.santriName}</span></p>
                          </DialogHeader>
                          
                          <div className="space-y-6 py-6">
                            <div className="p-6 rounded-2xl bg-[#1e212b] border border-white/5">
                              <h4 className="text-[10px] font-black uppercase text-white/50 mb-3 tracking-widest">Kiriman Santri</h4>
                              <p className="text-lg leading-relaxed text-white italic">"{sub.hafalanContent}"</p>
                              <div className="mt-4 pt-4 border-t border-white/5">
                                <span className="text-emerald-400 font-bold text-sm flex items-center gap-2"><BookOpen className="w-4 h-4" /> Log Date: {sub.ibadahLogId}</span>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              <h4 className="text-[10px] font-black uppercase text-white/50 tracking-widest">Umpan Balik Ustadz</h4>
                              <Textarea 
                                placeholder="Berikan catatan perbaikan..."
                                value={verificationNote}
                                onChange={(e) => setVerificationNote(e.target.value)}
                                className="bg-[#1e212b] border-emerald-500/20 rounded-xl min-h-[120px]"
                              />
                            </div>
                          </div>

                          <DialogFooter className="flex flex-col sm:flex-row gap-3">
                            <Button 
                              variant="outline" 
                              className="flex-1 bg-red-500/10 text-red-500 border-red-500/20 h-14 rounded-xl font-bold"
                              onClick={() => handleVerify('REVISED')}
                            >
                              Butuh Revisi
                            </Button>
                            <Button 
                              variant="outline"
                              className="flex-1 bg-white/5 text-white border-white/10 h-14 rounded-xl font-bold"
                              onClick={() => handleVerify('VERIFIED')}
                            >
                              Verifikasi Saja
                            </Button>
                            <Button 
                              className="flex-1 bg-emerald-500 text-white font-bold h-14 rounded-xl shadow-lg shadow-emerald-500/20"
                              onClick={() => handleVerify('VERIFIED', true)}
                            >
                              Mumtaz (+200)
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
