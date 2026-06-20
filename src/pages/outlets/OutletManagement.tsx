import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useOutletContext } from '@/contexts/OutletContext';
import { useOutlets, useUpsertOutlet, useVendors, useAssets, DbOutlet } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Building2, Plus, Users, Package, Edit, Loader2, Download, Search,
  Filter, MapPin, Phone, User, MoreHorizontal, ChevronLeft, ChevronRight
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ViewerBanner } from '@/components/ViewerGuard';
import { useViewerGuard } from '@/hooks/useViewerGuard';
import { usePagination } from '@/hooks/usePagination';
import { ExportMenu } from '@/components/ExportMenu';
import { downloadCSV, generatePDFReport } from '@/lib/exportUtils';

export default function OutletManagement() {
  const { data: outlets = [], isLoading } = useOutlets();
  const { data: allVendors = [] } = useVendors('all');
  const { data: allAssets = [] } = useAssets('all');
  const upsertOutlet = useUpsertOutlet();
  const { viewerProps } = useViewerGuard();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editOutlet, setEditOutlet] = useState<DbOutlet | null>(null);
  const [form, setForm] = useState({ name: '', short_code: '', address: '', manager: '', phone: '', description: '' });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Load users with manager or admin role for the Manager dropdown
  const { data: managerUsers = [] } = useQuery({
    queryKey: ['manager-users'],
    queryFn: async () => {
      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('role', ['manager', 'admin']);
      if (!roles?.length) return [];
      const ids = roles.map(r => r.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, email')
        .in('user_id', ids);
      return (profiles ?? []).map(p => ({
        id: p.user_id,
        label: p.display_name || p.email || p.user_id,
      }));
    },
  });

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
    } catch (err: unknown) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
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

  const filtered = useMemo(() => {
    return outlets.filter(o => {
      const matchSearch = !search || o.name.toLowerCase().includes(search.toLowerCase()) || o.short_code.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || o.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [outlets, search, statusFilter]);

  const { paginatedItems, currentPage, totalPages, totalItems, goToPage, hasNextPage, hasPrevPage } = usePagination(filtered, 10);

  const kpiCards = [
    { label: 'Active Outlets', value: outlets.filter(o => o.status === 'active').length.toString(), icon: Building2, color: 'bg-blue-50 text-blue-600', trend: `${outlets.length} total`, trendLabel: '' },
    { label: 'Total Vendors', value: allVendors.length.toString(), icon: Users, color: 'bg-emerald-50 text-emerald-600', trend: 'across all outlets', trendLabel: '' },
    { label: 'Total Assets', value: allAssets.length.toString(), icon: Package, color: 'bg-amber-50 text-amber-600', trend: 'deployed', trendLabel: '' },
    { label: 'Total Outlets', value: outlets.length.toString(), icon: MapPin, color: 'bg-purple-50 text-purple-600', trend: '100%', trendLabel: 'operational' },
  ];

  if (isLoading) return <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-5 animate-fade-in">
      <ViewerBanner />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Outlets</h1>
          <p className="text-muted-foreground text-sm">Manage your distribution outlets, locations and staff assignments.</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportMenu
            label="Export"
            onExportCSV={() => {
              downloadCSV(
                [
                  { header: 'Name', key: 'name' },
                  { header: 'Code', key: 'short_code' },
                  { header: 'Address', key: 'address' },
                  { header: 'Manager', key: 'manager' },
                  { header: 'Phone', key: 'phone' },
                  { header: 'Status', key: 'status' },
                  { header: 'Vendors', key: 'vendor_count' },
                  { header: 'Assets', key: 'asset_count' },
                ],
                filtered.map(o => ({
                  ...o,
                  vendor_count: allVendors.filter(v => v.outlet_id === o.id).length,
                  asset_count: allAssets.filter(a => a.outlet_id === o.id).length,
                })),
                `outlets_${new Date().toISOString().split('T')[0]}.csv`,
              );
              toast({ title: 'CSV Downloaded', description: `${filtered.length} outlets exported.` });
            }}
            onExportPDF={() => {
              generatePDFReport({
                title: 'Outlet Directory Report',
                subtitle: `Generated ${new Date().toLocaleDateString()} — ${filtered.length} outlets`,
                filename: `outlets_${new Date().toISOString().split('T')[0]}.pdf`,
                orientation: 'landscape',
                columns: [
                  { header: 'Name', key: 'name' },
                  { header: 'Code', key: 'short_code' },
                  { header: 'Address', key: 'address' },
                  { header: 'Manager', key: 'manager' },
                  { header: 'Phone', key: 'phone' },
                  { header: 'Status', key: 'status' },
                  { header: 'Vendors', key: 'vendor_count', align: 'center' },
                  { header: 'Assets', key: 'asset_count', align: 'center' },
                ],
                data: filtered.map(o => ({
                  ...o,
                  vendor_count: allVendors.filter(v => v.outlet_id === o.id).length,
                  asset_count: allAssets.filter(a => a.outlet_id === o.id).length,
                })),
                summaryRows: [
                  { label: 'Total Outlets', value: filtered.length.toString() },
                  { label: 'Active', value: filtered.filter(o => o.status === 'active').length.toString() },
                ],
              });
              toast({ title: 'PDF Downloaded', description: `${filtered.length} outlets exported.` });
            }}
          />
          <Button size="sm" onClick={openAdd} {...viewerProps}><Plus className="h-4 w-4 mr-1.5" />Add Outlet</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map(kpi => (
          <Card key={kpi.label}>
            <CardContent className="pt-4 pb-3 px-4">
              <div className={`inline-flex items-center justify-center h-10 w-10 rounded-full ${kpi.color} mb-2`}><kpi.icon className="h-5 w-5" /></div>
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
              <p className="font-bold text-xl">{kpi.value}</p>
              <p className="text-xs mt-0.5"><span className="text-emerald-600 font-medium">{kpi.trend}</span> <span className="text-muted-foreground">{kpi.trendLabel}</span></p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="py-3 px-4">
          <div className="flex flex-col lg:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search outlets by name or code..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-32"><SelectValue placeholder="All Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" className="shrink-0"><Filter className="h-4 w-4" /></Button>
          </div>
        </CardContent>
      </Card>

      {/* Outlet Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"><input type="checkbox" className="rounded" /></TableHead>
                <TableHead>Outlet</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead className="text-center">Vendors</TableHead>
                <TableHead className="text-center">Assets</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedItems.map(o => {
                const vendorCount = allVendors.filter((v) => v.outlet_id === o.id).length;
                const assetCount = allAssets.filter((a) => a.outlet_id === o.id).length;
                return (
                  <TableRow key={o.id}>
                    <TableCell onClick={e => e.stopPropagation()}><input type="checkbox" className="rounded" /></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded bg-muted flex items-center justify-center"><Building2 className="h-4 w-4 text-muted-foreground" /></div>
                        <span className="font-medium text-sm">{o.name}</span>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline" className="text-xs font-mono">{o.short_code}</Badge></TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{o.address || '-'}</TableCell>
                    <TableCell className="text-sm">{o.manager || '-'}</TableCell>
                    <TableCell className="text-center text-sm font-medium">{vendorCount}</TableCell>
                    <TableCell className="text-center text-sm font-medium">{assetCount}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs ${o.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                        {o.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(o)}><Edit className="h-3.5 w-3.5" /></Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {paginatedItems.length === 0 && (
                <TableRow><TableCell colSpan={9} className="text-center py-12 text-muted-foreground">No outlets found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between px-4 py-2.5 border-t text-sm text-muted-foreground">
            <span>Showing {Math.min(((currentPage - 1) * 10) + 1, totalItems)} to {Math.min(currentPage * 10, totalItems)} of {totalItems} outlets</span>
            <div className="flex gap-1">
              <Button variant="outline" size="icon" className="h-7 w-7" disabled={!hasPrevPage} onClick={() => goToPage(currentPage - 1)}><ChevronLeft className="h-3.5 w-3.5" /></Button>
              {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => (
                <Button key={i + 1} variant={currentPage === i + 1 ? 'default' : 'outline'} size="icon" className="h-7 w-7" onClick={() => goToPage(i + 1)}>{i + 1}</Button>
              ))}
              <Button variant="outline" size="icon" className="h-7 w-7" disabled={!hasNextPage} onClick={() => goToPage(currentPage + 1)}><ChevronRight className="h-3.5 w-3.5" /></Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
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
              <div className="space-y-2">
                <Label>Manager</Label>
                <Select value={form.manager} onValueChange={v => setForm(f => ({ ...f, manager: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select manager" /></SelectTrigger>
                  <SelectContent>
                    {managerUsers.map(u => (
                      <SelectItem key={u.id} value={u.label}>{u.label}</SelectItem>
                    ))}
                    {managerUsers.length === 0 && (
                      <SelectItem value="" disabled>No managers created yet</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
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
