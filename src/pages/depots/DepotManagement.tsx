import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, MapPin, Users, Package, Plus, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Depot {
  id: string;
  name: string;
  address: string;
  territory: string;
  vendorCount: number;
  assetCount: number;
  fridgeCapacity: number;
  status: 'active' | 'inactive';
  manager: string;
  phone: string;
}

const initialDepots: Depot[] = [
  { id: 'DEP-001', name: 'Ikeja Main Depot', address: '45 Allen Avenue, Ikeja, Lagos', territory: 'Ikeja', vendorCount: 12, assetCount: 8, fridgeCapacity: 500, status: 'active', manager: 'Adebayo Fashola', phone: '+2348012345678' },
  { id: 'DEP-002', name: 'Lekki Distribution Point', address: '12 Admiralty Way, Lekki Phase 1', territory: 'Lekki', vendorCount: 8, assetCount: 5, fridgeCapacity: 300, status: 'active', manager: 'Chidinma Okafor', phone: '+2348023456789' },
  { id: 'DEP-003', name: 'Surulere Hub', address: '88 Bode Thomas Street, Surulere', territory: 'Surulere', vendorCount: 10, assetCount: 7, fridgeCapacity: 400, status: 'active', manager: 'Emeka Chukwu', phone: '+2348034567890' },
  { id: 'DEP-004', name: 'Ikorodu Satellite', address: '15 Lagos Road, Ikorodu', territory: 'Ikorodu', vendorCount: 5, assetCount: 3, fridgeCapacity: 200, status: 'inactive', manager: 'Funke Balogun', phone: '+2348045678901' },
];

export default function DepotManagement() {
  const [depots, setDepots] = useState(initialDepots);
  const [activeDepot, setActiveDepot] = useState('DEP-001');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newDepot, setNewDepot] = useState({ name: '', address: '', territory: '', manager: '', phone: '', fridgeCapacity: '' });
  const { toast } = useToast();

  const totalVendors = depots.filter(d => d.status === 'active').reduce((s, d) => s + d.vendorCount, 0);
  const totalAssets = depots.filter(d => d.status === 'active').reduce((s, d) => s + d.assetCount, 0);

  const handleAddDepot = () => {
    if (!newDepot.name || !newDepot.address) return;
    const depot: Depot = {
      id: `DEP-${String(depots.length + 1).padStart(3, '0')}`,
      ...newDepot,
      vendorCount: 0,
      assetCount: 0,
      fridgeCapacity: parseInt(newDepot.fridgeCapacity) || 200,
      status: 'active',
    };
    setDepots([...depots, depot]);
    setDialogOpen(false);
    setNewDepot({ name: '', address: '', territory: '', manager: '', phone: '', fridgeCapacity: '' });
    toast({ title: 'Depot Added', description: `${depot.name} has been registered.` });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Depot Management</h1>
          <p className="text-muted-foreground">Manage multiple depot locations</p>
        </div>
        <div className="flex gap-2">
          <Select value={activeDepot} onValueChange={setActiveDepot}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Active Depot" /></SelectTrigger>
            <SelectContent>
              {depots.filter(d => d.status === 'active').map(d => (
                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Add Depot</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Register New Depot</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Name</Label><Input value={newDepot.name} onChange={e => setNewDepot({ ...newDepot, name: e.target.value })} placeholder="Depot name" /></div>
                <div><Label>Address</Label><Input value={newDepot.address} onChange={e => setNewDepot({ ...newDepot, address: e.target.value })} placeholder="Full address" /></div>
                <div><Label>Territory</Label><Input value={newDepot.territory} onChange={e => setNewDepot({ ...newDepot, territory: e.target.value })} placeholder="Territory" /></div>
                <div><Label>Manager</Label><Input value={newDepot.manager} onChange={e => setNewDepot({ ...newDepot, manager: e.target.value })} placeholder="Manager name" /></div>
                <div><Label>Phone</Label><Input value={newDepot.phone} onChange={e => setNewDepot({ ...newDepot, phone: e.target.value })} placeholder="+234..." /></div>
                <div><Label>Fridge Capacity (units)</Label><Input type="number" value={newDepot.fridgeCapacity} onChange={e => setNewDepot({ ...newDepot, fridgeCapacity: e.target.value })} placeholder="200" /></div>
              </div>
              <DialogFooter><Button onClick={handleAddDepot}>Register Depot</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4 flex items-center gap-3">
          <Building2 className="h-8 w-8 text-primary" />
          <div><p className="text-xs text-muted-foreground">Active Depots</p><p className="text-xl font-bold">{depots.filter(d => d.status === 'active').length}</p></div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 flex items-center gap-3">
          <Users className="h-8 w-8 text-blue-500" />
          <div><p className="text-xs text-muted-foreground">Total Vendors</p><p className="text-xl font-bold">{totalVendors}</p></div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 flex items-center gap-3">
          <Package className="h-8 w-8 text-orange-500" />
          <div><p className="text-xs text-muted-foreground">Total Assets</p><p className="text-xl font-bold">{totalAssets}</p></div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 flex items-center gap-3">
          <MapPin className="h-8 w-8 text-green-500" />
          <div><p className="text-xs text-muted-foreground">Territories</p><p className="text-xl font-bold">{new Set(depots.map(d => d.territory)).size}</p></div>
        </CardContent></Card>
      </div>

      {/* Active depot highlight */}
      {(() => {
        const active = depots.find(d => d.id === activeDepot);
        if (!active) return null;
        return (
          <Card className="border-primary">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary" />Current Active Depot: {active.name}</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div><span className="text-muted-foreground">Address:</span> <span className="font-medium text-foreground">{active.address}</span></div>
                <div><span className="text-muted-foreground">Manager:</span> <span className="font-medium text-foreground">{active.manager}</span></div>
                <div><span className="text-muted-foreground">Vendors:</span> <span className="font-medium text-foreground">{active.vendorCount}</span></div>
                <div><span className="text-muted-foreground">Fridge Capacity:</span> <span className="font-medium text-foreground">{active.fridgeCapacity} units</span></div>
              </div>
            </CardContent>
          </Card>
        );
      })()}

      {/* All depots table */}
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
              {depots.map(d => (
                <TableRow key={d.id} className={d.id === activeDepot ? 'bg-primary/5' : ''}>
                  <TableCell>
                    <div><span className="font-medium text-foreground">{d.name}</span><p className="text-xs text-muted-foreground">{d.address}</p></div>
                  </TableCell>
                  <TableCell>{d.territory}</TableCell>
                  <TableCell>{d.manager}</TableCell>
                  <TableCell>{d.vendorCount}</TableCell>
                  <TableCell>{d.assetCount}</TableCell>
                  <TableCell>{d.fridgeCapacity}</TableCell>
                  <TableCell>
                    <Badge variant={d.status === 'active' ? 'default' : 'secondary'}>{d.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
