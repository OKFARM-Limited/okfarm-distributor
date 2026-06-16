import { useOutletContext } from '@/contexts/OutletContext';
import { useForecasts, useProducts, useStockLevels, useSales } from '@/hooks/useSupabaseData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { TrendingUp, ShoppingCart, AlertTriangle, Loader2 } from 'lucide-react';
import { ViewerBanner } from '@/components/ViewerGuard';
import { useViewerGuard } from '@/hooks/useViewerGuard';

export default function ForecastReorder() {
  const { selectedOutletId, isAllOutlets } = useOutletContext();
  const { data: forecasts = [], isLoading: fLoading } = useForecasts(isAllOutlets ? 'all' : selectedOutletId);
  const { data: products = [], isLoading: pLoading } = useProducts();
  const { data: stockLevels = [], isLoading: sLoading } = useStockLevels(isAllOutlets ? 'all' : selectedOutletId);

  const isLoading = fLoading || pLoading || sLoading;
  const { viewerProps } = useViewerGuard();

  // If we have forecasts from DB, use them; otherwise compute from stock levels
  const productStats = forecasts.length > 0
    ? forecasts.map(f => ({
        id: f.product_id,
        name: f.products?.name || 'Unknown',
        unit: f.products?.unit || 'pack',
        unitPrice: Number(f.products?.unit_price || 0),
        avgDaily: Number(f.avg_daily_sales),
        currentStock: f.current_stock,
        daysUntilStockout: f.days_until_stockout,
        suggestedOrder: f.suggested_order,
        minStock: 50,
      }))
    : stockLevels.map(s => {
        const avgDaily = 10; // default estimate
        const daysLeft = avgDaily > 0 ? Math.floor(s.current_stock / avgDaily) : 999;
        return {
          id: s.product_id,
          name: s.products?.name || 'Unknown',
          unit: s.products?.unit || 'pack',
          unitPrice: Number(s.products?.unit_price || 0),
          avgDaily,
          currentStock: s.current_stock,
          daysUntilStockout: daysLeft,
          suggestedOrder: Math.max(0, avgDaily * 7 - s.current_stock),
          minStock: s.min_stock,
        };
      });

  const urgentItems = productStats.filter(p => p.daysUntilStockout <= 3);
  const totalSuggested = productStats.reduce((s, p) => s + p.suggestedOrder * p.unitPrice, 0);

  const handleAutoOrder = () => {
    const itemsToOrder = productStats.filter(p => p.suggestedOrder > 0);
    toast({ title: '📦 Order Drafted', description: `${itemsToOrder.length} items added to depot order totaling ₦${totalSuggested.toLocaleString()}` });
  };

  if (isLoading) return <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-4 animate-fade-in">
      <ViewerBanner />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><TrendingUp className="h-6 w-6" /> Forecast & Reorder</h1>
        <Button onClick={handleAutoOrder} className="gap-1" disabled={totalSuggested === 0} {...viewerProps}>
          <ShoppingCart className="h-4 w-4" /> Auto-Order (₦{totalSuggested.toLocaleString()})
        </Button>
      </div>

      {urgentItems.length > 0 && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-2">
          <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
          <span className="text-sm"><strong>{urgentItems.length} products</strong> will stock out within 3 days: {urgentItems.map(i => i.name).join(', ')}</span>
        </div>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">Reorder Suggestions (7-Day Supply Target)</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow><TableHead>Product</TableHead><TableHead>Avg Daily</TableHead><TableHead>Current Stock</TableHead><TableHead>Days Left</TableHead><TableHead>Stock Level</TableHead><TableHead>Suggested Order</TableHead><TableHead className="text-right">Order Value</TableHead></TableRow>
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
              {productStats.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No forecast data available. Add stock levels or sales data to generate forecasts.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
