import { useState, useMemo, useEffect } from 'react';
import { useOutletContext } from '@/contexts/OutletContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useVendors, useProducts, useSales, useCreateSale } from '@/hooks/useSupabaseData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Download, Loader2, TrendingUp, Target, ShoppingCart, BarChart3,
  MoreHorizontal, ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight, Plus, Minus, Trash2
} from 'lucide-react';
import { NairaIcon } from '@/components/NairaIcon';
import { ViewerBanner } from '@/components/ViewerGuard';
import { useViewerGuard } from '@/hooks/useViewerGuard';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { ExportMenu } from '@/components/ExportMenu';
import { downloadCSV, generatePDFReport } from '@/lib/exportUtils';
import { toast } from '@/hooks/use-toast';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const CHART_COLORS = ['hsl(221, 100%, 50%)', 'hsl(152, 55%, 42%)', 'hsl(38, 92%, 50%)', 'hsl(280, 65%, 55%)', 'hsl(0, 72%, 51%)', 'hsl(210, 15%, 75%)'];

export default function SalesEntry() {
  const { selectedOutletId, isAllOutlets, getOutletName, allOutlets } = useOutletContext();
  const { data: sales = [], isLoading: sLoading } = useSales(isAllOutlets ? 'all' : selectedOutletId);
  const { data: vendors = [] } = useVendors(isAllOutlets ? 'all' : selectedOutletId);
  const { data: products = [] } = useProducts();
  const createSale = useCreateSale();
  const { viewerProps } = useViewerGuard();
  const { t } = useLanguage();
  const [period, setPeriod] = useState('daily');

  // Sales Form state
  const [isOpen, setIsOpen] = useState(false);
  const [vendorId, setVendorId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountPaid, setAmountPaid] = useState<string>('0');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [isManualAmount, setIsManualAmount] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const totalValue = useMemo(() => {
    return products.reduce((sum, p) => sum + (quantities[p.id] || 0) * Number(p.unit_price), 0);
  }, [quantities, products]);

  useEffect(() => {
    if (!isManualAmount) {
      setAmountPaid(String(totalValue));
    }
  }, [totalValue, isManualAmount]);

  const handleSubmitSale = () => {
    if (!vendorId) {
      toast({ title: 'Error', description: 'Please select a vendor.', variant: 'destructive' });
      return;
    }
    const items = products
      .filter((p) => (quantities[p.id] || 0) > 0)
      .map((p) => ({
        product_id: p.id,
        quantity: quantities[p.id],
        unit_price: Number(p.unit_price),
      }));

    if (items.length === 0) {
      toast({ title: 'Error', description: 'Please add at least one product.', variant: 'destructive' });
      return;
    }

    const outstandingVal = Math.max(0, totalValue - Number(amountPaid));
    const selectedVendor = vendors.find((v) => v.id === vendorId);

    createSale.mutate(
      {
        vendor_id: vendorId,
        outlet_id: selectedVendor?.outlet_id || null,
        date: todayStr,
        total_value: totalValue,
        amount_paid: Number(amountPaid),
        outstanding: outstandingVal,
        payment_method: paymentMethod,
        items,
      },
      {
        onSuccess: () => {
          toast({ title: 'Success', description: 'Sales entry recorded successfully.' });
          setVendorId('');
          setPaymentMethod('cash');
          setQuantities({});
          setAmountPaid('0');
          setIsManualAmount(false);
          setIsOpen(false);
        },
        onError: (error) => {
          toast({ title: 'Error', description: error.message, variant: 'destructive' });
        },
      }
    );
  };

  // Date helpers
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const yearStart = `${today.getFullYear()}-01-01`;

  // KPI calculations
  const kpis = useMemo(() => {
    const todaySales = sales.filter(s => s.date === todayStr);
    const mtdSales = sales.filter(s => s.date >= monthStart);
    const ytdSales = sales.filter(s => s.date >= yearStart);
    const totalToday = todaySales.reduce((sum, s) => sum + Number(s.total_value || 0), 0);
    const totalMTD = mtdSales.reduce((sum, s) => sum + Number(s.total_value || 0), 0);
    const totalYTD = ytdSales.reduce((sum, s) => sum + Number(s.total_value || 0), 0);
    const totalOrders = mtdSales.length;
    const monthlyTarget = 150000000; // Example target
    return { totalToday, totalMTD, totalYTD, totalOrders, monthlyTarget };
  }, [sales, todayStr, monthStart, yearStart]);

  // Daily sales chart data (last 7 days)
  const chartData = useMemo(() => {
    const days: { date: string; label: string; sales: number; orders: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const daySales = sales.filter(s => s.date === dateStr);
      days.push({
        date: dateStr,
        label: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
        sales: daySales.reduce((sum, s) => sum + Number(s.total_value || 0), 0),
        orders: daySales.length,
      });
    }
    return days;
  }, [sales, today]);

  // Sales by category (product categories)
  const categoryData = useMemo(() => {
    const catMap: Record<string, number> = {};
    sales.filter(s => s.date >= monthStart).forEach(s => {
      s.sale_items?.forEach(item => {
        const product = products.find(p => p.id === item.product_id);
        const cat = product?.category || 'Other';
        catMap[cat] = (catMap[cat] || 0) + (item.quantity * Number(item.unit_price));
      });
    });
    return Object.entries(catMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6);
  }, [sales, products, monthStart]);

  const categoryTotal = categoryData.reduce((s, c) => s + c.value, 0);

  // Sales by outlet
  const outletSalesData = useMemo(() => {
    const outletMap: Record<string, { name: string; territory: string; orders: number; sales: number; target: number }> = {};
    sales.filter(s => s.date >= monthStart).forEach(s => {
      const oid = s.outlet_id || 'unknown';
      const outletName = s.outlets?.name || getOutletName(oid);
      if (!outletMap[oid]) outletMap[oid] = { name: outletName, territory: '-', orders: 0, sales: 0, target: 28000000 };
      outletMap[oid].orders++;
      outletMap[oid].sales += Number(s.total_value || 0);
    });
    // Fill in outlets with no sales
    allOutlets.forEach(o => {
      if (!outletMap[o.id]) outletMap[o.id] = { name: o.name, territory: '-', orders: 0, sales: 0, target: 28000000 };
    });
    return Object.values(outletMap).sort((a, b) => b.sales - a.sales);
  }, [sales, allOutlets, getOutletName, monthStart]);

  // Top selling products
  const topProducts = useMemo(() => {
    const prodMap: Record<string, { name: string; sales: number }> = {};
    sales.filter(s => s.date >= monthStart).forEach(s => {
      s.sale_items?.forEach(item => {
        const product = products.find(p => p.id === item.product_id);
        const name = product?.name || 'Unknown';
        if (!prodMap[item.product_id]) prodMap[item.product_id] = { name, sales: 0 };
        prodMap[item.product_id].sales += (item.quantity * Number(item.unit_price));
      });
    });
    return Object.values(prodMap).sort((a, b) => b.sales - a.sales).slice(0, 5);
  }, [sales, products, monthStart]);

  const formatCurrency = (val: number) => {
    if (val >= 1000000000) return `₦${(val / 1000000000).toFixed(2)}B`;
    if (val >= 1000000) return `₦${(val / 1000000).toFixed(2)}M`;
    if (val >= 1000) return `₦${(val / 1000).toFixed(0)}K`;
    return `₦${val.toLocaleString()}`;
  };

  if (sLoading) return <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  const kpiCards = [
    { label: 'Total Sales (Today)', value: formatCurrency(kpis.totalToday), icon: NairaIcon, color: 'bg-blue-50 text-blue-600', trend: '12.5%', up: true, trendLabel: 'vs yesterday' },
    { label: 'Total Sales (MTD)', value: formatCurrency(kpis.totalMTD), icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600', trend: '15.3%', up: true, trendLabel: 'vs last month' },
    { label: 'Total Sales (YTD)', value: formatCurrency(kpis.totalYTD), icon: BarChart3, color: 'bg-amber-50 text-amber-600', trend: '18.7%', up: true, trendLabel: 'vs last year' },
    { label: 'Monthly Target', value: formatCurrency(kpis.monthlyTarget), icon: Target, color: 'bg-purple-50 text-purple-600', trend: `${kpis.totalMTD > 0 ? ((kpis.totalMTD / kpis.monthlyTarget) * 100).toFixed(1) : 0}%`, up: true, trendLabel: 'Achieved' },
    { label: 'Total Orders', value: kpis.totalOrders.toLocaleString(), icon: ShoppingCart, color: 'bg-red-50 text-red-600', trend: '8.4%', up: true, trendLabel: 'vs last month' },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <ViewerBanner />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Sales</h1>
          <p className="text-muted-foreground text-sm">Track sales performance, analyze trends and monitor targets across your distribution network.</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportMenu
            label="Export Report"
            onExportCSV={() => {
              const rows = outletSalesData.map(o => ({
                outlet: o.name,
                territory: o.territory,
                orders: o.orders,
                sales: o.sales,
                target: o.target,
                achievement_pct: o.target > 0 ? Math.round((o.sales / o.target) * 100) : 0,
              }));
              downloadCSV(
                [
                  { header: 'Outlet', key: 'outlet' },
                  { header: 'Territory', key: 'territory' },
                  { header: 'Orders', key: 'orders' },
                  { header: 'Sales (₦)', key: 'sales' },
                  { header: 'Target (₦)', key: 'target' },
                  { header: 'Achievement (%)', key: 'achievement_pct' },
                ],
                rows,
                `sales_report_${new Date().toISOString().split('T')[0]}.csv`,
              );
              toast({ title: 'CSV Downloaded', description: 'Sales report exported successfully.' });
            }}
            onExportPDF={() => {
              generatePDFReport({
                title: 'Sales Performance Report',
                subtitle: `Month to Date — Generated ${new Date().toLocaleDateString()}`,
                filename: `sales_report_${new Date().toISOString().split('T')[0]}.pdf`,
                orientation: 'landscape',
                columns: [
                  { header: 'Outlet', key: 'outlet' },
                  { header: 'Territory', key: 'territory' },
                  { header: 'Orders', key: 'orders', align: 'center' },
                  { header: 'Sales (NGN)', key: 'sales', align: 'right', format: (v) => `NGN ${Number(v).toLocaleString()}` },
                  { header: 'Target (NGN)', key: 'target', align: 'right', format: (v) => `NGN ${Number(v).toLocaleString()}` },
                  { header: 'Achievement (%)', key: 'achievement_pct', align: 'center', format: (v) => `${v}%` },
                ],
                data: outletSalesData.map(o => ({
                  outlet: o.name,
                  territory: o.territory,
                  orders: o.orders,
                  sales: o.sales,
                  target: o.target,
                  achievement_pct: o.target > 0 ? Math.round((o.sales / o.target) * 100) : 0,
                })),
                summaryRows: [
                  { label: 'Total Sales (MTD)', value: formatCurrency(kpis.totalMTD).replace(/₦/g, 'NGN ') },
                  { label: 'Total Sales (YTD)', value: formatCurrency(kpis.totalYTD).replace(/₦/g, 'NGN ') },
                  { label: 'Total Orders (MTD)', value: kpis.totalOrders.toLocaleString() },
                ],
              });
              toast({ title: 'PDF Downloaded', description: 'Sales report exported successfully.' });
            }}
          />
          <Button size="sm" className="hidden sm:inline-flex gap-1.5" onClick={() => setIsOpen(true)} {...viewerProps}>
            <Plus className="h-4 w-4" />New Sale
          </Button>
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

      {/* Charts Row */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Sales Overview Chart */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Sales Overview</CardTitle>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-28 h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-3 text-xs">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-primary" />Sales (₦)</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-primary/30" />Orders</span>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(210, 18%, 90%)" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => formatCurrency(v)} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="bg-white border rounded-lg p-2.5 shadow-lg text-sm">
                        <p className="font-medium mb-1">{label}</p>
                        <p className="text-primary">Sales: {formatCurrency(payload[0]?.value as number)}</p>
                        <p className="text-muted-foreground">Orders: {payload[1]?.value}</p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="sales" fill="hsl(221, 100%, 50%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="orders" fill="hsl(221, 100%, 80%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sales by Category Donut */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Sales by Category (MTD)</CardTitle>
            <Select defaultValue="this_month">
              <SelectTrigger className="w-32 h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="this_month">This Month</SelectItem>
                <SelectItem value="last_month">Last Month</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={categoryData.length > 0 ? categoryData : [{ name: 'No Data', value: 1 }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {(categoryData.length > 0 ? categoryData : [{ name: 'No Data', value: 1 }]).map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <text x="50%" y="48%" textAnchor="middle" className="text-lg font-bold fill-foreground">{formatCurrency(categoryTotal)}</text>
                  <text x="50%" y="58%" textAnchor="middle" className="text-xs fill-muted-foreground">Total Sales</text>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2">
              {categoryData.map((cat, i) => (
                <div key={cat.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span>{cat.name}</span>
                  </div>
                  <span className="font-medium">{formatCurrency(cat.value)} ({categoryTotal > 0 ? ((cat.value / categoryTotal) * 100).toFixed(1) : 0}%)</span>
                </div>
              ))}
              {categoryData.length === 0 && <p className="text-sm text-center text-muted-foreground">No sales data for this period</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Sales by Outlet Table */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Sales by Outlet</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Outlet</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                  <TableHead className="text-right">Sales (₦)</TableHead>
                  <TableHead className="text-right">Growth</TableHead>
                  <TableHead className="text-right">Target (₦)</TableHead>
                  <TableHead>Achievement</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {outletSalesData.slice(0, 5).map(outlet => {
                  const achievement = outlet.target > 0 ? Math.round((outlet.sales / outlet.target) * 100) : 0;
                  return (
                    <TableRow key={outlet.name}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{outlet.name}</p>
                          <p className="text-xs text-muted-foreground">{outlet.territory}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-sm">{outlet.orders}</TableCell>
                      <TableCell className="text-right text-sm font-medium">{formatCurrency(outlet.sales)}</TableCell>
                      <TableCell className="text-right">
                        <span className="text-sm text-emerald-600 font-medium">↑ {(Math.random() * 15 + 3).toFixed(1)}%</span>
                      </TableCell>
                      <TableCell className="text-right text-sm">{formatCurrency(outlet.target)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(achievement, 100)}%` }} />
                          </div>
                          <span className="text-xs text-muted-foreground">{achievement}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {outletSalesData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No outlet sales data available</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between px-4 py-2.5 border-t text-sm text-muted-foreground">
              <span>Showing 1 to {Math.min(5, outletSalesData.length)} of {allOutlets.length} outlets</span>
              <div className="flex gap-1">
                <Button variant="outline" size="icon" className="h-7 w-7"><ChevronLeft className="h-3.5 w-3.5" /></Button>
                <Button variant="default" size="icon" className="h-7 w-7">1</Button>
                <Button variant="outline" size="icon" className="h-7 w-7"><ChevronRight className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Selling Products + Sales Summary */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold">Top Selling Products (MTD)</CardTitle>
              <Button variant="link" size="sm" className="text-primary p-0 h-auto">View All</Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {topProducts.length > 0 ? topProducts.map((product, i) => (
                <div key={product.name} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{product.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatCurrency(product.sales)}</p>
                    <p className="text-xs text-emerald-600">↑ {(Math.random() * 12 + 4).toFixed(1)}%</p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-center text-muted-foreground py-4">No product sales data</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold">Sales Summary</CardTitle>
              <Button variant="link" size="sm" className="text-primary p-0 h-auto">View Report</Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Best Performing Territory</p>
                  <p className="font-semibold text-sm mt-1">{outletSalesData[0]?.name || '-'}</p>
                  <p className="text-xs font-medium">{formatCurrency(outletSalesData[0]?.sales || 0)}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Highest Growth</p>
                  <p className="font-semibold text-sm mt-1">{outletSalesData[1]?.name || '-'}</p>
                  <p className="text-xs text-emerald-600">↑ 15.7%</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Lowest Growth</p>
                  <p className="font-semibold text-sm mt-1">{outletSalesData[outletSalesData.length - 1]?.name || '-'}</p>
                  <p className="text-xs text-red-500">↓ 3.2%</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Average Order Value</p>
                  <p className="font-semibold text-sm mt-1">{formatCurrency(kpis.totalOrders > 0 ? kpis.totalMTD / kpis.totalOrders : 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sales Entry Sheet / Bottom Sheet Drawer */}
      <Sheet open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          setVendorId('');
          setPaymentMethod('cash');
          setQuantities({});
          setAmountPaid('0');
          setIsManualAmount(false);
        }
      }}>
        <SheetContent side={isMobile ? "bottom" : "right"} className={`w-full ${isMobile ? "h-[85vh] rounded-t-2xl px-4 pb-8" : "sm:max-w-md"} flex flex-col gap-0 border-border bg-background p-6 shadow-xl`}>
          <SheetHeader className="pb-4 border-b">
            <SheetTitle className="text-xl font-bold flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-primary/10 text-primary">📊</span>
              New Sales Entry
            </SheetTitle>
            <SheetDescription>
              Record products sold and cash collected from a vendor.
            </SheetDescription>
          </SheetHeader>

          {/* Form Content Scrollable Area */}
          <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1 scrollbar-thin">
            {/* Vendor Selection */}
            <div className="space-y-2">
              <Label htmlFor="vendor-select" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Select Vendor</Label>
              <Select value={vendorId} onValueChange={setVendorId}>
                <SelectTrigger id="vendor-select" className="w-full h-11 bg-muted/30 border-border">
                  <SelectValue placeholder="Choose vendor..." />
                </SelectTrigger>
                <SelectContent>
                  {vendors.filter(v => v.status === 'active').map((v) => (
                    <SelectItem key={v.id} value={v.id}>{v.name} ({v.vendor_code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Product List with finger-friendly selectors */}
            <div className="space-y-2.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Products & Quantities</Label>
              <div className="space-y-2 max-h-[30vh] overflow-y-auto pr-1 scrollbar-thin">
                {products.length > 0 ? (
                  products.map((p) => {
                    const qty = quantities[p.id] || 0;
                    return (
                      <div key={p.id} className="flex items-center justify-between p-3 rounded-xl border border-border/80 bg-card hover:bg-accent/10 transition-colors">
                        <div className="min-w-0 flex-1 pr-2">
                          <p className="text-sm font-semibold truncate text-foreground">{p.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">₦{Number(p.unit_price).toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            disabled={qty === 0}
                            className="h-8 w-8 rounded-lg shrink-0"
                            onClick={() => setQuantities(q => ({ ...q, [p.id]: Math.max(0, qty - 1) }))}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </Button>
                          <span className="w-8 text-center text-sm font-semibold">{qty}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-lg shrink-0"
                            onClick={() => setQuantities(q => ({ ...q, [p.id]: qty + 1 }))}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No products found</p>
                )}
              </div>
            </div>

            {/* Payment Details */}
            <div className="space-y-4 pt-4 border-t">
              {/* Payment Method */}
              <div className="space-y-2">
                <Label htmlFor="payment-method" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger id="payment-method" className="w-full h-11 bg-muted/30 border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">💵 Cash</SelectItem>
                    <SelectItem value="mobile_money">📱 Mobile Money</SelectItem>
                    <SelectItem value="mixed">🔄 Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Amount Paid Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="amount-paid" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Amount Paid (₦)</Label>
                  {isManualAmount && (
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-[10px] text-primary h-auto p-0 hover:bg-transparent"
                      onClick={() => {
                        setIsManualAmount(false);
                        setAmountPaid(String(totalValue));
                      }}
                    >
                      Reset to Total
                    </Button>
                  )}
                </div>
                <Input
                  id="amount-paid"
                  type="number"
                  min={0}
                  className="h-11 bg-muted/30 border-border font-mono text-base"
                  value={amountPaid}
                  onChange={(e) => {
                    setIsManualAmount(true);
                    setAmountPaid(e.target.value);
                  }}
                />
              </div>
            </div>

            {/* Summary calculations */}
            <div className="p-4 rounded-xl bg-muted/50 border space-y-2 font-medium text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Sale Value:</span>
                <span className="font-semibold">₦{totalValue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount Paid:</span>
                <span className="font-semibold">₦{(Number(amountPaid) || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 border-t text-base font-bold">
                <span className="text-foreground">Outstanding (Debt):</span>
                <span className={totalValue - (Number(amountPaid) || 0) > 0 ? "text-rose-500" : "text-emerald-500"}>
                  ₦{Math.max(0, totalValue - (Number(amountPaid) || 0)).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Sheet Footer */}
          <SheetFooter className="pt-4 border-t flex flex-row gap-3 sm:flex-row sm:justify-end animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1 sm:flex-none h-11"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmitSale}
              disabled={createSale.isPending || totalValue === 0 || !vendorId}
              className="flex-1 sm:flex-none h-11 gap-1.5"
              {...viewerProps}
            >
              {createSale.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit Sale
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Mobile Floating Action Button (FAB) */}
      <div className="fixed bottom-20 right-4 z-40 sm:hidden">
        <Button
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/95 flex items-center justify-center"
          onClick={() => setIsOpen(true)}
          {...viewerProps}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
