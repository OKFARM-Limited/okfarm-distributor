import { useState, useMemo } from 'react';
import { useOutletContext } from '@/contexts/OutletContext';
import { useVendors, useProducts, useAllocations, useCreateAllocation } from '@/hooks/useSupabaseData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  CheckCircle, ChevronRight, ChevronLeft, MapPin, Loader2, Download, Search,
  Plus, Package, TrendingUp, Clock, DollarSign, Filter, MoreHorizontal
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ViewerBanner } from '@/components/ViewerGuard';
import { generatePDFReport } from '@/lib/generatePDF';
import { useViewerGuard } from '@/hooks/useViewerGuard';
import { usePagination } from '@/hooks/usePagination';

export default function DailyAllocation() {
  const [step, setStep] = useState(1);
  const [vendorId, setVendorId] = useState('');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { selectedOutletId, isAllOutlets, getOutletName } = useOutletContext();
  const { data: vendors = [], isLoading: vLoading } = useVendors(isAllOutlets ? 'all' : selectedOutletId);
  const { data: products = [], isLoading: pLoading } = useProducts();
  const { data: allocations = [] } = useAllocations(isAllOutlets ? 'all' : selectedOutletId);
  const createAllocation = useCreateAllocation();
  const { viewerProps } = useViewerGuard();

  const vendor = vendors.find((v) => v.id === vendorId);
  const totalValue = products.reduce((s, p) => s + (quantities[p.id] || 0) * Number(p.unit_price), 0);

  // KPI calculations
  const kpis = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayAllocs = allocations.filter(a => a.date === today);
    const totalToday = todayAllocs.reduce((s, a) => s + Number(a.total_value || 0), 0);
    const pending = allocations.filter(a => a.status === 'pending').length;
    const confirmed = allocations.filter(a => a.status === 'confirmed').length;
    const totalAll = allocations.reduce((s, a) => s + Number(a.total_value || 0), 0);
    return { todayCount: todayAllocs.length, totalToday, pending, confirmed, totalAll };
  }, [allocations]);

  // Filter allocations for the history table
  const filteredAllocations = useMemo(() => {
    return allocations.filter(a => {
      const matchSearch = !search || (a.vendors?.name || '').toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || a.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [allocations, search, statusFilter]);

  const { paginatedItems, currentPage, totalPages, totalItems, goToPage, hasNextPage, hasPrevPage } = usePagination(filteredAllocations, 8);

  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `₦${(val / 1000000).toFixed(2)}M`;
    if (val >= 1000) return `₦${(val / 1000).toFixed(0)}K`;
    return `₦${val.toLocaleString()}`;
  };

  const handleConfirm = () => {
    const items = products.filter(p => quantities[p.id] > 0).map(p => ({
      product_id: p.id, quantity: quantities[p.id], unit_price: Number(p.unit_price),
    }));
    createAllocation.mutate(
      { vendor_id: vendorId, outlet_id: vendor?.outlet_id || null, date: new Date().toISOString().split('T')[0], total_value: totalValue, status: 'confirmed', items },
      {
        onSuccess: () => { toast({ title: 'Allocation Confirmed', description: `₦${totalValue.toLocaleString()} allocated to ${vendor?.name}` }); setStep(0); setVendorId(''); setQuantities({}); },
        onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
      }
    );
  };

  const handleExportPDF = () => {
    const items = products.filter(p => quantities[p.id] > 0);
    if (items.length === 0) { toast({ title: 'Nothing to export', description: 'Set quantities first.' }); return; }
    const date = new Date().toISOString().split('T')[0];
    generatePDFReport({
      title: `Stock Allocation — ${vendor?.name || 'Unknown'}`,
      subtitle: `Date: ${date} | Outlet: ${getOutletName(vendor?.outlet_id || null)}`,
      filename: `allocation_${vendor?.name?.replace(/\s/g, '_')}_${date}.pdf`,
      columns: [
        { header: 'Product', key: 'product' },
        { header: 'Unit Price (NGN)', key: 'price', align: 'right', format: (v: number) => `NGN ${v.toLocaleString()}` },
        { header: 'Quantity', key: 'qty', align: 'right' },
        { header: 'Value (NGN)', key: 'value', align: 'right', format: (v: number) => `NGN ${v.toLocaleString()}` },
      ],
      data: items.map(p => ({ product: p.name, price: Number(p.unit_price), qty: quantities[p.id], value: (quantities[p.id] || 0) * Number(p.unit_price) })),
      summaryRows: [{ label: 'Total Value (NGN)', value: `NGN ${totalValue.toLocaleString()}` }],
    });
    toast({ title: 'PDF Exported', description: 'Allocation PDF downloaded.' });
  };

  if (vLoading || pLoading) return <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  const kpiCards = [
    { label: "Today's Allocations", value: kpis.todayCount.toString(), icon: Package, color: 'bg-blue-50 text-blue-600', trend: formatCurrency(kpis.totalToday), trendLabel: 'Total value' },
    { label: 'Pending', value: kpis.pending.toString(), icon: Clock, color: 'bg-amber-50 text-amber-600', trend: `${kpis.pending}`, trendLabel: 'awaiting confirmation' },
    { label: 'Confirmed', value: kpis.confirmed.toString(), icon: CheckCircle, color: 'bg-emerald-50 text-emerald-600', trend: '100%', trendLabel: 'delivery rate' },
    { label: 'Total All Time', value: formatCurrency(kpis.totalAll), icon: DollarSign, color: 'bg-purple-50 text-purple-600', trend: `${allocations.length}`, trendLabel: 'allocations' },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <ViewerBanner />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Stock Allocation</h1>
          <p className="text-muted-foreground text-sm">Allocate stock to vendors and track allocation history.</p>
        </div>
        <div className="flex items-center gap-2">
          {step === 2 && <Button variant="outline" size="sm" onClick={handleExportPDF}><Download className="h-4 w-4 mr-1.5" />Export PDF</Button>}
          <Button size="sm" onClick={() => setStep(1)} {...viewerProps}><Plus className="h-4 w-4 mr-1.5" />New Allocation</Button>
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

      {/* Allocation Wizard (shows inline) */}
      {step > 0 && (
        <Card className="border-primary/20">
          <CardContent className="pt-4 space-y-4">
            {/* Stepper */}
            <div className="flex items-center gap-2 text-sm">
              {['Select Vendor', 'Set Quantities', 'Confirm'].map((s, i) => (
                <div key={s} className="flex items-center gap-1">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${i <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    {i < step ? <CheckCircle className="h-4 w-4" /> : i + 1}
                  </div>
                  <span className={`hidden sm:inline ${i <= step ? 'font-medium' : 'text-muted-foreground'}`}>{s}</span>
                  {i < 2 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                </div>
              ))}
            </div>

            {step === 1 && (
              <>
                <h3 className="font-semibold text-base">Select Vendor</h3>
                <Select value={vendorId} onValueChange={setVendorId}>
                  <SelectTrigger><SelectValue placeholder="Choose a vendor..." /></SelectTrigger>
                  <SelectContent>{vendors.filter(v => v.status === 'active').map(v => <SelectItem key={v.id} value={v.id}>{v.name} ({v.territory})</SelectItem>)}</SelectContent>
                </Select>
                <Table>
                  <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Unit Price</TableHead><TableHead>Quantity</TableHead><TableHead className="text-right">Value</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {products.map(p => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell>₦{Number(p.unit_price)}</TableCell>
                        <TableCell><Input type="number" min={0} className="w-20 h-8" value={quantities[p.id] || ''} onChange={e => setQuantities(q => ({ ...q, [p.id]: parseInt(e.target.value) || 0 }))} /></TableCell>
                        <TableCell className="text-right">₦{((quantities[p.id] || 0) * Number(p.unit_price)).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="flex items-center justify-between pt-4 border-t">
                  <p className="font-bold text-lg">Total: ₦{totalValue.toLocaleString()}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setStep(0)}>Cancel</Button>
                    <Button onClick={() => setStep(2)} disabled={totalValue === 0 || !vendorId}>Review</Button>
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="bg-muted/50 rounded-lg p-3"><p className="text-xs text-muted-foreground">Vendor</p><p className="font-medium">{vendor?.name}</p></div>
                  <div className="bg-muted/50 rounded-lg p-3"><p className="text-xs text-muted-foreground">Outlet</p><p className="font-medium">{getOutletName(vendor?.outlet_id || null)}</p></div>
                  <div className="bg-muted/50 rounded-lg p-3"><p className="text-xs text-muted-foreground">Date</p><p className="font-medium">{new Date().toLocaleDateString()}</p></div>
                </div>
                <div className="space-y-1">
                  {products.filter(p => quantities[p.id] > 0).map(p => (
                    <div key={p.id} className="flex justify-between text-sm py-1"><span>{p.name} × {quantities[p.id]}</span><span className="font-medium">₦{((quantities[p.id] || 0) * Number(p.unit_price)).toLocaleString()}</span></div>
                  ))}
                </div>
                <div className="border-t pt-3 flex justify-between font-bold text-lg"><span>Total</span><span>₦{totalValue.toLocaleString()}</span></div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                  <Button onClick={handleConfirm} disabled={createAllocation.isPending}>
                    {createAllocation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}Confirm Allocation
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Allocation History */}
      <Card>
        <CardContent className="p-0">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h3 className="font-semibold text-base">Allocation History</h3>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-48 h-9" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32 h-9"><SelectValue placeholder="All Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Outlet</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Total Value (₦)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedItems.map(a => (
                <TableRow key={a.id}>
                  <TableCell className="text-sm">{new Date(a.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</TableCell>
                  <TableCell className="text-sm font-medium">{a.vendors?.name || '-'}</TableCell>
                  <TableCell className="text-sm">{a.outlets?.name || '-'}</TableCell>
                  <TableCell className="text-sm">{a.allocation_items?.length || 0} SKUs</TableCell>
                  <TableCell className="text-right text-sm font-medium">₦{Number(a.total_value || 0).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-xs ${a.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                      {a.status}
                    </Badge>
                  </TableCell>
                  <TableCell><Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button></TableCell>
                </TableRow>
              ))}
              {paginatedItems.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">No allocations found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between px-4 py-2.5 border-t text-sm text-muted-foreground">
            <span>Showing {Math.min(((currentPage - 1) * 8) + 1, totalItems)} to {Math.min(currentPage * 8, totalItems)} of {totalItems}</span>
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
    </div>
  );
}
