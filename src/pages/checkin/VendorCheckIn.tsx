import { useState } from 'react';
import { useVendors } from '@/hooks/useSupabaseData';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { Clock, LogIn, LogOut, Search, UserCheck, UserX, Loader2 } from 'lucide-react';

interface LocalCheckIn { vendorId: string; date: string; checkInTime: string; checkOutTime: string | null }

export default function VendorCheckIn() {
  const today = new Date().toISOString().split('T')[0];
  const [search, setSearch] = useState('');
  const [localRecords, setLocalRecords] = useState<LocalCheckIn[]>([]);
  const { data: allVendors = [], isLoading } = useVendors('all');

  const activeVendors = allVendors.filter((v: any) => v.status === 'active');
  const checkedIn = localRecords.map(r => r.vendorId);
  const checkedOut = localRecords.filter(r => r.checkOutTime).map(r => r.vendorId);

  const filtered = activeVendors.filter((v: any) =>
    v.name.toLowerCase().includes(search.toLowerCase()) || v.vendor_code.toLowerCase().includes(search.toLowerCase())
  );

  const handleCheckIn = (vendorId: string) => {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setLocalRecords(prev => [...prev, { vendorId, date: today, checkInTime: time, checkOutTime: null }]);
    const vendor = allVendors.find((v: any) => v.id === vendorId);
    toast({ title: '✅ Checked In', description: `${vendor?.name} checked in at ${time}` });
  };

  const handleCheckOut = (vendorId: string) => {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setLocalRecords(prev => prev.map(r => r.vendorId === vendorId && r.date === today ? { ...r, checkOutTime: time } : r));
    const vendor = allVendors.find((v: any) => v.id === vendorId);
    toast({ title: '👋 Checked Out', description: `${vendor?.name} checked out at ${time}` });
  };

  if (isLoading) return <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Clock className="h-6 w-6" /> Vendor Check-In / Check-Out</h1>

      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="pt-4 text-center"><UserCheck className="h-5 w-5 mx-auto text-primary mb-1" /><p className="text-2xl font-bold">{checkedIn.length}</p><p className="text-xs text-muted-foreground">Checked In</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><LogOut className="h-5 w-5 mx-auto text-primary mb-1" /><p className="text-2xl font-bold">{checkedOut.length}</p><p className="text-xs text-muted-foreground">Checked Out</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><UserX className="h-5 w-5 mx-auto text-destructive mb-1" /><p className="text-2xl font-bold">{activeVendors.length - checkedIn.length}</p><p className="text-xs text-muted-foreground">Absent</p></CardContent></Card>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search vendors..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor</TableHead>
                <TableHead>Territory</TableHead>
                <TableHead>Check-In</TableHead>
                <TableHead>Check-Out</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((v: any) => {
                const record = localRecords.find(r => r.vendorId === v.id);
                const isIn = checkedIn.includes(v.id);
                const isOut = checkedOut.includes(v.id);
                return (
                  <TableRow key={v.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8"><AvatarImage src={v.photo_url} /><AvatarFallback>{v.name[0]}</AvatarFallback></Avatar>
                        <div><p className="font-medium text-sm">{v.name}</p><p className="text-xs text-muted-foreground">{v.vendor_code}</p></div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{v.territory}</TableCell>
                    <TableCell className="text-sm">{record?.checkInTime || '—'}</TableCell>
                    <TableCell className="text-sm">{record?.checkOutTime || '—'}</TableCell>
                    <TableCell>
                      <Badge variant={isOut ? 'secondary' : isIn ? 'default' : 'outline'} className="text-xs">
                        {isOut ? 'Returned' : isIn ? 'Out Selling' : 'Absent'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {!isIn ? (
                        <Button size="sm" onClick={() => handleCheckIn(v.id)} className="gap-1"><LogIn className="h-3 w-3" /> In</Button>
                      ) : !isOut ? (
                        <Button size="sm" variant="outline" onClick={() => handleCheckOut(v.id)} className="gap-1"><LogOut className="h-3 w-3" /> Out</Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">Done</span>
                      )}
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
