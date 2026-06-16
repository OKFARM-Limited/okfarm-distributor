import { useState } from 'react';
import { useOutletContext } from '@/contexts/OutletContext';
import { useVendors, useAllocations, useCreateReconciliation } from '@/hooks/useSupabaseData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, MapPin, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ViewerBanner } from '@/components/ViewerGuard';
import { useViewerGuard } from '@/hooks/useViewerGuard';
import { PhotoCapture } from '@/components/PhotoCapture';

export default function Reconciliation() {
  const [vendorId, setVendorId] = useState('');
  const [returns, setReturns] = useState<Record<string, number>>({});
  const [spoilage, setSpoilage] = useState<Record<string, number>>({});
  const [proofPhoto, setProofPhoto] = useState<string | null>(null);
  const { selectedOutletId, isAllOutlets, getOutletName } = useOutletContext();
  const { viewerProps } = useViewerGuard();

  const { data: vendors = [], isLoading: vLoading } = useVendors(isAllOutlets ? 'all' : selectedOutletId);
  const { data: allocations = [], isLoading: aLoading } = useAllocations(isAllOutlets ? 'all' : selectedOutletId);
  const createReconciliation = useCreateReconciliation();

  const vendor = vendors.find((v) => v.id === vendorId);
  const today = new Date().toISOString().split('T')[0];
  const todayAlloc = allocations.find((a) => a.vendor_id === vendorId && a.status === 'confirmed' && a.date === today);

  const handleReconcile = () => {
    if (!todayAlloc) return;
    const items = todayAlloc.allocation_items.map((item) => {
      const ret = returns[item.product_id] || 0;
      const sp = spoilage[item.product_id] || 0;
      const sold = item.quantity - ret - sp;
      return {
        product_id: item.product_id,
        allocated_qty: item.quantity,
        returned_qty: ret,
        spoilage_qty: sp,
        sold_qty: sold,
        unit_price: Number(item.unit_price),
      };
    });

    const totalSold = items.reduce((s, i) => s + i.sold_qty, 0);
    const totalReturned = items.reduce((s, i) => s + i.returned_qty, 0);
    const totalSpoilage = items.reduce((s, i) => s + i.spoilage_qty, 0);
    const cashCollected = items.reduce((s, i) => s + (i.sold_qty * i.unit_price), 0);

    createReconciliation.mutate(
      {
        allocation_id: todayAlloc.id,
        vendor_id: vendorId,
        outlet_id: vendor?.outlet_id || null,
        date: today,
        total_returned: totalReturned,
        total_spoilage: totalSpoilage,
        total_sold: totalSold,
        cash_collected: cashCollected,
        status: 'completed',
        proof_photo_url: proofPhoto,
        items,
      },
      {
        onSuccess: () => {
          toast({ title: 'Reconciliation Saved', description: `Evening reconciliation for ${vendor?.name} completed.` });
          setVendorId(''); setReturns({}); setSpoilage({}); setProofPhoto(null);
        },
        onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
      }
    );
  };

  if (vLoading || aLoading) return <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-4 animate-fade-in">
      <ViewerBanner />
      <div>
        <h1 className="text-2xl font-bold">Evening Reconciliation</h1>
        {!isAllOutlets && <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{getOutletName(selectedOutletId)}</p>}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Select Vendor</CardTitle></CardHeader>
        <CardContent>
          <Select value={vendorId} onValueChange={v => { setVendorId(v); setReturns({}); setSpoilage({}); }}>
            <SelectTrigger className="max-w-md"><SelectValue placeholder="Choose vendor..." /></SelectTrigger>
            <SelectContent>
              {vendors.filter((v) => v.status === 'active').map((v) => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {vendorId && todayAlloc && (
        <Card>
          <CardHeader><CardTitle className="text-base">Reconcile — {vendor?.name}</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Allocated</TableHead><TableHead>Returned</TableHead><TableHead>Spoilage</TableHead><TableHead>Sold</TableHead><TableHead className="text-right">Value</TableHead></TableRow></TableHeader>
              <TableBody>
                {todayAlloc.allocation_items.map((item) => {
                  const ret = returns[item.product_id] || 0;
                  const sp = spoilage[item.product_id] || 0;
                  const sold = item.quantity - ret - sp;
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.products?.name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell><Input type="number" min={0} max={item.quantity} className="w-16 h-8" value={ret || ''} onChange={e => setReturns(r => ({ ...r, [item.product_id]: parseInt(e.target.value) || 0 }))} /></TableCell>
                      <TableCell><Input type="number" min={0} className="w-16 h-8" value={sp || ''} onChange={e => setSpoilage(s => ({ ...s, [item.product_id]: parseInt(e.target.value) || 0 }))} /></TableCell>
                      <TableCell>{sold}{sp > 0 && <Badge variant="destructive" className="ml-1 text-[10px]"><AlertTriangle className="h-3 w-3 mr-0.5" />Spoil</Badge>}</TableCell>
                      <TableCell className="text-right">₦{(sold * Number(item.unit_price)).toLocaleString()}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <div className="mt-4 pt-3 border-t space-y-2">
              <p className="text-sm font-medium">Proof of Reconciliation Photo</p>
              <PhotoCapture folder="reconciliations" value={proofPhoto} onChange={setProofPhoto} label="Capture proof photo" />
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={handleReconcile} disabled={createReconciliation.isPending} {...viewerProps}>
                {createReconciliation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                Save Reconciliation
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {vendorId && !todayAlloc && (
        <Card><CardContent className="pt-6 text-center text-muted-foreground">No confirmed allocation found for this vendor today.</CardContent></Card>
      )}
    </div>
  );
}
