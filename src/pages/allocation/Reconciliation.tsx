import { useState } from 'react';
import { vendors, products, allocations } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function Reconciliation() {
  const [vendorId, setVendorId] = useState('');
  const [returns, setReturns] = useState<Record<string, number>>({});
  const [spoilage, setSpoilage] = useState<Record<string, number>>({});

  const vendor = vendors.find(v => v.id === vendorId);
  const todayAlloc = allocations.find(a => a.vendorId === vendorId && a.status === 'confirmed');

  const handleReconcile = () => {
    toast({ title: 'Reconciliation Saved', description: `Evening reconciliation for ${vendor?.name} completed.` });
    setVendorId('');
    setReturns({});
    setSpoilage({});
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="text-2xl font-bold">Evening Reconciliation</h1>

      <Card>
        <CardHeader><CardTitle className="text-base">Select Vendor</CardTitle></CardHeader>
        <CardContent>
          <Select value={vendorId} onValueChange={v => { setVendorId(v); setReturns({}); setSpoilage({}); }}>
            <SelectTrigger className="max-w-md"><SelectValue placeholder="Choose vendor..." /></SelectTrigger>
            <SelectContent>
              {vendors.filter(v => v.status === 'active').map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {vendorId && todayAlloc && (
        <Card>
          <CardHeader><CardTitle className="text-base">Reconcile — {vendor?.name}</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Allocated</TableHead>
                  <TableHead>Returned</TableHead>
                  <TableHead>Spoilage</TableHead>
                  <TableHead>Sold</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {todayAlloc.items.map(item => {
                  const ret = returns[item.productId] || 0;
                  const sp = spoilage[item.productId] || 0;
                  const sold = item.quantity - ret - sp;
                  const hasExpiry = sp > 0;
                  return (
                    <TableRow key={item.productId}>
                      <TableCell className="font-medium">{item.productName}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>
                        <Input type="number" min={0} max={item.quantity} className="w-16 h-8" value={ret || ''} onChange={e => setReturns(r => ({ ...r, [item.productId]: parseInt(e.target.value) || 0 }))} />
                      </TableCell>
                      <TableCell>
                        <Input type="number" min={0} className="w-16 h-8" value={sp || ''} onChange={e => setSpoilage(s => ({ ...s, [item.productId]: parseInt(e.target.value) || 0 }))} />
                      </TableCell>
                      <TableCell>
                        {sold}
                        {hasExpiry && <Badge variant="destructive" className="ml-1 text-[10px]"><AlertTriangle className="h-3 w-3 mr-0.5" />Spoil</Badge>}
                      </TableCell>
                      <TableCell className="text-right">₦{(sold * item.unitPrice).toLocaleString()}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <div className="flex justify-end mt-4">
              <Button onClick={handleReconcile}>Save Reconciliation</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {vendorId && !todayAlloc && (
        <Card><CardContent className="pt-6 text-center text-muted-foreground">No allocation found for this vendor today.</CardContent></Card>
      )}
    </div>
  );
}
