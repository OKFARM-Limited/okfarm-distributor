import { useState } from 'react';
import { useOutletContext } from '@/contexts/OutletContext';
import { useDepots, useUpsertDepot, useVendors, useAssets } from '@/hooks/useSupabaseData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, MapPin, Users, Package, Plus, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ViewerBanner } from '@/components/ViewerGuard';
import { useViewerGuard } from '@/hooks/useViewerGuard';

export default function DepotManagement() {
  const { selectedOutletId, isAllOutlets, allOutlets } = useOutletContext();
  const { data: depots = [], isLoading } = useDepots(isAllOutlets ? 'all' : selectedOutletId);
  const { data: allVendors = [] } = useVendors('all');
  const { data: allAssets = [] } = useAssets('all');
  const upsertDepot = useUpsertDepot();
  const { viewerProps } = useViewerGuard();
  const [activeDepot, setActiveDepot] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newDepot, setNewDepot] = useState({ name: '', address: '', territory: '', manager: '', phone: '', fridge_capacity: '', outlet_id: '', depot_code: '' });

  const totalVendors = allVendors.length;
  const totalAssets = allAssets.length;

  const handleAddDepot = async () => {
    if (!newDepot.name || !newDepot.address || !newDepot.depot_code) return;
    try {
      await upsertDepot.mutateAsync({
        ...newDepot,
        fridge_capacity: parseInt(newDepot.fridge_capacity) || 200,
        outlet_id: newDepot.outlet_id || null,
        status: 'active',
      });
      setDialogOpen(false);
      setNewDepot({ name: '', address: '', territory: '', manager: '', phone: '', fridge_capacity: '', outlet_id: '', depot_code: '' });
      toast({ title: 'Depot Added', description: `${newDepot.name} has been registered.` });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  if (isLoading) return <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  const active = depots.find((d: any) => d.id === activeDepot) || depots[0];

  return (
    <div className="space-y-6">
      <ViewerBanner />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Depot Management</h1>
          <p className="text-muted-foreground">Manage multiple depot locations</p>
        </div>
        <div className="flex gap-2">
          {depots.length > 0 && (
            <Select value={activeDepot || depots[0]?.id} onValueChange={setActiveDepot}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="Active Depot" /></SelectTrigger>
              <SelectContent>
                {depots.filter((d: any) => d.status === 'active').map((d: any) => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Add Depot</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Register New Depot</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Code</Label><Input value={newDepot.depot_code} onChange={e => setNewDepot({ ...newDepot, depot_code: e.target.value })} placeholder="DEP-006" /></div>
                <div><Label>Name</Label><Input value={newDepot.name} onChange={e => setNewDepot({ ...newDepot, name: e.target.value })} /></div>
                <div><Label>Address</Label><Input value={newDepot.address} onChange={e => setNewDepot({ ...newDepot, address: e.target.value })} /></div>
                <div><Label>Territory</Label><Input value={newDepot.territory} onChange={e => setNewDepot({ ...newDepot, territory: e.target.value })} /></div>
                <div>
                  <Label>Outlet</Label>
                  <Select value={newDepot.outlet_id} onValueChange={v => setNewDepot({ ...newDepot, outlet_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select outlet" /></SelectTrigger>
                    <SelectContent>{allOutlets.map(o => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Manager</Label><Input value={newDepot.manager} onChange={e => setNewDepot({ ...newDepot, manager: e.target.value })} /></div>
                <div><Label>Phone</Label><Input value={newDepot.phone} onChange={e => setNewDepot({ ...newDepot, phone: e.target.value })} /></div>
                <div><Label>Fridge Capacity</Label><Input type="number" value={newDepot.fridge_capacity} onChange={e => setNewDepot({ ...newDepot, fridge_capacity: e.target.value })} /></div>
              </div>
              <DialogFooter><Button onClick={handleAddDepot} disabled={upsertDepot.isPending}>{upsertDepot.isPending ? 'Saving...' : 'Register Depot'}</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4 flex items-center gap-3"><Building2 className="h-8 w-8 text-primary" /><div><p className="text-xs text-muted-foreground">Active Depots</p><p className="text-xl font-bold">{depots.filter((d: any) => d.status === 'active').length}</p></div></CardContent></Card>
        <Card><CardContent className="pt-4 flex items-center gap-3"><Users className="h-8 w-8 text-primary" /><div><p className="text-xs text-muted-foreground">Total Vendors</p><p className="text-xl font-bold">{totalVendors}</p></div></CardContent></Card>
        <Card><CardContent className="pt-4 flex items-center gap-3"><Package className="h-8 w-8 text-primary" /><div><p className="text-xs text-muted-foreground">Total Assets</p><p className="text-xl font-bold">{totalAssets}</p></div></CardContent></Card>
        <Card><CardContent className="pt-4 flex items-center gap-3"><MapPin className="h-8 w-8 text-primary" /><div><p className="text-xs text-muted-foreground">Territories</p><p className="text-xl font-bold">{new Set(depots.map((d: any) => d.territory).filter(Boolean)).size}</p></div></CardContent></Card>
      </div>

      {active && (
        <Card className="border-primary">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary" />Current Active Depot: {active.name}</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div><span className="text-muted-foreground">Address:</span> <span className="font-medium text-foreground">{active.address}</span></div>
              <div><span className="text-muted-foreground">Manager:</span> <span className="font-medium text-foreground">{active.manager}</span></div>
              <div><span className="text-muted-foreground">Vendors:</span> <span className="font-medium text-foreground">{active.vendor_count}</span></div>
              <div><span className="text-muted-foreground">Fridge Capacity:</span> <span className="font-medium text-foreground">{active.fridge_capacity} units</span></div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">All Depot Locations</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Depot</TableHead>
                <TableHead>Territory</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Vendors</TableHead>
                <TableHead>Assets</TableHead>
                <TableHead>Fridge Cap.</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {depots.map((d: any) => (
                <TableRow key={d.id} className={d.id === (activeDepot || depots[0]?.id) ? 'bg-primary/5' : ''}>
                  <TableCell>
                    <div><span className="font-medium text-foreground">{d.name}</span><p className="text-xs text-muted-foreground">{d.address}</p></div>
                  </TableCell>
                  <TableCell>{d.territory}</TableCell>
                  <TableCell>{d.manager}</TableCell>
                  <TableCell>{d.vendor_count}</TableCell>
                  <TableCell>{d.asset_count}</TableCell>
                  <TableCell>{d.fridge_capacity}</TableCell>
                  <TableCell><Badge variant={d.status === 'active' ? 'default' : 'secondary'}>{d.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
