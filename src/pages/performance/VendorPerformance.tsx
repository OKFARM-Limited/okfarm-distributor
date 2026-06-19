import { useOutletContext } from '@/contexts/OutletContext';
import { useVendors, useSales, useCheckIns, useAssets } from '@/hooks/useSupabaseData';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, BarChart2, Package, Users, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function VendorPerformance() {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const { data: vendors = [], isLoading: vLoading } = useVendors('all');
  const { data: sales = [], isLoading: sLoading } = useSales('all');
  const { data: assets = [], isLoading: aLoading } = useAssets('all');

  const vendor = vendors.find(v => v.id === vendorId);
  const vendorSales = sales.filter(s => s.vendor_id === vendorId).slice(0, 30).reverse();
  const vendorAssets = assets.filter(a => a.assigned_to === vendorId);

  const chartData = vendorSales.map(s => ({
    date: new Date(s.date).toLocaleDateString('en', { day: '2-digit', month: 'short' }),
    sales: Number(s.total_value),
    paid: Number(s.amount_paid),
  }));
  const totalRevenue = vendorSales.reduce((s, r) => s + Number(r.total_value), 0);
  const avgDaily = vendorSales.length > 0 ? Math.round(totalRevenue / vendorSales.length) : 0;

  if (vLoading || sLoading || aLoading) return <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (!vendor) return <p className="text-center text-muted-foreground p-8">Vendor not found</p>;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{vendor.name}</h1>
          <p className="text-muted-foreground text-sm">Performance overview · {vendor.territory} · {vendor.vendor_code}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="self-start" variant={vendor.status === 'active' ? 'default' : 'destructive'}>{vendor.status}</Badge>
          <Button size="sm" variant="ghost" onClick={() => navigate('/performance')} className="gap-1"><ArrowLeft className="h-4 w-4" /> Back</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4 pb-3 px-4">
          <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 mb-2"><Users className="h-5 w-5" /></div>
          <p className="text-xs text-muted-foreground">Days Worked</p>
          <p className="text-xl font-bold">{vendor.days_worked || 0}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 pb-3 px-4">
          <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 mb-2"><TrendingUp className="h-5 w-5" /></div>
          <p className="text-xs text-muted-foreground">Total Revenue</p>
          <p className="text-xl font-bold">₦{totalRevenue.toLocaleString()}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 pb-3 px-4">
          <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 mb-2"><BarChart2 className="h-5 w-5" /></div>
          <p className="text-xs text-muted-foreground">Avg Daily</p>
          <p className="text-xl font-bold">₦{avgDaily.toLocaleString()}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 pb-3 px-4">
          <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 mb-2"><Package className="h-5 w-5" /></div>
          <p className="text-xs text-muted-foreground">Assets</p>
          <p className="text-xl font-bold">{vendorAssets.length}</p>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Sales vs Payments</CardTitle></CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData}>
                <XAxis dataKey="date" fontSize={11} tickLine={false} />
                <YAxis fontSize={11} tickLine={false} tickFormatter={v => `₦${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => `₦${v.toLocaleString()}`} />
                <Line type="monotone" dataKey="sales" stroke="hsl(var(--primary))" strokeWidth={2} name="Sales" />
                <Line type="monotone" dataKey="paid" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Paid" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground py-8">No sales data for this vendor yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
