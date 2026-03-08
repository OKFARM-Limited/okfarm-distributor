import { useState } from 'react';
import { useOutletContext } from '@/contexts/OutletContext';
import { useVendors, useProducts, useCreateAllocation } from '@/hooks/useSupabaseData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, ChevronRight, MapPin, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ViewerBanner } from '@/components/ViewerGuard';
import { useViewerGuard } from '@/hooks/useViewerGuard';

export default function DailyAllocation() {
  const [step, setStep] = useState(0);
  const [vendorId, setVendorId] = useState('');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const { selectedOutletId, isAllOutlets, getOutletName } = useOutletContext();
  const { data: vendors = [], isLoading: vLoading } = useVendors(isAllOutlets ? 'all' : selectedOutletId);
  const { data: products = [], isLoading: pLoading } = useProducts();
  const createAllocation = useCreateAllocation();

  const vendor = vendors.find((v: any) => v.id === vendorId);
  const totalValue = products.reduce((s, p) => s + (quantities[p.id] || 0) * Number(p.unit_price), 0);

  const handleConfirm = () => {
    const items = products.filter(p => quantities[p.id] > 0).map(p => ({
      product_id: p.id,
      quantity: quantities[p.id],
      unit_price: Number(p.unit_price),
    }));
    createAllocation.mutate(
      {
        vendor_id: vendorId,
        outlet_id: vendor?.outlet_id || null,
        date: new Date().toISOString().split('T')[0],
        total_value: totalValue,
        status: 'confirmed',
        items,
      },
      {
        onSuccess: () => {
          toast({ title: 'Allocation Confirmed', description: `₦${totalValue.toLocaleString()} allocated to ${vendor?.name}` });
          setStep(0); setVendorId(''); setQuantities({});
        },
        onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
      }
    );
  };

  if (vLoading || pLoading) return <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Morning Stock Allocation</h1>
        {!isAllOutlets && <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{getOutletName(selectedOutletId)}</p>}
      </div>

      <div className="flex items-center gap-2 text-sm">
        {['Select Vendor', 'Set Quantities', 'Confirm'].map((s, i) => (
          <div key={s} className="flex items-center gap-1">
            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${i <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              {i < step ? <CheckCircle className="h-4 w-4" /> : i + 1}
            </div>
            <span className={`hidden sm:inline ${i <= step ? 'font-medium' : 'text-muted-foreground'}`}>{s}</span>
            {i < 2 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          </div>
        ))}
      </div>

      {step === 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Select Vendor</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Select value={vendorId} onValueChange={setVendorId}>
              <SelectTrigger><SelectValue placeholder="Choose a vendor..." /></SelectTrigger>
              <SelectContent>
                {vendors.filter((v: any) => v.status === 'active').map((v: any) => <SelectItem key={v.id} value={v.id}>{v.name} ({v.territory})</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={() => setStep(1)} disabled={!vendorId}>Next <ChevronRight className="h-4 w-4" /></Button>
          </CardContent>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Allocate SKUs for {vendor?.name}</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Unit Price</TableHead><TableHead>Quantity</TableHead><TableHead className="text-right">Value</TableHead></TableRow></TableHeader>
              <TableBody>
                {products.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>₦{Number(p.unit_price)}</TableCell>
                    <TableCell><Input type="number" min={0} className="w-20 h-8" value={quantities[p.id] || ''} onChange={e => setQuantities(q => ({ ...q, [p.id]: parseInt(e.target.value) || 0 }))} /></TableCell>
                    <TableCell className="text-right">₦{((quantities[p.id] || 0) * Number(p.unit_price)).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="font-bold text-lg">Total: ₦{totalValue.toLocaleString()}</p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(0)}>Back</Button>
                <Button onClick={() => setStep(2)} disabled={totalValue === 0}>Review</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Confirm Allocation</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm"><strong>Vendor:</strong> {vendor?.name} ({vendor?.territory})</p>
            <p className="text-sm"><strong>Outlet:</strong> {getOutletName(vendor?.outlet_id || null)}</p>
            <p className="text-sm"><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
            <div className="space-y-1">
              {products.filter(p => quantities[p.id] > 0).map(p => (
                <div key={p.id} className="flex justify-between text-sm">
                  <span>{p.name} × {quantities[p.id]}</span>
                  <span>₦{((quantities[p.id] || 0) * Number(p.unit_price)).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-3 flex justify-between font-bold"><span>Total</span><span>₦{totalValue.toLocaleString()}</span></div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={handleConfirm} disabled={createAllocation.isPending}>
                {createAllocation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                Confirm Allocation
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
