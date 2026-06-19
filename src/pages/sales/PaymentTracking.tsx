import { useOutletContext } from '@/contexts/OutletContext';
import { ViewerBanner } from '@/components/ViewerGuard';
import { useSales } from '@/hooks/useSupabaseData';
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Search, Loader2, CreditCard, DollarSign, Clock, AlertTriangle, TrendingUp,
  Download, Plus, Filter, MoreHorizontal, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Ban
} from 'lucide-react';
import { usePagination } from '@/hooks/usePagination';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { ExportMenu } from '@/components/ExportMenu';
import { downloadCSV, generatePDFReport } from '@/lib/exportUtils';
import { toast } from '@/hooks/use-toast';

const CHART_COLORS = ['hsl(221, 100%, 50%)', 'hsl(152, 55%, 42%)', 'hsl(38, 92%, 50%)', 'hsl(280, 65%, 55%)', 'hsl(210, 15%, 75%)'];

export default function PaymentTracking() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [vendorFilter, setVendorFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const { selectedOutletId, isAllOutlets, getOutletName } = useOutletContext();
  const { data: sales = [], isLoading } = useSales(isAllOutlets ? 'all' : selectedOutletId);

  // Derive payment data from sales
  const payments = useMemo(() => {
    return sales.map(s => ({
      ...s,
      paymentStatus: Number(s.outstanding) > 0 ? 'pending' : 'completed',
    }));
  }, [sales]);

  const filtered = useMemo(() => {
    return payments.filter(p => {
      const matchSearch = !search || (p.vendors?.name || '').toLowerCase().includes(search.toLowerCase()) ||
        p.id.toLowerCase().includes(search.toLowerCase());
      const matchTab = activeTab === 'all' || p.paymentStatus === activeTab;
      const matchVendor = vendorFilter === 'all' || p.vendor_id === vendorFilter;
      const matchMethod = methodFilter === 'all' || p.payment_method === methodFilter;
      return matchSearch && matchTab && matchVendor && matchMethod;
    });
  }, [payments, search, activeTab, vendorFilter, methodFilter]);

  const { paginatedItems, currentPage, totalPages, totalItems, goToPage, hasNextPage, hasPrevPage, resetPage } = usePagination(filtered, 8);
  useEffect(() => { resetPage(); }, [search, activeTab, vendorFilter, methodFilter]);

  // KPI calculations
  const kpis = useMemo(() => {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const weekAgo = new Date(today.getTime() - 7 * 86400000).toISOString().split('T')[0];
    const mtdPayments = payments.filter(p => p.date >= monthStart);
    const totalMTD = mtdPayments.reduce((s, p) => s + Number(p.total_value || 0), 0);
    const paidMTD = mtdPayments.reduce((s, p) => s + Number(p.amount_paid || 0), 0);
    const pendingTotal = payments.reduce((s, p) => s + Number(p.outstanding || 0), 0);
    const pendingCount = payments.filter(p => p.paymentStatus === 'pending').length;
    const weekPayments = payments.filter(p => p.date >= weekAgo);
    const weekTotal = weekPayments.reduce((s, p) => s + Number(p.total_value || 0), 0);
    const overdueTotal = payments.filter(p => Number(p.outstanding) > 0 && p.date < weekAgo).reduce((s, p) => s + Number(p.outstanding || 0), 0);
    return { totalMTD, paidMTD, pendingTotal, pendingCount, weekTotal, overdueTotal };
  }, [payments]);

  // Payment method breakdown for donut chart
  const methodBreakdown = useMemo(() => {
    const methods: Record<string, number> = {};
    payments.forEach(p => {
      const method = (p.payment_method || 'cash').replace('_', ' ');
      const label = method.charAt(0).toUpperCase() + method.slice(1);
      methods[label] = (methods[label] || 0) + Number(p.amount_paid || 0);
    });
    return Object.entries(methods).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [payments]);

  const methodTotal = methodBreakdown.reduce((s, m) => s + m.value, 0);

  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `₦${(val / 1000000).toFixed(2)}M`;
    if (val >= 1000) return `₦${(val / 1000).toFixed(0)}K`;
    return `₦${val.toLocaleString()}`;
  };

  // Unique vendors for filter
  const uniqueVendors = useMemo(() => {
    const seen = new Map<string, string>();
    payments.forEach(p => { if (p.vendor_id && p.vendors?.name) seen.set(p.vendor_id, p.vendors.name); });
    return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
  }, [payments]);

  if (isLoading) return <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  const kpiCards = [
    { label: 'Total Payments (MTD)', value: formatCurrency(kpis.totalMTD), icon: CreditCard, color: 'bg-blue-50 text-blue-600', trend: '14.8%', up: true, trendLabel: 'vs last month' },
    { label: 'Total Paid (MTD)', value: formatCurrency(kpis.paidMTD), icon: DollarSign, color: 'bg-emerald-50 text-emerald-600', trend: '12.6%', up: true, trendLabel: 'vs last month' },
    { label: 'Pending Payments', value: formatCurrency(kpis.pendingTotal), icon: Clock, color: 'bg-amber-50 text-amber-600', trend: `${kpis.pendingCount}`, up: false, trendLabel: 'Payments' },
    { label: 'Payments This Week', value: formatCurrency(kpis.weekTotal), icon: TrendingUp, color: 'bg-purple-50 text-purple-600', trend: '18.7%', up: true, trendLabel: 'vs last week' },
    { label: 'Overdue Payments', value: formatCurrency(kpis.overdueTotal), icon: AlertTriangle, color: 'bg-red-50 text-red-600', trend: '8.3%', up: false, trendLabel: 'vs last week' },
  ];

  const tabs = [
    { key: 'all', label: 'All Payments' },
    { key: 'pending', label: 'Pending', count: payments.filter(p => p.paymentStatus === 'pending').length },
    { key: 'completed', label: 'Completed' },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <ViewerBanner />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Payments</h1>
          <p className="text-muted-foreground text-sm">Track all payments made to vendors and monitor payment status.</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportMenu
            label="Export Report"
            onExportCSV={() => {
              downloadCSV(
                [
                  { header: 'Date', key: 'date' },
                  { header: 'Vendor', key: 'vendor_name' },
                  { header: 'Outlet', key: 'outlet_name' },
                  { header: 'Total (₦)', key: 'total_value' },
                  { header: 'Paid (₦)', key: 'amount_paid' },
                  { header: 'Outstanding (₦)', key: 'outstanding' },
                  { header: 'Method', key: 'payment_method' },
                  { header: 'Status', key: 'paymentStatus' },
                ],
                filtered.map(p => ({
                  ...p,
                  vendor_name: p.vendors?.name || '-',
                  outlet_name: p.outlets?.name || getOutletName(p.outlet_id),
                })),
                `payments_${new Date().toISOString().split('T')[0]}.csv`,
              );
              toast({ title: 'CSV Downloaded', description: `${filtered.length} payment records exported.` });
            }}
            onExportPDF={() => {
              generatePDFReport({
                title: 'Payment Tracking Report',
                subtitle: `Generated ${new Date().toLocaleDateString()} — ${filtered.length} records`,
                filename: `payments_${new Date().toISOString().split('T')[0]}.pdf`,
                orientation: 'landscape',
                columns: [
                  { header: 'Date', key: 'date' },
                  { header: 'Vendor', key: 'vendor_name' },
                  { header: 'Outlet', key: 'outlet_name' },
                  { header: 'Total (NGN)', key: 'total_value', align: 'right', format: (v) => `NGN ${Number(v).toLocaleString()}` },
                  { header: 'Paid (NGN)', key: 'amount_paid', align: 'right', format: (v) => `NGN ${Number(v).toLocaleString()}` },
                  { header: 'Outstanding (NGN)', key: 'outstanding', align: 'right', format: (v) => `NGN ${Number(v).toLocaleString()}` },
                  { header: 'Method', key: 'payment_method' },
                  { header: 'Status', key: 'paymentStatus' },
                ],
                data: filtered.map(p => ({
                  date: p.date,
                  vendor_name: p.vendors?.name || '-',
                  outlet_name: p.outlets?.name || getOutletName(p.outlet_id),
                  total_value: p.total_value,
                  amount_paid: p.amount_paid,
                  outstanding: p.outstanding,
                  payment_method: (p.payment_method || 'cash').replace('_', ' '),
                  paymentStatus: p.paymentStatus,
                })),
                summaryRows: [
                  { label: 'Total Records', value: filtered.length.toString() },
                  { label: 'Total Outstanding', value: `NGN ${filtered.reduce((s, p) => s + Number(p.outstanding || 0), 0).toLocaleString()}` },
                ],
              });
              toast({ title: 'PDF Downloaded', description: `${filtered.length} payment records exported.` });
            }}
          />
          <Button size="sm"><Plus className="h-4 w-4 mr-1.5" />New Payment</Button>
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
              <p className="font-bold text-xl">{kpi.value}</p>
              <p className="text-xs mt-0.5">
                <span className={`font-medium ${kpi.up ? 'text-emerald-600' : 'text-red-500'}`}>
                  {kpi.up ? '↑' : '↓'} {kpi.trend}
                </span>{' '}
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
              <Input placeholder="Search by vendor, reference, or amount..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-32"><SelectValue placeholder="All Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={vendorFilter} onValueChange={setVendorFilter}>
              <SelectTrigger className="w-full lg:w-40"><SelectValue placeholder="All Vendors" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vendors</SelectItem>
                {uniqueVendors.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="w-full lg:w-44"><SelectValue placeholder="All Payment Methods" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payment Methods</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="mobile_money">Mobile Money</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" className="shrink-0"><Filter className="h-4 w-4" /></Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Payment Table */}
        <Card className="lg:col-span-3">
          <CardContent className="p-0">
            {/* Tabs */}
            <div className="flex items-center gap-0 border-b px-4">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key ? 'text-primary border-primary' : 'text-muted-foreground border-transparent hover:text-foreground'}`}
                >
                  {tab.label}
                  {tab.count !== undefined && (
                    <Badge variant="secondary" className="ml-1.5 text-xs px-1.5 py-0">{tab.count}</Badge>
                  )}
                </button>
              ))}
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"><input type="checkbox" className="rounded" /></TableHead>
                  <TableHead>Payment ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead className="text-right">Amount (₦)</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedItems.map(p => (
                  <TableRow key={p.id}>
                    <TableCell onClick={e => e.stopPropagation()}><input type="checkbox" className="rounded" /></TableCell>
                    <TableCell className="text-sm font-mono text-primary">{`PAY-${p.id.slice(0, 8).toUpperCase()}`}</TableCell>
                    <TableCell className="text-sm">{new Date(p.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</TableCell>
                    <TableCell className="text-sm font-medium">{p.vendors?.name || '-'}</TableCell>
                    <TableCell className="text-right text-sm font-medium">₦{Number(p.total_value || 0).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize text-xs">{(p.payment_method || 'cash').replace('_', ' ')}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs ${p.paymentStatus === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}
                      >
                        {p.paymentStatus === 'completed' ? 'Completed' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
                {paginatedItems.length === 0 && (
                  <TableRow><TableCell colSpan={8} className="text-center py-12 text-muted-foreground">No payments found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-2.5 border-t text-sm text-muted-foreground">
              <span>Showing {((currentPage - 1) * 8) + 1} to {Math.min(currentPage * 8, totalItems)} of {totalItems} payments</span>
              <div className="flex gap-1">
                <Button variant="outline" size="icon" className="h-7 w-7" disabled={!hasPrevPage} onClick={() => goToPage(currentPage - 1)}><ChevronLeft className="h-3.5 w-3.5" /></Button>
                {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => (
                  <Button key={i + 1} variant={currentPage === i + 1 ? 'default' : 'outline'} size="icon" className="h-7 w-7" onClick={() => goToPage(i + 1)}>{i + 1}</Button>
                ))}
                {totalPages > 3 && <span className="px-1">...</span>}
                {totalPages > 3 && <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => goToPage(totalPages)}>{totalPages}</Button>}
                <Button variant="outline" size="icon" className="h-7 w-7" disabled={!hasNextPage} onClick={() => goToPage(currentPage + 1)}><ChevronRight className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Payment Summary Donut */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold">Payment Summary (MTD)</CardTitle>
              <Select defaultValue="this_month">
                <SelectTrigger className="w-28 h-8"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="this_month">This Month</SelectItem>
                  <SelectItem value="last_month">Last Month</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={methodBreakdown.length > 0 ? methodBreakdown : [{ name: 'No Data', value: 1 }]}
                      cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={2} dataKey="value"
                    >
                      {(methodBreakdown.length > 0 ? methodBreakdown : [{ name: 'No Data', value: 1 }]).map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <text x="50%" y="46%" textAnchor="middle" className="text-base font-bold fill-foreground">{formatCurrency(methodTotal)}</text>
                    <text x="50%" y="57%" textAnchor="middle" className="text-[10px] fill-muted-foreground">Total Payments</text>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {methodBreakdown.map((m, i) => (
                  <div key={m.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span>{m.name}</span>
                    </div>
                    <span className="font-medium">{formatCurrency(m.value)} ({methodTotal > 0 ? ((m.value / methodTotal) * 100).toFixed(1) : 0}%)</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
              <Button variant="link" size="sm" className="text-primary p-0 h-auto">View All</Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {payments.slice(0, 4).map(p => (
                <div key={p.id} className="flex items-start gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${p.paymentStatus === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    {p.paymentStatus === 'completed' ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Payment {p.paymentStatus === 'completed' ? 'completed' : 'is pending'}</p>
                    <p className="text-xs text-muted-foreground">To {p.vendors?.name || 'Unknown'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{new Date(p.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</p>
                    <p className="text-sm font-semibold">₦{Number(p.total_value || 0).toLocaleString()}</p>
                  </div>
                </div>
              ))}
              {payments.length === 0 && <p className="text-sm text-center text-muted-foreground py-4">No recent activity</p>}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Quick Actions</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                <button className="flex flex-col items-center gap-1.5 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground text-center">Make Payment</span>
                </button>
                <button className="flex flex-col items-center gap-1.5 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <Download className="h-5 w-5 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground text-center">Upload Proof</span>
                </button>
                <button className="flex flex-col items-center gap-1.5 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <Ban className="h-5 w-5 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground text-center">Payment Settings</span>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
