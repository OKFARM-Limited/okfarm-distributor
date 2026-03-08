import { useState } from 'react';
import { useOutletContext } from '@/contexts/OutletContext';
import { useAssets, useVendors, useUpdateAsset } from '@/hooks/useSupabaseData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Package, Bike, Truck, Wrench, History, CalendarClock, AlertTriangle, MapPin, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ViewerBanner } from '@/components/ViewerGuard';
import { useViewerGuard } from '@/hooks/useViewerGuard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const iconMap: Record<string, any> = { push_cart: Package, bicycle: Bike, tricycle: Truck };

export default function AssetManagement() {
  const { selectedOutletId, isAllOutlets, getOutletName } = useOutletContext();
  const { data: assets = [], isLoading } = useAssets(isAllOutlets ? 'all' : selectedOutletId);
  const { data: vendors = [] } = useVendors(isAllOutlets ? 'all' : selectedOutletId);
  const updateAsset = useUpdateAsset();
  const { viewerProps } = useViewerGuard();
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleType, setScheduleType] = useState<'routine' | 'repair' | 'inspection'>('routine');
  const [scheduleDesc, setScheduleDesc] = useState('');

  const handleAssign = async (assetId: string, vendorId: string | 'unassign') => {
    try {
      await updateAsset.mutateAsync({
        id: assetId,
        assigned_to: vendorId === 'unassign' ? null : vendorId,
        status: vendorId === 'unassign' ? 'available' : 'assigned',
      });
      toast({ title: vendorId === 'unassign' ? 'Asset unassigned' : 'Asset assigned' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleScheduleMaintenance = async (assetId: string) => {
    if (!scheduleDate) return;
    const asset = assets.find((a: any) => a.id === assetId);
    const history = Array.isArray(asset?.maintenance_history) ? asset.maintenance_history : [];
    const newRecord = {
      id: `MNT-${Date.now()}`,
      date: scheduleDate, type: scheduleType,
      description: scheduleDesc || `Scheduled ${scheduleType}`,
      cost: 0, performedBy: 'Pending',
    };
    try {
      await updateAsset.mutateAsync({
        id: assetId,
        next_maintenance_date: scheduleDate,
        maintenance_history: [newRecord, ...history],
        status: 'maintenance',
      });
      toast({ title: 'Maintenance Scheduled' });
      setScheduleOpen(false); setScheduleDate(''); setScheduleDesc('');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  if (isLoading) return <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  const upcomingMaintenance = assets
    .filter((a: any) => a.next_maintenance_date && new Date(a.next_maintenance_date) <= new Date(Date.now() + 7 * 86400000))
    .sort((a: any, b: any) => new Date(a.next_maintenance_date).getTime() - new Date(b.next_maintenance_date).getTime());

  const stats = {
    total: assets.length,
    available: assets.filter((a: any) => a.status === 'available').length,
    assigned: assets.filter((a: any) => a.status === 'assigned').length,
    maintenance: assets.filter((a: any) => a.status === 'maintenance').length,
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <ViewerBanner />
      <div>
        <h1 className="text-2xl font-bold">Asset Management</h1>
        {!isAllOutlets && <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{getOutletName(selectedOutletId)}</p>}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Assets', value: stats.total, color: 'text-primary' },
          { label: 'Available', value: stats.available, color: 'text-primary' },
          { label: 'Assigned', value: stats.assigned, color: 'text-primary' },
          { label: 'Maintenance', value: stats.maintenance, color: 'text-primary' },
        ].map(s => (
          <Card key={s.label}><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-2xl font-bold ${s.color}`}>{s.value}</p></CardContent></Card>
        ))}
      </div>

      {upcomingMaintenance.length > 0 && (
        <div className="flex items-start gap-2 rounded-lg bg-warning/10 border border-warning/30 p-4">
          <CalendarClock className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-sm">Upcoming Maintenance (next 7 days)</p>
            <p className="text-xs text-muted-foreground mt-1">{upcomingMaintenance.map((a: any) => `${a.name} (${a.next_maintenance_date})`).join(' • ')}</p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">All Assets</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Outlet</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Next Maintenance</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.map((a: any) => {
                const Icon = iconMap[a.type] || Package;
                const isOverdue = a.next_maintenance_date && new Date(a.next_maintenance_date) <= new Date();
                return (
                  <TableRow key={a.id}>
                    <TableCell className="font-mono text-xs">{a.asset_code}</TableCell>
                    <TableCell className="flex items-center gap-2"><Icon className="h-4 w-4 text-muted-foreground" />{a.name}</TableCell>
                    <TableCell className="capitalize">{a.type.replace('_', ' ')}</TableCell>
                    <TableCell className="text-xs">{a.outlets?.name || getOutletName(a.outlet_id)}</TableCell>
                    <TableCell><Badge variant={a.condition === 'good' ? 'default' : a.condition === 'fair' ? 'secondary' : 'destructive'}>{a.condition}</Badge></TableCell>
                    <TableCell><Badge variant={a.status === 'available' ? 'outline' : a.status === 'assigned' ? 'default' : 'secondary'}>{a.status}</Badge></TableCell>
                    <TableCell>
                      <span className={isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                        {isOverdue && <AlertTriangle className="h-3 w-3 inline mr-1" />}{a.next_maintenance_date || '—'}
                      </span>
                    </TableCell>
                    <TableCell>{a.vendors?.name || '—'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Select value={a.assigned_to || 'unassign'} onValueChange={val => handleAssign(a.id, val)}>
                          <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unassign">Unassign</SelectItem>
                            {vendors.filter((v: any) => v.status === 'active').map((v: any) => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <Dialog open={scheduleOpen && selectedAsset?.id === a.id} onOpenChange={open => { setScheduleOpen(open); if (open) setSelectedAsset(a); }}>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => { setSelectedAsset(a); setScheduleOpen(true); }}><Wrench className="h-4 w-4" /></Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader><DialogTitle>Schedule Maintenance — {a.name}</DialogTitle></DialogHeader>
                            <div className="space-y-4 pt-2">
                              <div className="space-y-2"><Label>Date</Label><Input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} /></div>
                              <div className="space-y-2">
                                <Label>Type</Label>
                                <Select value={scheduleType} onValueChange={v => setScheduleType(v as any)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="routine">Routine</SelectItem><SelectItem value="repair">Repair</SelectItem><SelectItem value="inspection">Inspection</SelectItem></SelectContent></Select>
                              </div>
                              <div className="space-y-2"><Label>Description</Label><Input value={scheduleDesc} onChange={e => setScheduleDesc(e.target.value)} placeholder="What needs to be done..." /></div>
                              <Button onClick={() => handleScheduleMaintenance(a.id)} disabled={!scheduleDate} className="w-full">Schedule</Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
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
