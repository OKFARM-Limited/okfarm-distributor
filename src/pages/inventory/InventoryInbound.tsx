import { useState } from 'react';
import { useOutletContext } from '@/contexts/OutletContext';
import { useInboundDeliveries, useUpdateDelivery, useStockLevels } from '@/hooks/useSupabaseData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Truck, Package, AlertTriangle, Eye, CheckCircle, Loader2 } from 'lucide-react';

export default function InventoryInbound() {
  const [viewDelivery, setViewDelivery] = useState<any>(null);
  const { selectedOutletId, isAllOutlets } = useOutletContext();
  const { data: deliveries = [], isLoading: dLoading } = useInboundDeliveries(isAllOutlets ? 'all' : selectedOutletId);
  const { data: stockLevels = [], isLoading: sLoading } = useStockLevels(isAllOutlets ? 'all' : selectedOutletId);
  const updateDelivery = useUpdateDelivery();

  const totalStock = (stockLevels as any[]).reduce((s, l) => s + l.current_stock, 0);
  const lowStockItems = (stockLevels as any[]).filter(s => s.current_stock <= s.min_stock);
  const pendingDeliveries = (deliveries as any[]).filter(d => d.status === 'pending');

  const markReceived = (id: string) => {
    updateDelivery.mutate(
      { id, status: 'received', received_by: 'Depot Manager' },
      {
        onSuccess: () => toast({ title: '✅ Delivery Received', description: 'Delivery marked as received.' }),
        onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
      }
    );
  };

  if (dLoading || sLoading) return <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Truck className="h-6 w-6" /> Inventory Inbound</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card><CardContent className="pt-4 text-center"><Package className="h-5 w-5 mx-auto text-primary mb-1" /><p className="text-2xl font-bold">{totalStock}</p><p className="text-xs text-muted-foreground">Total Units in Stock</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><Truck className="h-5 w-5 mx-auto text-secondary mb-1" /><p className="text-2xl font-bold">{pendingDeliveries.length}</p><p className="text-xs text-muted-foreground">Pending Deliveries</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><AlertTriangle className="h-5 w-5 mx-auto text-destructive mb-1" /><p className="text-2xl font-bold">{lowStockItems.length}</p><p className="text-xs text-muted-foreground">Low Stock SKUs</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><CheckCircle className="h-5 w-5 mx-auto text-green-500 mb-1" /><p className="text-2xl font-bold">{(deliveries as any[]).filter(d => d.status === 'verified' || d.status === 'received').length}</p><p className="text-xs text-muted-foreground">Received</p></CardContent></Card>
      </div>

      <Tabs defaultValue="stock">
        <TabsList><TabsTrigger value="stock">Stock Levels</TabsTrigger><TabsTrigger value="deliveries">Deliveries</TabsTrigger></TabsList>

        <TabsContent value="stock">
          <Card>
            <CardHeader><CardTitle className="text-base">Net Stock Position</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {(stockLevels as any[]).length === 0 && <p className="text-center text-muted-foreground py-8">No stock data yet. Stock levels will appear here once populated.</p>}
              {(stockLevels as any[]).map((s: any) => {
                const pct = Math.min((s.current_stock / s.max_stock) * 100, 100);
                const isLow = s.current_stock <= s.min_stock;
                return (
                  <div key={s.id} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className={isLow ? 'text-destructive font-medium' : ''}>{s.products?.name || 'Unknown'}</span>
                      <span className="text-muted-foreground">{s.current_stock} / {s.max_stock} {isLow && '⚠️'}</span>
                    </div>
                    <Progress value={pct} className={isLow ? '[&>div]:bg-destructive' : ''} />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deliveries">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Date</TableHead><TableHead>Invoice</TableHead><TableHead>Supplier</TableHead><TableHead>Items</TableHead><TableHead>Total</TableHead><TableHead>Due Date</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {(deliveries as any[]).map(d => (
                    <TableRow key={d.id}>
                      <TableCell>{d.date}</TableCell>
                      <TableCell className="text-muted-foreground">{d.invoice_number}</TableCell>
                      <TableCell>{d.supplier}</TableCell>
                      <TableCell>{d.delivery_items?.length || 0} SKUs</TableCell>
                      <TableCell>₦{Number(d.total_value).toLocaleString()}</TableCell>
                      <TableCell>{d.due_date}</TableCell>
                      <TableCell><Badge variant={d.status === 'received' ? 'default' : d.status === 'verified' ? 'secondary' : 'outline'}>{d.status}</Badge></TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button size="sm" variant="ghost" onClick={() => setViewDelivery(d)}><Eye className="h-3 w-3" /></Button>
                        {d.status === 'pending' && <Button size="sm" onClick={() => markReceived(d.id)}>Receive</Button>}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(deliveries as any[]).length === 0 && (
                    <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No deliveries recorded yet.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!viewDelivery} onOpenChange={o => !o && setViewDelivery(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Delivery Details</DialogTitle></DialogHeader>
          {viewDelivery && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-muted-foreground">Invoice:</span> {viewDelivery.invoice_number}</div>
                <div><span className="text-muted-foreground">Date:</span> {viewDelivery.date}</div>
                <div><span className="text-muted-foreground">Credit Term:</span> {viewDelivery.credit_term_days} days</div>
                <div><span className="text-muted-foreground">Due:</span> {viewDelivery.due_date}</div>
              </div>
              <Table>
                <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Qty</TableHead><TableHead className="text-right">Value</TableHead></TableRow></TableHeader>
                <TableBody>
                  {(viewDelivery.delivery_items || []).map((i: any) => (
                    <TableRow key={i.id}>
                      <TableCell>{i.products?.name}</TableCell>
                      <TableCell>{i.quantity}</TableCell>
                      <TableCell className="text-right">₦{(i.quantity * Number(i.unit_price)).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <p className="text-right font-bold">Total: ₦{Number(viewDelivery.total_value).toLocaleString()}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
