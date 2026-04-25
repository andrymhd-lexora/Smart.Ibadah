"use client"

import { useState } from "react";
import { UserProfile, IbadahLog } from "@/lib/types";
import { RANKS, getRankByExp, EXP_VALUES } from "@/lib/constants";
import { 
  Users, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Star,
  ExternalLink,
  Filter,
  MoreVertical,
  CheckCircle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

const MOCK_STUDENTS: UserProfile[] = [
  { uid: '1', name: 'Ahmad Faiz', email: 'faiz@example.com', role: 'santri', totalExp: 32000, streak: 12 },
  { uid: '2', name: 'Zaid Al-Banna', email: 'zaid@example.com', role: 'santri', totalExp: 14500, streak: 5 },
  { uid: '3', name: 'Umar Khayyam', email: 'umar@example.com', role: 'santri', totalExp: 8000, streak: 30 },
  { uid: '4', name: 'Ali Bin Abi Talib', email: 'ali@example.com', role: 'santri', totalExp: 500, streak: 1 },
];

export function UstadzDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<UserProfile | null>(null);
  const [verificationNote, setVerificationNote] = useState("");

  const filteredStudents = MOCK_STUDENTS.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleVerify = (bonus: boolean) => {
    toast({
      title: bonus ? "Terverifikasi Mumtaz!" : "Hafalan Terverifikasi",
      description: `Santri ${selectedStudent?.name} telah diperbarui. ${bonus ? '+200 Bonus EXP diberikan.' : ''}`,
    });
    setSelectedStudent(null);
  };

  const handleRevision = () => {
    toast({
      title: "Revisi Diminta",
      description: `Catatan telah dikirim ke ${selectedStudent?.name}`,
      variant: "default"
    });
    setSelectedStudent(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-headline font-bold">Konsol Pengajar</h2>
          <p className="text-muted-foreground text-sm">Kelola santri dan verifikasi progres mereka.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Cari santri..." 
              className="pl-9 glass-card w-full md:w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" className="glass-card">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Ringkasan Kelas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <div className="text-2xl font-bold text-primary">{MOCK_STUDENTS.length}</div>
                <div className="text-[10px] text-muted-foreground uppercase">Total Santri</div>
              </div>
              <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                <div className="text-2xl font-bold text-accent">5</div>
                <div className="text-[10px] text-muted-foreground uppercase">Setoran Menunggu</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Peringkat Kelas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {RANKS.map(r => (
                <div key={r.name} className="flex items-center gap-1.5 px-2 py-1 rounded bg-secondary/50 border border-white/5">
                  <span>{r.icon}</span>
                  <span className="text-[10px] font-bold uppercase tracking-tighter">{r.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg">Manajemen Santri</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-white/5">
                <TableHead className="font-bold">Nama Santri</TableHead>
                <TableHead className="font-bold">Peringkat</TableHead>
                <TableHead className="font-bold">Total EXP</TableHead>
                <TableHead className="font-bold">Streak</TableHead>
                <TableHead className="font-bold text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map(student => {
                const rank = getRankByExp(student.totalExp);
                return (
                  <TableRow key={student.uid} className="border-white/5 hover:bg-white/5">
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{rank.icon}</span>
                        <span className="text-xs font-bold text-muted-foreground">{rank.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{student.totalExp.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-orange-500/10 text-orange-500 hover:bg-orange-500/10 border-none">
                        {student.streak} hari
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-primary hover:text-primary hover:bg-primary/10"
                            onClick={() => setSelectedStudent(student)}
                          >
                            Tinjau Setoran
                            <ExternalLink className="w-3 h-3 ml-2" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="glass-card border-white/10 sm:max-w-[500px]">
                          <DialogHeader>
                            <DialogTitle className="font-headline">Tinjau Hafalan</DialogTitle>
                            <DialogDescription>
                              Santri: <span className="text-foreground font-bold">{selectedStudent?.name}</span>
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <h4 className="text-xs font-bold uppercase text-muted-foreground">Kiriman (Surah & Ayat)</h4>
                              <div className="p-4 rounded-lg bg-secondary/50 border italic text-sm leading-relaxed">
                                "Inna a'tainakal kauthar. Fasalli lirabbika wanhar. Inna syani'aka huwal abtar."
                                <br />- Surah Al-Kauthar (1-3)
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <h4 className="text-xs font-bold uppercase text-muted-foreground">Umpan Balik (Opsional)</h4>
                              <Textarea 
                                placeholder="Tulis catatan revisi atau penyemangat di sini..."
                                value={verificationNote}
                                onChange={(e) => setVerificationNote(e.target.value)}
                                className="bg-secondary/30"
                              />
                            </div>
                          </div>

                          <DialogFooter className="flex-col sm:flex-row gap-2">
                            <Button 
                              variant="destructive" 
                              className="bg-destructive/20 text-destructive hover:bg-destructive/30 border-none"
                              onClick={handleRevision}
                            >
                              <AlertCircle className="w-4 h-4 mr-2" />
                              Butuh Revisi
                            </Button>
                            <Button 
                              variant="outline"
                              className="glass-card"
                              onClick={() => handleVerify(false)}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Verifikasi Saja
                            </Button>
                            <Button 
                              className="bg-primary text-primary-foreground font-bold"
                              onClick={() => handleVerify(true)}
                            >
                              <Star className="w-4 h-4 mr-2 fill-current" />
                              Mumtaz (+{EXP_VALUES.MUMTAZ_BONUS})
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
