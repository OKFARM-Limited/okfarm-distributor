import { useState } from 'react';
import { useOutletContext } from '@/contexts/OutletContext';
import { useProducts, useCreateOrder, useOrders, useUpdateOrder } from '@/hooks/useSupabaseData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { ShoppingCart, Loader2, CheckCircle, Truck, Clock } from 'lucide-react';
import { ViewerBanner } from '@/components/ViewerGuard';
import { useViewerGuard } from '@/hooks/useViewerGuard';

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'secondary', confirmed: 'outline', in_transit: 'outline', delivered: 'default', cancelled: 'destructive',
};
const statusIcon: Record<string, React.ReactNode> = {
  pending: <Clock className="h-3 w-3" />, confirmed: <CheckCircle className="h-3 w-3" />,
  in_transit: <Truck className="h-3 w-3" />, delivered: <CheckCircle className="h-3 w-3 text-green-500" />,
};

export default function OrderPlacement() {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState('');
  const { selectedOutletId, isAllOutlets } = useOutletContext();
  const { data: products = [], isLoading: pLoading } = useProducts();
  const { data: orders = [], isLoading: oLoading } = useOrders(isAllOutlets ? 'all' : selectedOutletId);
  const createOrder = useCreateOrder();
  const updateOrder = useUpdateOrder();
  const { viewerProps } = useViewerGuard();

  const totalValue = products.reduce((s, p) => s + (quantities[p.id] || 0) * Number(p.unit_price), 0);

  const handleSubmit = () => {
    const items = products.filter(p => quantities[p.id] > 0).map(p => ({
      product_id: p.id, quantity: quantities[p.id], unit_price: Number(p.unit_price),
    }));
    createOrder.mutate({
      outlet_id: isAllOutlets ? null : selectedOutletId,
      total_value: totalValue, status: 'pending',
      order_date: new Date().toISOString().split('T')[0],
      expected_delivery: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      notes, items,
    }, {
      onSuccess: () => { toast({ title: '✅ Order Placed', description: `Total: ₦${totalValue.toLocaleString()}` }); setQuantities({}); setNotes(''); },
      onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
    });
  };

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    updateOrder.mutate({ id: orderId, status: newStatus }, {
      onSuccess: () => toast({ title: '✅ Updated', description: `Order status changed to ${newStatus}` }),
      onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
    });
  };

  if (pLoading || oLoading) return <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="text-2xl font-bold flex items-center gap-2"><ShoppingCart className="h-6 w-6" /> Orders</h1>

      <Tabs defaultValue="new">
        <TabsList><TabsTrigger value="new">New Order</TabsTrigger><TabsTrigger value="history">Order History ({(orders as any[]).length})</TabsTrigger></TabsList>

        <TabsContent value="new">
          <Card>
            <CardHeader><CardTitle className="text-base">Order Items</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Product</TableHead><TableHead>Category</TableHead><TableHead>Unit Price</TableHead><TableHead>Quantity</TableHead><TableHead className="text-right">Subtotal</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {products.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="text-muted-foreground">{p.category}</TableCell>
                      <TableCell>₦{Number(p.unit_price)}</TableCell>
                      <TableCell><Input type="number" min={0} className="w-20 h-8" value={quantities[p.id] || ''} onChange={e => setQuantities(q => ({ ...q, [p.id]: parseInt(e.target.value) || 0 }))} /></TableCell>
                      <TableCell className="text-right">₦{((quantities[p.id] || 0) * Number(p.unit_price)).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 space-y-4 border-t pt-4">
                <div className="space-y-2"><Label>Notes</Label><Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Special instructions..." /></div>
                <div className="flex items-center justify-between">
                  <p className="text-xl font-bold">Total: ₦{totalValue.toLocaleString()}</p>
                  <Button onClick={handleSubmit} disabled={totalValue === 0 || createOrder.isPending} {...viewerProps}>
                    {createOrder.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}Submit Order
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Outlet</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Expected</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Update</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(orders as any[]).map(o => (
                    <TableRow key={o.id}>
                      <TableCell>{o.order_date}</TableCell>
                      <TableCell>{o.outlets?.name || '—'}</TableCell>
                      <TableCell>{o.order_items?.length || 0} items</TableCell>
                      <TableCell className="font-medium">₦{Number(o.total_value).toLocaleString()}</TableCell>
                      <TableCell>{o.expected_delivery || '—'}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant[o.status] || 'secondary'} className="gap-1">
                          {statusIcon[o.status]}{o.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {o.status !== 'delivered' && o.status !== 'cancelled' && (
                          <Select onValueChange={(v) => handleStatusUpdate(o.id, v)}>
                            <SelectTrigger className="h-8 w-32"><SelectValue placeholder="Change..." /></SelectTrigger>
                            <SelectContent>
                              {o.status === 'pending' && <SelectItem value="confirmed">Confirm</SelectItem>}
                              {(o.status === 'pending' || o.status === 'confirmed') && <SelectItem value="in_transit">In Transit</SelectItem>}
                              {(o.status === 'confirmed' || o.status === 'in_transit') && <SelectItem value="delivered">Delivered</SelectItem>}
                              <SelectItem value="cancelled">Cancel</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(orders as any[]).length === 0 && (
                    <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No orders yet.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
