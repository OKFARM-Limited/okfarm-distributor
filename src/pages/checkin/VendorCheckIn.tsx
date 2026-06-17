import { useState } from 'react';
import { useVendors, useCheckIns, useCreateCheckIn, useUpdateCheckIn } from '@/hooks/useSupabaseData';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { Clock, LogIn, LogOut, Search, UserCheck, UserX, Loader2 } from 'lucide-react';
import { ViewerBanner } from '@/components/ViewerGuard';
import { useViewerGuard } from '@/hooks/useViewerGuard';

export default function VendorCheckIn() {
  const today = new Date().toISOString().split('T')[0];
  const [search, setSearch] = useState('');
  const { data: allVendors = [], isLoading: vLoading } = useVendors('all');
  const { data: todayCheckIns = [], isLoading: cLoading } = useCheckIns(today);
  const createCheckIn = useCreateCheckIn();
  const updateCheckIn = useUpdateCheckIn();
  const { viewerProps } = useViewerGuard();

  const activeVendors = allVendors.filter((v) => v.status === 'active');
  const checkedInIds = todayCheckIns.map((r) => r.vendor_id);
  const checkedOutIds = todayCheckIns.filter((r) => r.check_out_time).map((r) => r.vendor_id);

  const filtered = activeVendors.filter((v) =>
    v.name.toLowerCase().includes(search.toLowerCase()) || v.vendor_code.toLowerCase().includes(search.toLowerCase())
  );

  const handleCheckIn = (vendorId: string) => {
    const vendor = allVendors.find((v) => v.id === vendorId);
    createCheckIn.mutate(
      { vendor_id: vendorId, outlet_id: vendor?.outlet_id || null, date: today, check_in_time: new Date().toISOString() },
      {
        onSuccess: () => toast({ title: '✅ Checked In', description: `${vendor?.name} checked in` }),
        onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
      }
    );
  };

  const handleCheckOut = (vendorId: string) => {
    const record = todayCheckIns.find((r) => r.vendor_id === vendorId && !r.check_out_time);
    if (!record) return;
    const vendor = allVendors.find((v) => v.id === vendorId);
    updateCheckIn.mutate(
      { id: record.id, check_out_time: new Date().toISOString() },
      {
        onSuccess: () => toast({ title: '👋 Checked Out', description: `${vendor?.name} checked out` }),
        onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
      }
    );
  };

  if (vLoading || cLoading) return <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-5 animate-fade-in">
      <ViewerBanner />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Vendor Check-In</h1>
          <p className="text-muted-foreground text-sm">Manage daily vendor attendance, check-ins and check-outs.</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="pt-4 pb-3 px-4">
          <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-emerald-50 text-emerald-600 mb-2"><UserCheck className="h-5 w-5" /></div>
          <p className="text-xs text-muted-foreground">Checked In</p>
          <p className="font-bold text-xl">{checkedInIds.length}</p>
          <p className="text-xs mt-0.5"><span className="text-emerald-600 font-medium">{activeVendors.length > 0 ? Math.round((checkedInIds.length / activeVendors.length) * 100) : 0}%</span> <span className="text-muted-foreground">of total</span></p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 pb-3 px-4">
          <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-blue-50 text-blue-600 mb-2"><LogOut className="h-5 w-5" /></div>
          <p className="text-xs text-muted-foreground">Checked Out</p>
          <p className="font-bold text-xl">{checkedOutIds.length}</p>
          <p className="text-xs mt-0.5"><span className="text-muted-foreground">completed</span></p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 pb-3 px-4">
          <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-red-50 text-red-600 mb-2"><UserX className="h-5 w-5" /></div>
          <p className="text-xs text-muted-foreground">Absent</p>
          <p className="font-bold text-xl">{activeVendors.length - checkedInIds.length}</p>
          <p className="text-xs mt-0.5"><span className="text-red-500 font-medium">{activeVendors.length > 0 ? Math.round(((activeVendors.length - checkedInIds.length) / activeVendors.length) * 100) : 0}%</span> <span className="text-muted-foreground">of total</span></p>
        </CardContent></Card>
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
              {filtered.map((v) => {
                const record = todayCheckIns.find((r) => r.vendor_id === v.id);
                const isIn = checkedInIds.includes(v.id);
                const isOut = checkedOutIds.includes(v.id);
                const inTime = record?.check_in_time ? new Date(record.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
                const outTime = record?.check_out_time ? new Date(record.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
                return (
                  <TableRow key={v.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8"><AvatarImage src={v.photo_url} /><AvatarFallback>{v.name[0]}</AvatarFallback></Avatar>
                        <div><p className="font-medium text-sm">{v.name}</p><p className="text-xs text-muted-foreground">{v.vendor_code}</p></div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{v.territory}</TableCell>
                    <TableCell className="text-sm">{inTime}</TableCell>
                    <TableCell className="text-sm">{outTime}</TableCell>
                    <TableCell>
                      <Badge variant={isOut ? 'secondary' : isIn ? 'default' : 'outline'} className="text-xs">
                        {isOut ? 'Returned' : isIn ? 'Out Selling' : 'Absent'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {!isIn ? (
                        <Button size="sm" onClick={() => handleCheckIn(v.id)} className="gap-1" {...viewerProps}><LogIn className="h-3 w-3" /> In</Button>
                      ) : !isOut ? (
                        <Button size="sm" variant="outline" onClick={() => handleCheckOut(v.id)} className="gap-1" {...viewerProps}><LogOut className="h-3 w-3" /> Out</Button>
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
