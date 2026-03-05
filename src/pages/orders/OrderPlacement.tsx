import { useState } from 'react';
import { products } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { ShoppingCart } from 'lucide-react';

export default function OrderPlacement() {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState('');

  const totalValue = products.reduce((s, p) => s + (quantities[p.id] || 0) * p.unitPrice, 0);

  const handleSubmit = () => {
    toast({ title: '✅ Order Placed', description: `Order #ORD-${String(Math.floor(Math.random() * 900) + 100)} submitted to FanMilk depot. Total: ₦${totalValue.toLocaleString()}` });
    setQuantities({});
    setNotes('');
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="text-2xl font-bold flex items-center gap-2"><ShoppingCart className="h-6 w-6" /> Place Depot Order</h1>

      <Card>
        <CardHeader><CardTitle className="text-base">Order Items</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="text-muted-foreground">{p.category}</TableCell>
                  <TableCell>₦{p.unitPrice}</TableCell>
                  <TableCell><Input type="number" min={0} className="w-20 h-8" value={quantities[p.id] || ''} onChange={e => setQuantities(q => ({ ...q, [p.id]: parseInt(e.target.value) || 0 }))} /></TableCell>
                  <TableCell className="text-right">₦{((quantities[p.id] || 0) * p.unitPrice).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-4 space-y-4 border-t pt-4">
            <div className="space-y-2"><Label>Notes</Label><Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Special instructions..." /></div>
            <div className="flex items-center justify-between">
              <p className="text-xl font-bold">Total: ₦{totalValue.toLocaleString()}</p>
              <Button onClick={handleSubmit} disabled={totalValue === 0}>Submit Order</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
