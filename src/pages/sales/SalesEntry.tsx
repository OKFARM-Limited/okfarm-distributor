import { useState } from 'react';
import { vendors, products, getOutletName } from '@/data/mockData';
import { useOutletContext } from '@/contexts/OutletContext';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Download, MapPin } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function SalesEntry() {
  const [vendorId, setVendorId] = useState('');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'mobile_money' | 'mixed'>('cash');
  const [amountPaid, setAmountPaid] = useState(0);
  const { selectedOutletId, isAllOutlets } = useOutletContext();

  const filteredVendors = isAllOutlets ? vendors : vendors.filter(v => v.outletId === selectedOutletId);
  const totalValue = products.reduce((s, p) => s + (quantities[p.id] || 0) * p.unitPrice, 0);
  const vendor = vendors.find(v => v.id === vendorId);

  const handleSubmit = () => {
    const sale = { vendorId, outletId: vendor?.outletId, date: new Date().toISOString().split('T')[0], items: products.filter(p => quantities[p.id] > 0).map(p => ({ productId: p.id, productName: p.name, qty: quantities[p.id], unitPrice: p.unitPrice })), totalValue, paymentMethod, amountPaid };
    const drafts = JSON.parse(localStorage.getItem('okfarm_sales_drafts') || '[]');
    drafts.push(sale);
    localStorage.setItem('okfarm_sales_drafts', JSON.stringify(drafts));
    toast({ title: 'Sales Recorded', description: `₦${totalValue.toLocaleString()} for ${vendor?.name}` });
    setVendorId(''); setQuantities({}); setAmountPaid(0);
  };

  const handleExportCSV = () => {
    if (!vendorId || totalValue === 0) { toast({ title: 'Nothing to export', description: 'Record sales first.' }); return; }
    const date = new Date().toISOString().split('T')[0];
    const rows = products.filter(p => quantities[p.id] > 0).map(p =>
      `${date},${vendor?.name},${getOutletName(vendor?.outletId || '')},${p.name},${p.category},${p.unit},${p.unitPrice},${quantities[p.id]},${(quantities[p.id] || 0) * p.unitPrice}`
    );
    const csv = 'Date,Vendor,Outlet,Product,Category,Unit,Unit Price (₦),Qty Sold,Total Value (₦)\n' + rows.join('\n') +
      `\n\n,,,,,,TOTAL,,₦${totalValue.toLocaleString()}` +
      `\n,,,,,,Payment Method,,${paymentMethod.replace('_', ' ')}` +
      `\n,,,,,,Amount Paid,,₦${amountPaid.toLocaleString()}` +
      `\n,,,,,,Outstanding,,₦${Math.max(0, totalValue - amountPaid).toLocaleString()}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `sales_log_${vendor?.name?.replace(/\s/g, '_')}_${date}.csv`; a.click();
    toast({ title: 'Sales Log Exported', description: 'CSV file downloaded.' });
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Daily Sales Entry</h1>
          {!isAllOutlets && <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{getOutletName(selectedOutletId)}</p>}
        </div>
        <Button variant="outline" onClick={handleExportCSV} disabled={!vendorId || totalValue === 0}>
          <Download className="h-4 w-4 mr-1" /> Export Sales Log
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Vendor</Label>
              <Select value={vendorId} onValueChange={setVendorId}>
                <SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger>
                <SelectContent>{filteredVendors.filter(v => v.status === 'active').map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={v => setPaymentMethod(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {vendorId && (
            <>
              <Table>
                <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Price</TableHead><TableHead>Qty Sold</TableHead><TableHead className="text-right">Value</TableHead></TableRow></TableHeader>
                <TableBody>
                  {products.map(p => (
                    <TableRow key={p.id}>
                      <TableCell>{p.name}</TableCell>
                      <TableCell>₦{p.unitPrice}</TableCell>
                      <TableCell><Input type="number" min={0} className="w-20 h-8" value={quantities[p.id] || ''} onChange={e => setQuantities(q => ({ ...q, [p.id]: parseInt(e.target.value) || 0 }))} /></TableCell>
                      <TableCell className="text-right">₦{((quantities[p.id] || 0) * p.unitPrice).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="grid sm:grid-cols-3 gap-4 pt-4 border-t">
                <div><Label>Total Value</Label><p className="text-xl font-bold">₦{totalValue.toLocaleString()}</p></div>
                <div className="space-y-2"><Label>Amount Paid</Label><Input type="number" value={amountPaid || ''} onChange={e => setAmountPaid(parseInt(e.target.value) || 0)} /></div>
                <div><Label>Outstanding</Label><p className="text-xl font-bold text-destructive">₦{Math.max(0, totalValue - amountPaid).toLocaleString()}</p></div>
              </div>

              <Button onClick={handleSubmit} disabled={totalValue === 0} className="w-full sm:w-auto">Record Sales</Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
