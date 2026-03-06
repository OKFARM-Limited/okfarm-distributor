import { useState } from 'react';
import { assets as mockAssets, vendors, Asset } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Package, Bike, Truck, Wrench, History, CalendarClock, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const iconMap = { push_cart: Package, bicycle: Bike, tricycle: Truck };

export default function AssetManagement() {
  const [assetList, setAssetList] = useState<Asset[]>(mockAssets);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleType, setScheduleType] = useState<'routine' | 'repair' | 'inspection'>('routine');
  const [scheduleDesc, setScheduleDesc] = useState('');

  const handleAssign = (assetId: string, vendorId: string | 'unassign') => {
    setAssetList(prev => prev.map(a => {
      if (a.id !== assetId) return a;
      if (vendorId === 'unassign') return { ...a, assignedTo: null, status: 'available' as const };
      return { ...a, assignedTo: vendorId, status: 'assigned' as const };
    }));
    toast({ title: vendorId === 'unassign' ? 'Asset unassigned' : 'Asset assigned', description: `${assetId} updated.` });
  };

  const handleScheduleMaintenance = (assetId: string) => {
    if (!scheduleDate) return;
    setAssetList(prev => prev.map(a => {
      if (a.id !== assetId) return a;
      const newRecord = {
        id: `MNT-${a.id}-${a.maintenanceHistory.length + 1}`,
        date: scheduleDate,
        type: scheduleType,
        description: scheduleDesc || `Scheduled ${scheduleType}`,
        cost: 0,
        performedBy: 'Pending',
      };
      return {
        ...a,
        nextMaintenanceDate: scheduleDate,
        maintenanceHistory: [newRecord, ...a.maintenanceHistory],
        status: 'maintenance' as const,
      };
    }));
    toast({ title: 'Maintenance Scheduled', description: `${assetId} scheduled for ${scheduleType} on ${scheduleDate}` });
    setScheduleOpen(false);
    setScheduleDate('');
    setScheduleDesc('');
  };

  const upcomingMaintenance = assetList
    .filter(a => new Date(a.nextMaintenanceDate) <= new Date(Date.now() + 7 * 86400000))
    .sort((a, b) => new Date(a.nextMaintenanceDate).getTime() - new Date(b.nextMaintenanceDate).getTime());

  const stats = {
    total: assetList.length,
    available: assetList.filter(a => a.status === 'available').length,
    assigned: assetList.filter(a => a.status === 'assigned').length,
    maintenance: assetList.filter(a => a.status === 'maintenance').length,
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="text-2xl font-bold">Asset Management</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Assets', value: stats.total, color: 'text-primary' },
          { label: 'Available', value: stats.available, color: 'text-success' },
          { label: 'Assigned', value: stats.assigned, color: 'text-info' },
          { label: 'Maintenance', value: stats.maintenance, color: 'text-warning' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="pt-4 text-center">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upcoming Maintenance Alert */}
      {upcomingMaintenance.length > 0 && (
        <div className="flex items-start gap-2 rounded-lg bg-warning/10 border border-warning/30 p-4">
          <CalendarClock className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-sm">Upcoming Maintenance (next 7 days)</p>
            <p className="text-xs text-muted-foreground mt-1">
              {upcomingMaintenance.map(a => `${a.name} (${a.nextMaintenanceDate})`).join(' • ')}
            </p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">All Assets</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Next Maintenance</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assetList.map(a => {
                const Icon = iconMap[a.type];
                const isOverdue = new Date(a.nextMaintenanceDate) <= new Date();
                return (
                  <TableRow key={a.id}>
                    <TableCell className="font-mono text-xs">{a.id}</TableCell>
                    <TableCell className="flex items-center gap-2"><Icon className="h-4 w-4 text-muted-foreground" />{a.name}</TableCell>
                    <TableCell className="capitalize">{a.type.replace('_', ' ')}</TableCell>
                    <TableCell>
                      <Badge variant={a.condition === 'good' ? 'default' : a.condition === 'fair' ? 'secondary' : 'destructive'}>{a.condition}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={a.status === 'available' ? 'outline' : a.status === 'assigned' ? 'default' : 'secondary'}>{a.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className={isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                        {isOverdue && <AlertTriangle className="h-3 w-3 inline mr-1" />}
                        {a.nextMaintenanceDate}
                      </span>
                    </TableCell>
                    <TableCell>{a.assignedTo ? vendors.find(v => v.id === a.assignedTo)?.name || a.assignedTo : '—'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Select value={a.assignedTo || 'unassign'} onValueChange={val => handleAssign(a.id, val)}>
                          <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unassign">Unassign</SelectItem>
                            {vendors.filter(v => v.status === 'active').map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setSelectedAsset(a)}>
                              <History className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                            <DialogHeader><DialogTitle>{a.name} — History</DialogTitle></DialogHeader>
                            <Tabs defaultValue="maintenance">
                              <TabsList className="w-full">
                                <TabsTrigger value="maintenance" className="flex-1">Maintenance</TabsTrigger>
                                <TabsTrigger value="condition" className="flex-1">Condition</TabsTrigger>
                              </TabsList>
                              <TabsContent value="maintenance" className="space-y-2 mt-3">
                                {a.maintenanceHistory.length === 0 ? (
                                  <p className="text-sm text-muted-foreground text-center py-4">No maintenance records</p>
                                ) : a.maintenanceHistory.map(m => (
                                  <div key={m.id} className="border rounded-lg p-3 space-y-1">
                                    <div className="flex items-center justify-between">
                                      <Badge variant="outline" className="capitalize">{m.type}</Badge>
                                      <span className="text-xs text-muted-foreground">{m.date}</span>
                                    </div>
                                    <p className="text-sm">{m.description}</p>
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                      <span>By: {m.performedBy}</span>
                                      <span>Cost: ₦{m.cost.toLocaleString()}</span>
                                    </div>
                                  </div>
                                ))}
                              </TabsContent>
                              <TabsContent value="condition" className="space-y-2 mt-3">
                                {a.conditionHistory.map((c, idx) => (
                                  <div key={idx} className="flex items-start gap-3 border rounded-lg p-3">
                                    <div className="flex flex-col items-center">
                                      <Badge variant={c.condition === 'good' ? 'default' : c.condition === 'fair' ? 'secondary' : 'destructive'} className="text-[10px]">
                                        {c.condition}
                                      </Badge>
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-sm">{c.note}</p>
                                      <p className="text-xs text-muted-foreground mt-1">{c.date}</p>
                                    </div>
                                  </div>
                                ))}
                              </TabsContent>
                            </Tabs>
                          </DialogContent>
                        </Dialog>
                        <Dialog open={scheduleOpen && selectedAsset?.id === a.id} onOpenChange={open => { setScheduleOpen(open); if (open) setSelectedAsset(a); }}>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => { setSelectedAsset(a); setScheduleOpen(true); }}>
                              <Wrench className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader><DialogTitle>Schedule Maintenance — {a.name}</DialogTitle></DialogHeader>
                            <div className="space-y-4 pt-2">
                              <div className="space-y-2">
                                <Label>Date</Label>
                                <Input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} />
                              </div>
                              <div className="space-y-2">
                                <Label>Type</Label>
                                <Select value={scheduleType} onValueChange={v => setScheduleType(v as any)}>
                                  <SelectTrigger><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="routine">Routine</SelectItem>
                                    <SelectItem value="repair">Repair</SelectItem>
                                    <SelectItem value="inspection">Inspection</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>Description</Label>
                                <Input value={scheduleDesc} onChange={e => setScheduleDesc(e.target.value)} placeholder="What needs to be done..." />
                              </div>
                              <Button onClick={() => handleScheduleMaintenance(a.id)} disabled={!scheduleDate} className="w-full">
                                Schedule
                              </Button>
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
