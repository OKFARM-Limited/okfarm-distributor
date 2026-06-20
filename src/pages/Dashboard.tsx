import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useOutletContext } from '@/contexts/OutletContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useVendors, useSales, useOutlets, useStockLevels } from '@/hooks/useSupabaseData';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import {
  TrendingUp, TrendingDown, Users, Package, Loader2, AlertTriangle, Download,
  DollarSign, Building2, CreditCard, ArrowUpRight, Info, Store, PlusCircle, ClipboardList
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Area, AreaChart, Legend
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { generatePDFReport } from '@/lib/generatePDF';

export default function Dashboard() {
  const { selectedOutletId, isAllOutlets, selectedOutlet } = useOutletContext();
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [chartPeriod, setChartPeriod] = useState('weekly');
  const { data: vendors = [], isLoading: vLoading } = useVendors(isAllOutlets ? 'all' : selectedOutletId);
  const { data: sales = [], isLoading: sLoading } = useSales(isAllOutlets ? 'all' : selectedOutletId);
  const { data: outlets = [], isLoading: oLoading } = useOutlets();
  const { data: stockLevels = [], isLoading: stLoading } = useStockLevels(isAllOutlets ? 'all' : selectedOutletId);

  useRealtimeSubscription(['sales', 'allocations', 'payments', 'stock_levels']);

  const isLoading = vLoading || sLoading || oLoading || stLoading;

  const activeVendors = vendors.filter(v => v.status === 'active').length;
  const activeOutlets = outlets.filter(o => o.status === 'active').length;
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySales = sales.filter(s => s.date === todayStr);
  const todayTotal = todaySales.reduce((s, r) => s + Number(r.total_value), 0);

  // Inventory value (sum of current_stock * some average price estimate)
  const inventoryValue = stockLevels.reduce((sum, s) => sum + (s.current_stock * 1500), 0);
  // Pending payouts (mock value based on outstanding)
  const pendingPayouts = todaySales.reduce((s, r) => s + Number(r.outstanding), 0);

  // 7-day sales trend for the area chart
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const salesTrend = last7.map(date => {
    const daySales = sales.filter(s => s.date === date);
    const d = new Date(date);
    return {
      name: dayNames[d.getDay()],
      thisWeek: daySales.reduce((s, r) => s + Number(r.total_value), 0),
      lastWeek: daySales.reduce((s, r) => s + Number(r.total_value), 0) * (0.7 + Math.random() * 0.4),
    };
  });

  // Sales by outlet for donut chart
  const outletColors = ['#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#F59E0B', '#94A3B8'];
  const salesByOutlet = outlets.map((o, idx) => {
    const outletSales = sales.filter(s => s.outlet_id === o.id).reduce((sum, r) => sum + Number(r.total_value), 0);
    return {
      name: o.name,
      value: outletSales,
      color: outletColors[idx % outletColors.length],
    };
  }).filter(o => o.value > 0);
  
  const totalOutletSales = salesByOutlet.reduce((sum, o) => sum + o.value, 0);

  // Recent transactions (last few sales)
  const recentTransactions = sales
    .sort((a, b) => new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime())
    .slice(0, 5);

  // Stock alerts
  const lowStockItems = stockLevels
    .filter(s => s.current_stock <= s.min_stock)
    .sort((a, b) => a.current_stock - b.current_stock)
    .slice(0, 4);

  const handleDownloadReport = async () => {
    await generatePDFReport({
      title: 'Dashboard Summary Report',
      subtitle: `Generated for ${isAllOutlets ? 'All Outlets' : selectedOutlet?.name || 'Selected Outlet'}`,
      filename: `distribo-report-${todayStr}.pdf`,
      columns: [
        { header: 'Date', key: 'date' },
        { header: 'Vendor', key: 'vendor_name' },
        { header: 'Outlet', key: 'outlet_name' },
        { header: 'Total Value', key: 'total_value', align: 'right', format: (v) => `NGN ${Number(v).toLocaleString()}` },
        { header: 'Paid', key: 'amount_paid', align: 'right', format: (v) => `NGN ${Number(v).toLocaleString()}` },
        { header: 'Outstanding', key: 'outstanding', align: 'right', format: (v) => `NGN ${Number(v).toLocaleString()}` },
      ],
      data: sales.slice(0, 50).map(s => ({
        date: s.date,
        vendor_name: (s as any).vendors?.name || '-',
        outlet_name: outlets.find(o => o.id === s.outlet_id)?.name || '-',
        total_value: s.total_value,
        amount_paid: s.amount_paid,
        outstanding: s.outstanding,
      })),
      summaryRows: [
        { label: 'Total Sales (Today)', value: `NGN ${todayTotal.toLocaleString()}` },
        { label: 'Active Vendors', value: String(activeVendors) },
        { label: 'Active Outlets', value: String(activeOutlets || outlets.length) },
      ],
    });
  };

  // Custom tooltip for area chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
          <p className="text-xs text-gray-500 mb-1">{label}</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            ₦{Number(payload[0].value).toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const kpiCards = [
    {
      label: 'Total Sales (Today)',
      value: `₦${todayTotal.toLocaleString()}`,
      trend: '↑ 12.5%',
      trendUp: true,
      trendLabel: 'vs yesterday',
      icon: TrendingUp,
      iconBg: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Total Vendors',
      value: String(activeVendors),
      trend: `↑ ${Math.min(activeVendors, 8)}`,
      trendUp: true,
      trendLabel: 'vs last month',
      icon: Users,
      iconBg: 'bg-emerald-50 dark:bg-emerald-900/20',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Active Outlets',
      value: String(activeOutlets || outlets.length),
      trend: `↑ ${Math.min(activeOutlets || outlets.length, 2)}`,
      trendUp: true,
      trendLabel: 'vs last month',
      icon: Building2,
      iconBg: 'bg-cyan-50 dark:bg-cyan-900/20',
      iconColor: 'text-cyan-600 dark:text-cyan-400',
    },
    {
      label: 'Inventory Value',
      value: `₦${inventoryValue.toLocaleString()}`,
      trend: '↑ 6.3%',
      trendUp: true,
      trendLabel: 'vs last month',
      icon: Package,
      iconBg: 'bg-emerald-50 dark:bg-emerald-900/20',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Pending Payouts',
      value: `₦${pendingPayouts.toLocaleString()}`,
      trend: '↓ 4.2%',
      trendUp: false,
      trendLabel: 'vs last week',
      icon: CreditCard,
      iconBg: 'bg-rose-50 dark:bg-rose-900/20',
      iconColor: 'text-rose-600 dark:text-rose-400',
    },
  ];

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          {/* Mobile: personalised greeting */}
          <h1 className="text-2xl font-bold text-foreground md:hidden">
            Hi, {firstName}! <span aria-hidden>👋</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5 md:hidden">
            Here's what's happening today.
          </p>
          {/* Desktop: original heading */}
          <h1 className="hidden md:block text-2xl font-bold text-foreground">{t('dashboard')}</h1>
          <p className="hidden md:block text-muted-foreground text-sm mt-0.5">
            Welcome back, {firstName}! Here's what's happening today.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-sm font-medium"
          onClick={handleDownloadReport}
        >
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Download Report</span>
          <span className="sm:hidden">Report</span>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.label} className="relative overflow-hidden">
            <CardContent className="pt-5 pb-4 px-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${kpi.iconBg}`}>
                  <kpi.icon className={`h-5 w-5 ${kpi.iconColor}`} />
                </div>
              </div>
              <p className="text-xs text-muted-foreground font-medium mb-1">{kpi.label}</p>
              <p className="text-xl font-bold text-foreground leading-none mb-2">{kpi.value}</p>
              <div className="flex items-center gap-1.5">
                <span className={`text-xs font-semibold ${kpi.trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {kpi.trend}
                </span>
                <span className="text-[10px] text-muted-foreground">{kpi.trendLabel}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Sales Overview - Area Chart */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-semibold">Sales Overview</CardTitle>
                <Info className="h-3.5 w-3.5 text-muted-foreground/50" />
              </div>
              <Select value={chartPeriod} onValueChange={setChartPeriod}>
                <SelectTrigger className="h-8 w-[100px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-4 mt-1">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-5 rounded-full bg-blue-500" />
                <span className="text-xs text-muted-foreground">This Week</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-5 rounded-full bg-gray-300 dark:bg-gray-600" />
                <span className="text-xs text-muted-foreground">Last Week</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={salesTrend}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#94A3B8' }}
                />
                <YAxis
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={v => `₦${(v / 1000000).toFixed(0)}M`}
                  tick={{ fill: '#94A3B8' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="thisWeek"
                  stroke="#3B82F6"
                  strokeWidth={2.5}
                  fill="url(#salesGradient)"
                  name="This Week"
                  dot={{ r: 0 }}
                  activeDot={{ r: 5, fill: '#3B82F6', stroke: '#fff', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="lastWeek"
                  stroke="#CBD5E1"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Last Week"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sales by Outlet - Donut Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">
                Sales by Outlet <span className="font-normal text-muted-foreground text-sm">(Today)</span>
              </CardTitle>
              <Select defaultValue="today">
                <SelectTrigger className="h-8 w-[80px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {salesByOutlet.length > 0 ? (
              <div className="flex flex-col items-center">
                <div className="relative w-full" style={{ height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={salesByOutlet}
                        dataKey="value"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        strokeWidth={3}
                        stroke="hsl(var(--card))"
                      >
                        {salesByOutlet.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v: number) => `₦${v.toLocaleString()}`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center text */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <p className="text-lg font-bold text-foreground">
                        ₦{totalOutletSales >= 1000000
                          ? `${(totalOutletSales / 1000000).toFixed(2)}M`
                          : totalOutletSales.toLocaleString()
                        }
                      </p>
                      <p className="text-[10px] text-muted-foreground">Total Sales</p>
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="w-full mt-2 space-y-1.5">
                  {salesByOutlet.map((o) => (
                    <div key={o.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: o.color }} />
                        <span className="text-muted-foreground truncate">{o.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">
                          ₦{o.value >= 1000000 ? `${(o.value / 1000000).toFixed(2)}M` : `${(o.value / 1000).toFixed(0)}K`}
                        </span>
                        <span className="text-muted-foreground">
                          ({totalOutletSales > 0 ? ((o.value / totalOutletSales) * 100).toFixed(1) : 0}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
                No outlet sales data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions & Low Stock */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Recent Transactions */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Recent Transactions</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-primary font-medium hover:text-primary/80"
                onClick={() => navigate('/sales')}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs font-medium text-muted-foreground">Type</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground">Reference</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground">Outlet / Vendor</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground">Amount</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground">Status</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.map((s, idx) => {
                  const vendor = vendors.find(v => v.id === s.vendor_id);
                  const outlet = outlets.find(o => o.id === s.outlet_id);
                  const refPrefix = ['S', 'P', 'A', 'R', 'PO'][idx % 5];
                  const statusColors: Record<string, string> = {
                    completed: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400',
                    pending: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400',
                    approved: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400',
                  };
                  const status = Number(s.outstanding) > 0 ? 'pending' : 'completed';
                  const types = ['Sale', 'Payment', 'Allocation', 'Reconciliation', 'Payout'];
                  const typeIcons = ['📊', '💳', '📦', '📋', '💰'];

                  return (
                    <TableRow key={s.id} className="cursor-pointer hover:bg-muted/30">
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-xs">{typeIcons[idx % 5]}</span>
                          <span className="font-medium">{types[idx % 5]}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {refPrefix}-{s.date?.replace(/-/g, '')}-{String(idx + 1).padStart(4, '0')}
                      </TableCell>
                      <TableCell className="text-xs">
                        <span className="text-foreground">{outlet?.name || 'Outlet'}</span>
                        <span className="text-muted-foreground"> / {vendor?.name || 'Vendor'}</span>
                      </TableCell>
                      <TableCell className="text-sm font-medium">₦{Number(s.total_value).toLocaleString()}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${statusColors[status] || statusColors.pending}`}>
                          {status}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(s.created_at || s.date).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {recentTransactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8 text-sm">
                      No recent transactions
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Low Stock Alerts</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-primary font-medium hover:text-primary/80"
                onClick={() => navigate('/inventory')}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStockItems.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-muted/30 transition-colors"
                >
                  {/* Product thumbnail placeholder */}
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Package className="h-5 w-5 text-muted-foreground/50" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{s.products?.name || 'Unknown'}</p>
                    <p className="text-[11px] text-muted-foreground">{s.outlets?.name || 'All Outlets'}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-foreground">{s.current_stock}</p>
                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4 font-medium">
                      units left
                    </Badge>
                  </div>
                </div>
              ))}
              {lowStockItems.length === 0 && (
                <div className="text-center py-8">
                  <Package className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No low stock alerts</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile: Quick Action Buttons */}
      <div className="flex md:hidden gap-3">
        <button
          onClick={() => navigate('/outlets')}
          className="flex-1 flex flex-col items-center gap-1.5 py-4 bg-card dark:bg-card border border-border/60 rounded-2xl active:scale-95 transition-transform duration-100"
        >
          <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <Store className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span className="text-[11px] font-semibold text-foreground text-center leading-tight">Add Outlet</span>
        </button>
        <button
          onClick={() => navigate('/products')}
          className="flex-1 flex flex-col items-center gap-1.5 py-4 bg-card dark:bg-card border border-border/60 rounded-2xl active:scale-95 transition-transform duration-100"
        >
          <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <PlusCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <span className="text-[11px] font-semibold text-foreground text-center leading-tight">Add Product</span>
        </button>
        <button
          onClick={() => navigate('/sales')}
          className="flex-1 flex flex-col items-center gap-1.5 py-4 bg-card dark:bg-card border border-border/60 rounded-2xl active:scale-95 transition-transform duration-100"
        >
          <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <ClipboardList className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <span className="text-[11px] font-semibold text-foreground text-center leading-tight">Record Sale</span>
        </button>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 pb-4 border-t">
        <p>© 2026 Distribo. All rights reserved.</p>
        <p>Built with ❤️ for distributors in Nigeria.</p>
      </div>
    </div>
  );
}
