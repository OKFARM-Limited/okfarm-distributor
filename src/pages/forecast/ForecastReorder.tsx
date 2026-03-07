import { products, salesRecords, stockLevels } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { toast } from '@/hooks/use-toast';
import { TrendingUp, ShoppingCart, AlertTriangle } from 'lucide-react';

export default function ForecastReorder() {
  // Calculate daily averages for each product over last 14 days
  const productStats = products.map(p => {
    const last14 = salesRecords.filter(s => {
      const d = new Date(s.date);
      const now = new Date();
      return (now.getTime() - d.getTime()) / 86400000 <= 14;
    });

    const dailySales: Record<string, number> = {};
    last14.forEach(s => {
      const item = s.items.find(i => i.productId === p.id);
      if (item) {
        dailySales[s.date] = (dailySales[s.date] || 0) + item.qtySold;
      }
    });

    const days = Object.keys(dailySales);
    const totalQty = Object.values(dailySales).reduce((s, v) => s + v, 0);
    const avgDaily = days.length > 0 ? Math.round(totalQty / days.length) : 0;

    const stock = stockLevels.find(sl => sl.productId === p.id);
    const currentStock = stock?.currentStock || 0;
    const daysUntilStockout = avgDaily > 0 ? Math.floor(currentStock / avgDaily) : 999;
    const suggestedOrder = Math.max(0, avgDaily * 7 - currentStock); // 7-day supply minus current

    // Trend data
    const trendData = Array.from({ length: 14 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (13 - i));
      const dateStr = d.toISOString().split('T')[0];
      return { date: d.toLocaleDateString('en', { day: '2-digit', month: 'short' }), qty: dailySales[dateStr] || 0 };
    });

    return { ...p, avgDaily, currentStock, daysUntilStockout, suggestedOrder, trendData, minStock: stock?.minStock || 50 };
  });

  const urgentItems = productStats.filter(p => p.daysUntilStockout <= 3);
  const totalSuggested = productStats.reduce((s, p) => s + p.suggestedOrder * p.unitPrice, 0);

  const handleAutoOrder = () => {
    const itemsToOrder = productStats.filter(p => p.suggestedOrder > 0);
    toast({ title: '📦 Order Drafted', description: `${itemsToOrder.length} items added to depot order totaling ₦${totalSuggested.toLocaleString()}` });
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><TrendingUp className="h-6 w-6" /> Forecast & Reorder</h1>
        <Button onClick={handleAutoOrder} className="gap-1" disabled={totalSuggested === 0}>
          <ShoppingCart className="h-4 w-4" /> Auto-Order (₦{totalSuggested.toLocaleString()})
        </Button>
      </div>

      {/* Urgent Alerts */}
      {urgentItems.length > 0 && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-2">
          <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
          <span className="text-sm"><strong>{urgentItems.length} products</strong> will stock out within 3 days: {urgentItems.map(i => i.name).join(', ')}</span>
        </div>
      )}

      {/* Trend Chart for top product */}
      <Card>
        <CardHeader><CardTitle className="text-base">14-Day Sales Trend — {productStats[0]?.name}</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={productStats[0]?.trendData}>
              <XAxis dataKey="date" fontSize={11} tickLine={false} />
              <YAxis fontSize={11} tickLine={false} />
              <Tooltip />
              <ReferenceLine y={productStats[0]?.avgDaily} stroke="hsl(38, 92%, 50%)" strokeDasharray="3 3" label="Avg" />
              <Line type="monotone" dataKey="qty" stroke="hsl(210, 80%, 45%)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Product Forecast Table */}
      <Card>
        <CardHeader><CardTitle className="text-base">Reorder Suggestions (7-Day Supply Target)</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Avg Daily</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Days Left</TableHead>
                <TableHead>Stock Level</TableHead>
                <TableHead>Suggested Order</TableHead>
                <TableHead className="text-right">Order Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productStats.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.avgDaily} {p.unit}s/day</TableCell>
                  <TableCell>{p.currentStock}</TableCell>
                  <TableCell>
                    <Badge variant={p.daysUntilStockout <= 3 ? 'destructive' : p.daysUntilStockout <= 7 ? 'secondary' : 'outline'}>
                      {p.daysUntilStockout > 30 ? '30+' : p.daysUntilStockout} days
                    </Badge>
                  </TableCell>
                  <TableCell className="w-32">
                    <Progress value={Math.min((p.currentStock / (p.minStock * 5)) * 100, 100)} className={p.currentStock <= p.minStock ? '[&>div]:bg-destructive' : ''} />
                  </TableCell>
                  <TableCell className="font-medium">{p.suggestedOrder > 0 ? p.suggestedOrder : '—'}</TableCell>
                  <TableCell className="text-right">{p.suggestedOrder > 0 ? `₦${(p.suggestedOrder * p.unitPrice).toLocaleString()}` : '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
