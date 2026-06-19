import { useOutletContext } from '@/contexts/OutletContext';
import { useVendors, useAssets } from '@/hooks/useSupabaseData';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Search, Plus, Phone, MapPin, Edit, Building2, Loader2, Download, Users,
  UserCheck, UserX, Star, TrendingUp, MoreHorizontal, X, Mail, Calendar,
  Eye, FileText, Ban, ChevronLeft, ChevronRight, Filter
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { useState, useEffect, useMemo } from 'react';
import { useUpsertVendor } from '@/hooks/useSupabaseData';
import { usePagination } from '@/hooks/usePagination';
import { ViewerBanner } from '@/components/ViewerGuard';
import { useViewerGuard } from '@/hooks/useViewerGuard';
import { useAppSetting } from '@/hooks/useAppSetting';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { ExportMenu } from '@/components/ExportMenu';
import { downloadCSV, generatePDFReport } from '@/lib/exportUtils';

const DEFAULT_TERRITORIES = ['Ikeja', 'Lekki', 'Surulere', 'Alimosho', 'Ikorodu'];

export default function VendorList() {
  const [search, setSearch] = useState('');
  const [territory, setTerritory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('all');
  const [outletFilter, setOutletFilter] = useState('all');
  const [editVendor, setEditVendor] = useState<typeof vendors[number] | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<typeof vendors[number] | null>(null);
  const navigate = useNavigate();
  const { viewerProps } = useViewerGuard();
  const { data: settingsTerritories = DEFAULT_TERRITORIES } = useAppSetting<string[]>('territories', DEFAULT_TERRITORIES);
  const territories = ['All', ...settingsTerritories];
  const { selectedOutletId, isAllOutlets, getOutletName, allOutlets } = useOutletContext();
  const { data: vendors = [], isLoading } = useVendors(isAllOutlets ? 'all' : selectedOutletId);

  const filtered = vendors.filter((v) => {
    const matchSearch = v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.vendor_code.toLowerCase().includes(search.toLowerCase()) ||
      (v.phone || '').includes(search);
    const matchTerritory = territory === 'All' || v.territory === territory;
    const matchStatus = statusFilter === 'all' || v.status === statusFilter;
    const matchOutlet = outletFilter === 'all' || v.outlet_id === outletFilter;
    return matchSearch && matchTerritory && matchStatus && matchOutlet;
  });

  const { paginatedItems, currentPage, totalPages, totalItems, goToPage, hasNextPage, hasPrevPage, resetPage } = usePagination(filtered, 10);

  useEffect(() => { resetPage(); }, [search, territory, statusFilter, outletFilter]);

  // KPI calculations
  const kpis = useMemo(() => {
    const total = vendors.length;
    const active = vendors.filter(v => v.status === 'active').length;
    const inactive = vendors.filter(v => v.status !== 'active').length;
    const topPerformer = vendors.reduce((top, v) => {
      const sales = Number(v.total_sales || 0);
      return sales > (top.sales || 0) ? { name: v.name, sales, outlet: v.outlets?.name || '' } : top;
    }, { name: '-', sales: 0, outlet: '' } as { name: string; sales: number; outlet: string });
    const avgMonthlySales = total > 0 ? vendors.reduce((sum, v) => sum + Number(v.total_sales || 0), 0) / total : 0;
    return { total, active, inactive, topPerformer, avgMonthlySales };
  }, [vendors]);

  if (isLoading) return <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      inactive: 'bg-red-50 text-red-700 border-red-200',
      suspended: 'bg-amber-50 text-amber-700 border-amber-200',
    };
    return <Badge variant="outline" className={`text-xs capitalize ${styles[status] || ''}`}>{status}</Badge>;
  };

  const getPerformanceColor = (sales: number) => {
    const pct = kpis.avgMonthlySales > 0 ? Math.round((sales / kpis.avgMonthlySales) * 100) : 0;
    if (pct >= 80) return 'text-emerald-600';
    if (pct >= 60) return 'text-blue-600';
    if (pct >= 40) return 'text-amber-600';
    return 'text-red-600';
  };

  const getPerformancePct = (sales: number) => {
    if (kpis.avgMonthlySales === 0) return 0;
    return Math.min(100, Math.round((sales / (kpis.avgMonthlySales * 2)) * 100));
  };

  const kpiCards = [
    { label: 'Total Vendors', value: kpis.total, icon: Users, color: 'bg-blue-50 text-blue-600', trend: `↑ ${Math.max(1, Math.round(kpis.total * 0.03))}`, trendLabel: 'vs last month' },
    { label: 'Active Vendors', value: kpis.active, icon: UserCheck, color: 'bg-emerald-50 text-emerald-600', trend: `${kpis.total > 0 ? ((kpis.active / kpis.total) * 100).toFixed(1) : 0}%`, trendLabel: 'of total' },
    { label: 'Inactive Vendors', value: kpis.inactive, icon: UserX, color: 'bg-red-50 text-red-600', trend: `${kpis.total > 0 ? ((kpis.inactive / kpis.total) * 100).toFixed(1) : 0}%`, trendLabel: 'of total' },
    { label: 'Top Performer', value: kpis.topPerformer.name, icon: Star, color: 'bg-amber-50 text-amber-600', trend: kpis.topPerformer.outlet, trendLabel: '', isText: true },
    { label: 'Avg. Monthly Sales', value: `₦${Math.round(kpis.avgMonthlySales).toLocaleString()}`, icon: TrendingUp, color: 'bg-purple-50 text-purple-600', trend: '↑ 12.5%', trendLabel: 'vs last month', isText: true },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <ViewerBanner />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Vendors</h1>
          <p className="text-muted-foreground text-sm">Manage your vendor network, performance and activities.</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportMenu
            label="Export"
            onExportCSV={() => {
              downloadCSV(
                [
                  { header: 'Name', key: 'name' },
                  { header: 'Code', key: 'vendor_code' },
                  { header: 'Phone', key: 'phone' },
                  { header: 'Territory', key: 'territory' },
                  { header: 'Outlet', key: 'outlet_name' },
                  { header: 'Status', key: 'status' },
                  { header: 'Total Sales (₦)', key: 'total_sales' },
                ],
                filtered.map(v => ({ ...v, outlet_name: v.outlets?.name || getOutletName(v.outlet_id) })),
                `vendors_${new Date().toISOString().split('T')[0]}.csv`,
              );
              toast({ title: 'CSV Downloaded', description: `${filtered.length} vendors exported.` });
            }}
            onExportPDF={() => {
              generatePDFReport({
                title: 'Vendor List Report',
                subtitle: `Generated ${new Date().toLocaleDateString()} — ${filtered.length} vendors`,
                filename: `vendors_${new Date().toISOString().split('T')[0]}.pdf`,
                orientation: 'landscape',
                columns: [
                  { header: 'Name', key: 'name' },
                  { header: 'Code', key: 'vendor_code' },
                  { header: 'Phone', key: 'phone' },
                  { header: 'Territory', key: 'territory' },
                  { header: 'Outlet', key: 'outlet_name' },
                  { header: 'Status', key: 'status' },
                  { header: 'Total Sales (NGN)', key: 'total_sales', align: 'right', format: (v) => `NGN ${Number(v).toLocaleString()}` },
                ],
                data: filtered.map(v => ({ ...v, outlet_name: v.outlets?.name || getOutletName(v.outlet_id) })),
                summaryRows: [
                  { label: 'Total Vendors', value: filtered.length.toString() },
                  { label: 'Active', value: filtered.filter(v => v.status === 'active').length.toString() },
                ],
              });
              toast({ title: 'PDF Downloaded', description: `${filtered.length} vendors exported.` });
            }}
          />
          <Button size="sm" className="hidden sm:inline-flex" onClick={() => navigate('/vendors/onboard')} {...viewerProps}><Plus className="h-4 w-4 mr-1.5" />Add Vendor</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.label} className="relative overflow-hidden">
            <CardContent className="pt-4 pb-3 px-4">
              <div className={`inline-flex items-center justify-center h-10 w-10 rounded-full ${kpi.color} mb-2`}>
                <kpi.icon className="h-5 w-5" />
              </div>
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
              <p className={`font-bold ${kpi.isText ? 'text-base truncate' : 'text-xl'}`}>{kpi.value}</p>
              <p className="text-xs mt-0.5">
                <span className="text-emerald-600 font-medium">{kpi.trend}</span>{' '}
                <span className="text-muted-foreground">{kpi.trendLabel}</span>
              </p>
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
              <Input placeholder="Search vendors by name, code or phone..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-36"><SelectValue placeholder="All Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Select value={outletFilter} onValueChange={setOutletFilter}>
              <SelectTrigger className="w-full lg:w-40"><SelectValue placeholder="All Outlets" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Outlets</SelectItem>
                {allOutlets.map(o => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={territory} onValueChange={setTerritory}>
              <SelectTrigger className="w-full lg:w-40"><SelectValue placeholder="All Territories" /></SelectTrigger>
              <SelectContent>{territories.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
            <Button variant="outline" size="icon" className="shrink-0"><Filter className="h-4 w-4" /></Button>
          </div>
        </CardContent>
      </Card>

      {/* Table + Detail Panel */}
      <div className="flex gap-4">
        {/* Main Table */}
        <Card className={`flex-1 transition-all ${selectedVendor ? 'lg:w-[60%]' : 'w-full'}`}>
          <CardContent className="p-0">
            {/* Bulk actions bar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b">
              <div className="flex items-center gap-2">
                <Button variant="default" size="sm" className="bg-primary text-white">Bulk Actions <ChevronLeft className="h-3 w-3 ml-1 rotate-[270deg]" /></Button>
                <Button variant="outline" size="sm">Import Vendors</Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalItems)} of {totalItems}
              </p>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"><input type="checkbox" className="rounded" /></TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Outlet / Territory</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-right">Monthly Sales</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedItems.map((v) => {
                  const sales = Number(v.total_sales || 0);
                  const pct = getPerformancePct(sales);
                  return (
                    <TableRow
                      key={v.id}
                      className={`cursor-pointer hover:bg-muted/50 ${selectedVendor?.id === v.id ? 'bg-primary/5' : ''}`}
                      onClick={() => setSelectedVendor(v)}
                    >
                      <TableCell onClick={e => e.stopPropagation()}><input type="checkbox" className="rounded" /></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={v.photo_url} />
                            <AvatarFallback className="text-xs">{v.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{v.name}</p>
                            <p className="text-xs text-muted-foreground">Main Vendor</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{v.vendor_code}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{v.outlets?.name || getOutletName(v.outlet_id)}</p>
                          <p className="text-xs text-muted-foreground">{v.territory || '-'}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{v.phone || '-'}</TableCell>
                      <TableCell className="text-right text-sm font-medium">₦{sales.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-semibold ${getPerformanceColor(sales)}`}>{pct}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(v.status)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => { e.stopPropagation(); setEditVendor(v); }}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {paginatedItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                      No vendors found matching your criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-1 py-3 border-t">
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={!hasPrevPage} onClick={() => goToPage(currentPage - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => goToPage(page)}
                  >
                    {page}
                  </Button>
                );
              })}
              {totalPages > 5 && <span className="px-2 text-muted-foreground">...</span>}
              {totalPages > 5 && (
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => goToPage(totalPages)}>
                  {totalPages}
                </Button>
              )}
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={!hasNextPage} onClick={() => goToPage(currentPage + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Detail Side Panel */}
        {selectedVendor && (
          <Card className="hidden lg:block w-[340px] shrink-0 self-start sticky top-4 overflow-hidden">
            <CardContent className="p-0">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-base">{selectedVendor.name}</h3>
                    {getStatusBadge(selectedVendor.status)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">Vendor Code: {selectedVendor.vendor_code}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedVendor(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Tabs */}
              <div className="flex border-b text-sm">
                <button className="px-4 py-2 text-primary border-b-2 border-primary font-medium">Overview</button>
                <button className="px-4 py-2 text-muted-foreground hover:text-foreground">Performance</button>
                <button className="px-4 py-2 text-muted-foreground hover:text-foreground">Transactions</button>
              </div>

              {/* Contact Info */}
              <div className="p-4 space-y-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={selectedVendor.photo_url} />
                    <AvatarFallback>{selectedVendor.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-muted-foreground" />{selectedVendor.phone || '-'}</div>
                    <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-muted-foreground" />{selectedVendor.vendor_code.toLowerCase()}@vendor.com</div>
                    <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-muted-foreground" />{selectedVendor.territory || '-'}</div>
                    <div className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5 text-muted-foreground" />Joined: {new Date(selectedVendor.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                  </div>
                </div>

                {/* Outlet */}
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Outlet / Territory</p>
                      <p className="font-medium text-sm">{selectedVendor.outlets?.name || getOutletName(selectedVendor.outlet_id)}</p>
                      <p className="text-xs text-muted-foreground">{selectedVendor.territory || '-'}</p>
                    </div>
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>

                {/* Performance */}
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-2">Performance (This Month)</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Sales</p>
                      <p className="font-bold text-base">₦{Number(selectedVendor.total_sales || 0).toLocaleString()}</p>
                      <p className="text-xs text-emerald-600">↑ 12.5%</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Transactions</p>
                      <p className="font-bold text-base">{Math.round(Number(selectedVendor.total_sales || 0) / 8000)}</p>
                      <p className="text-xs text-emerald-600">↑ 6</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Avg. Order Value</p>
                      <p className="font-bold text-base">₦{Math.round(Number(selectedVendor.total_sales || 0) / Math.max(1, Math.round(Number(selectedVendor.total_sales || 0) / 8000))).toLocaleString()}</p>
                      <p className="text-xs text-emerald-600">↑ 8.2%</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Collections</p>
                      <p className="font-bold text-base">₦{Math.round(Number(selectedVendor.total_sales || 0) * 0.95).toLocaleString()}</p>
                      <p className="text-xs text-emerald-600">↑ 14.3%</p>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-2">Quick Actions</p>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      className="flex flex-col items-center gap-1 p-2.5 rounded-lg border hover:bg-muted/50 transition-colors"
                      onClick={() => navigate(`/vendors/${selectedVendor.id}`)}
                    >
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">View Transactions</span>
                    </button>
                    <button
                      className="flex flex-col items-center gap-1 p-2.5 rounded-lg border hover:bg-muted/50 transition-colors"
                      onClick={() => setEditVendor(selectedVendor)}
                    >
                      <Edit className="h-4 w-4 text-blue-600" />
                      <span className="text-[10px] text-muted-foreground">Edit Vendor</span>
                    </button>
                    <button className="flex flex-col items-center gap-1 p-2.5 rounded-lg border hover:bg-muted/50 transition-colors">
                      <Ban className="h-4 w-4 text-red-500" />
                      <span className="text-[10px] text-muted-foreground">Deactivate</span>
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editVendor} onOpenChange={open => !open && setEditVendor(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Quick Edit Vendor</DialogTitle></DialogHeader>
          {editVendor && <QuickEditForm vendor={editVendor} onDone={() => setEditVendor(null)} />}
        </DialogContent>
      </Dialog>

      {/* Mobile Floating Action Button (FAB) */}
      <div className="fixed bottom-20 right-4 z-40 sm:hidden">
        <Button
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/95 flex items-center justify-center"
          onClick={() => navigate('/vendors/onboard')}
          {...viewerProps}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}

function QuickEditForm({ vendor, onDone }: { vendor: Record<string, unknown>; onDone: () => void }) {
  const { allOutlets } = useOutletContext();
  const upsertVendor = useUpsertVendor();
  const { data: editTerritories = DEFAULT_TERRITORIES } = useAppSetting<string[]>('territories', DEFAULT_TERRITORIES);
  const [name, setName] = useState(vendor.name);
  const [phone, setPhone] = useState(vendor.phone || '');
  const [terr, setTerr] = useState(vendor.territory || '');
  const [outletId, setOutletId] = useState(vendor.outlet_id || '');
  const [bio, setBio] = useState(vendor.biometrics_enabled || false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await upsertVendor.mutateAsync({ id: vendor.id, name, phone, territory: terr, outlet_id: outletId, biometrics_enabled: bio });
      toast({ title: 'Vendor saved', description: 'Vendor has been updated.' });
      onDone();
    } catch (err: unknown) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={e => setName(e.target.value)} required /></div>
      <div className="space-y-2"><Label>Phone</Label><Input value={phone} onChange={e => setPhone(e.target.value)} required /></div>
      <div className="space-y-2">
        <Label>Territory</Label>
        <Select value={terr} onValueChange={setTerr}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{editTerritories.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Outlet</Label>
        <Select value={outletId} onValueChange={setOutletId}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{allOutlets.map(o => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2"><Switch checked={bio} onCheckedChange={setBio} /><Label>Enable Biometrics</Label></div>
      <Button type="submit" className="w-full" disabled={upsertVendor.isPending}>
        {upsertVendor.isPending ? 'Saving...' : 'Save Vendor'}
      </Button>
    </form>
  );
}
