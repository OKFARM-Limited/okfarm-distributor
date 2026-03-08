import { useState } from 'react';
import { outlets as defaultOutlets, Outlet } from '@/contexts/OutletContext';
import { vendors, assets, salesRecords, getOutletName } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Building2, Plus, Users, Package, DollarSign, Edit } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function OutletManagement() {
  const [outletList, setOutletList] = useState<Outlet[]>(defaultOutlets);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editOutlet, setEditOutlet] = useState<Outlet | null>(null);
  const [form, setForm] = useState({ name: '', shortCode: '', address: '', manager: '', phone: '', description: '' });

  const handleSave = () => {
    if (!form.name || !form.shortCode) { toast({ title: 'Error', description: 'Name and short code required.' }); return; }
    if (editOutlet) {
      setOutletList(prev => prev.map(o => o.id === editOutlet.id ? { ...o, ...form } : o));
      toast({ title: 'Outlet Updated', description: `${form.name} has been updated.` });
    } else {
      const id = form.shortCode.toLowerCase().replace(/\s/g, '-');
      setOutletList(prev => [...prev, { id, ...form, status: 'active' }]);
      toast({ title: 'Outlet Added', description: `${form.name} has been created.` });
    }
    setDialogOpen(false); setEditOutlet(null);
    setForm({ name: '', shortCode: '', address: '', manager: '', phone: '', description: '' });
  };

  const openEdit = (o: Outlet) => {
    setEditOutlet(o);
    setForm({ name: o.name, shortCode: o.shortCode, address: o.address, manager: o.manager, phone: o.phone, description: o.description });
    setDialogOpen(true);
  };

  const openAdd = () => {
    setEditOutlet(null);
    setForm({ name: '', shortCode: '', address: '', manager: '', phone: '', description: '' });
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Outlets Management</h1>
          <p className="text-sm text-muted-foreground">{outletList.length} outlets configured</p>
        </div>
        <Button onClick={openAdd}><Plus className="h-4 w-4 mr-1" /> Add Outlet</Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card><CardContent className="pt-4 text-center"><Building2 className="h-5 w-5 mx-auto text-primary mb-1" /><p className="text-2xl font-bold">{outletList.filter(o => o.status === 'active').length}</p><p className="text-xs text-muted-foreground">Active Outlets</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><Users className="h-5 w-5 mx-auto text-secondary mb-1" /><p className="text-2xl font-bold">{vendors.length}</p><p className="text-xs text-muted-foreground">Total Vendors</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><Package className="h-5 w-5 mx-auto text-warning mb-1" /><p className="text-2xl font-bold">{assets.length}</p><p className="text-xs text-muted-foreground">Total Assets</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><DollarSign className="h-5 w-5 mx-auto text-success mb-1" /><p className="text-2xl font-bold">₦{salesRecords.filter(s => s.date === new Date().toISOString().split('T')[0]).reduce((s, r) => s + r.totalValue, 0).toLocaleString()}</p><p className="text-xs text-muted-foreground">Today's Sales</p></CardContent></Card>
      </div>

      {/* Outlets Table */}
      <Card>
        <CardHeader><CardTitle className="text-base">All Outlets</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Vendors</TableHead>
                <TableHead>Assets</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {outletList.map(o => {
                const vendorCount = vendors.filter(v => v.outletId === o.id).length;
                const assetCount = assets.filter(a => a.outletId === o.id).length;
                return (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">{o.name}</TableCell>
                    <TableCell><Badge variant="outline">{o.shortCode}</Badge></TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{o.address}</TableCell>
                    <TableCell>{o.manager}</TableCell>
                    <TableCell>{vendorCount}</TableCell>
                    <TableCell>{assetCount}</TableCell>
                    <TableCell><Badge variant={o.status === 'active' ? 'default' : 'secondary'}>{o.status}</Badge></TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost" onClick={() => openEdit(o)}><Edit className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editOutlet ? 'Edit Outlet' : 'Add New Outlet'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Epe" /></div>
              <div className="space-y-2"><Label>Short Code</Label><Input value={form.shortCode} onChange={e => setForm(f => ({ ...f, shortCode: e.target.value.toUpperCase() }))} placeholder="e.g. EPE" /></div>
            </div>
            <div className="space-y-2"><Label>Address</Label><Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Manager</Label><Input value={form.manager} onChange={e => setForm(f => ({ ...f, manager: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
            </div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} /></div>
            <Button onClick={handleSave} className="w-full">{editOutlet ? 'Update Outlet' : 'Create Outlet'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
