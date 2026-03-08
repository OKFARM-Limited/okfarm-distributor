import { useState } from 'react';
import { useOutletContext } from '@/contexts/OutletContext';
import { useProducts, useCreateOrder } from '@/hooks/useSupabaseData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { ShoppingCart, Loader2 } from 'lucide-react';

export default function OrderPlacement() {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState('');
  const { selectedOutletId, isAllOutlets } = useOutletContext();
  const { data: products = [], isLoading } = useProducts();
  const createOrder = useCreateOrder();

  const totalValue = products.reduce((s, p) => s + (quantities[p.id] || 0) * Number(p.unit_price), 0);

  const handleSubmit = () => {
    const items = products.filter(p => quantities[p.id] > 0).map(p => ({
      product_id: p.id,
      quantity: quantities[p.id],
      unit_price: Number(p.unit_price),
    }));
    createOrder.mutate(
      {
        outlet_id: isAllOutlets ? null : selectedOutletId,
        total_value: totalValue,
        status: 'pending',
        order_date: new Date().toISOString().split('T')[0],
        expected_delivery: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
        notes,
        items,
      },
      {
        onSuccess: (data) => {
          toast({ title: '✅ Order Placed', description: `Order submitted. Total: ₦${totalValue.toLocaleString()}` });
          setQuantities({}); setNotes('');
        },
        onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
      }
    );
  };

  if (isLoading) return <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="text-2xl font-bold flex items-center gap-2"><ShoppingCart className="h-6 w-6" /> Place Depot Order</h1>
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
              <Button onClick={handleSubmit} disabled={totalValue === 0 || createOrder.isPending}>
                {createOrder.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                Submit Order
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
