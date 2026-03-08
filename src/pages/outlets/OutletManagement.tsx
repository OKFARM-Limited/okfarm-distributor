import { useState } from 'react';
import { useOutletContext } from '@/contexts/OutletContext';
import { useOutlets, useUpsertOutlet, useVendors, useAssets, DbOutlet } from '@/hooks/useSupabaseData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Building2, Plus, Users, Package, Edit, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ViewerBanner } from '@/components/ViewerGuard';
import { useViewerGuard } from '@/hooks/useViewerGuard';

export default function OutletManagement() {
  const { data: outlets = [], isLoading } = useOutlets();
  const { data: allVendors = [] } = useVendors('all');
  const { data: allAssets = [] } = useAssets('all');
  const upsertOutlet = useUpsertOutlet();
  const { viewerProps } = useViewerGuard();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editOutlet, setEditOutlet] = useState<DbOutlet | null>(null);
  const [form, setForm] = useState({ name: '', short_code: '', address: '', manager: '', phone: '', description: '' });

  const handleSave = async () => {
    if (!form.name || !form.short_code) { toast({ title: 'Error', description: 'Name and short code required.', variant: 'destructive' }); return; }
    try {
      if (editOutlet) {
        await upsertOutlet.mutateAsync({ id: editOutlet.id, ...form });
        toast({ title: 'Outlet Updated', description: `${form.name} has been updated.` });
      } else {
        await upsertOutlet.mutateAsync({ ...form, status: 'active' });
        toast({ title: 'Outlet Added', description: `${form.name} has been created.` });
      }
      setDialogOpen(false); setEditOutlet(null);
      setForm({ name: '', short_code: '', address: '', manager: '', phone: '', description: '' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const openEdit = (o: DbOutlet) => {
    setEditOutlet(o);
    setForm({ name: o.name, short_code: o.short_code, address: o.address || '', manager: o.manager || '', phone: o.phone || '', description: o.description || '' });
    setDialogOpen(true);
  };

  const openAdd = () => {
    setEditOutlet(null);
    setForm({ name: '', short_code: '', address: '', manager: '', phone: '', description: '' });
    setDialogOpen(true);
  };

  if (isLoading) return <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Outlets Management</h1>
          <p className="text-sm text-muted-foreground">{outlets.length} outlets configured</p>
        </div>
        <Button onClick={openAdd}><Plus className="h-4 w-4 mr-1" /> Add Outlet</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card><CardContent className="pt-4 text-center"><Building2 className="h-5 w-5 mx-auto text-primary mb-1" /><p className="text-2xl font-bold">{outlets.filter(o => o.status === 'active').length}</p><p className="text-xs text-muted-foreground">Active Outlets</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><Users className="h-5 w-5 mx-auto text-primary mb-1" /><p className="text-2xl font-bold">{allVendors.length}</p><p className="text-xs text-muted-foreground">Total Vendors</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><Package className="h-5 w-5 mx-auto text-primary mb-1" /><p className="text-2xl font-bold">{allAssets.length}</p><p className="text-xs text-muted-foreground">Total Assets</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><Building2 className="h-5 w-5 mx-auto text-primary mb-1" /><p className="text-2xl font-bold">{outlets.length}</p><p className="text-xs text-muted-foreground">Total Outlets</p></CardContent></Card>
      </div>

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
              {outlets.map(o => {
                const vendorCount = allVendors.filter((v: any) => v.outlet_id === o.id).length;
                const assetCount = allAssets.filter((a: any) => a.outlet_id === o.id).length;
                return (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">{o.name}</TableCell>
                    <TableCell><Badge variant="outline">{o.short_code}</Badge></TableCell>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editOutlet ? 'Edit Outlet' : 'Add New Outlet'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Epe" /></div>
              <div className="space-y-2"><Label>Short Code</Label><Input value={form.short_code} onChange={e => setForm(f => ({ ...f, short_code: e.target.value.toUpperCase() }))} placeholder="e.g. EPE" /></div>
            </div>
            <div className="space-y-2"><Label>Address</Label><Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Manager</Label><Input value={form.manager} onChange={e => setForm(f => ({ ...f, manager: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
            </div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} /></div>
            <Button onClick={handleSave} className="w-full" disabled={upsertOutlet.isPending}>
              {upsertOutlet.isPending ? 'Saving...' : editOutlet ? 'Update Outlet' : 'Create Outlet'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
