import { useState } from 'react';
import { inboundDeliveries, stockLevels, products } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Truck, Package, AlertTriangle, Eye, CheckCircle } from 'lucide-react';

export default function InventoryInbound() {
  const [deliveries, setDeliveries] = useState(inboundDeliveries);
  const [viewDelivery, setViewDelivery] = useState<typeof inboundDeliveries[0] | null>(null);

  const totalStock = stockLevels.reduce((s, l) => s + l.currentStock, 0);
  const lowStockItems = stockLevels.filter(s => s.currentStock <= s.minStock);
  const pendingDeliveries = deliveries.filter(d => d.status === 'pending');

  const markReceived = (id: string) => {
    setDeliveries(prev => prev.map(d => d.id === id ? { ...d, status: 'received' as const, receivedBy: 'Depot Manager' } : d));
    toast({ title: '✅ Delivery Received', description: `Delivery ${id} marked as received.` });
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Truck className="h-6 w-6" /> Inventory Inbound</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card><CardContent className="pt-4 text-center"><Package className="h-5 w-5 mx-auto text-primary mb-1" /><p className="text-2xl font-bold">{totalStock}</p><p className="text-xs text-muted-foreground">Total Units in Stock</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><Truck className="h-5 w-5 mx-auto text-secondary mb-1" /><p className="text-2xl font-bold">{pendingDeliveries.length}</p><p className="text-xs text-muted-foreground">Pending Deliveries</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><AlertTriangle className="h-5 w-5 mx-auto text-destructive mb-1" /><p className="text-2xl font-bold">{lowStockItems.length}</p><p className="text-xs text-muted-foreground">Low Stock SKUs</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><CheckCircle className="h-5 w-5 mx-auto text-success mb-1" /><p className="text-2xl font-bold">{deliveries.filter(d => d.status === 'verified').length}</p><p className="text-xs text-muted-foreground">Verified This Month</p></CardContent></Card>
      </div>

      <Tabs defaultValue="stock">
        <TabsList><TabsTrigger value="stock">Stock Levels</TabsTrigger><TabsTrigger value="deliveries">Deliveries</TabsTrigger></TabsList>

        <TabsContent value="stock">
          <Card>
            <CardHeader><CardTitle className="text-base">Net Stock Position</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {stockLevels.map(s => {
                const pct = Math.min((s.currentStock / s.maxStock) * 100, 100);
                const isLow = s.currentStock <= s.minStock;
                return (
                  <div key={s.productId} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className={isLow ? 'text-destructive font-medium' : ''}>{s.productName}</span>
                      <span className="text-muted-foreground">{s.currentStock} / {s.maxStock} {isLow && '⚠️'}</span>
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
                  <TableRow>
                    <TableHead>Delivery ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveries.map(d => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">{d.id}</TableCell>
                      <TableCell>{d.date}</TableCell>
                      <TableCell className="text-muted-foreground">{d.invoiceNumber}</TableCell>
                      <TableCell>{d.items.length} SKUs</TableCell>
                      <TableCell>₦{d.totalValue.toLocaleString()}</TableCell>
                      <TableCell>{d.dueDate}</TableCell>
                      <TableCell>
                        <Badge variant={d.status === 'verified' ? 'default' : d.status === 'received' ? 'secondary' : 'outline'}>{d.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button size="sm" variant="ghost" onClick={() => setViewDelivery(d)}><Eye className="h-3 w-3" /></Button>
                        {d.status === 'pending' && <Button size="sm" onClick={() => markReceived(d.id)}>Receive</Button>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delivery Detail Dialog */}
      <Dialog open={!!viewDelivery} onOpenChange={o => !o && setViewDelivery(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Delivery {viewDelivery?.id}</DialogTitle></DialogHeader>
          {viewDelivery && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-muted-foreground">Invoice:</span> {viewDelivery.invoiceNumber}</div>
                <div><span className="text-muted-foreground">Date:</span> {viewDelivery.date}</div>
                <div><span className="text-muted-foreground">Credit Term:</span> {viewDelivery.creditTermDays} days</div>
                <div><span className="text-muted-foreground">Due:</span> {viewDelivery.dueDate}</div>
              </div>
              <Table>
                <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Qty</TableHead><TableHead className="text-right">Value</TableHead></TableRow></TableHeader>
                <TableBody>
                  {viewDelivery.items.map(i => (
                    <TableRow key={i.productId}>
                      <TableCell>{i.productName}</TableCell>
                      <TableCell>{i.quantity}</TableCell>
                      <TableCell className="text-right">₦{(i.quantity * i.unitPrice).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <p className="text-right font-bold">Total: ₦{viewDelivery.totalValue.toLocaleString()}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
