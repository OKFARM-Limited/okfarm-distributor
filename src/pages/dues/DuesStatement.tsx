import { useState, useRef } from 'react';
import { ViewerBanner } from '@/components/ViewerGuard';
import { useViewerGuard } from '@/hooks/useViewerGuard';
import { useVendors, useSales, useAllocations } from '@/hooks/useSupabaseData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Printer, FileText, Loader2 } from 'lucide-react';

export default function DuesStatement() {
  const [selectedVendor, setSelectedVendor] = useState('');
  const printRef = useRef<HTMLDivElement>(null);
  const { viewerProps } = useViewerGuard();
  const { data: vendors = [], isLoading: vLoading } = useVendors('all');
  const { data: sales = [], isLoading: sLoading } = useSales('all');
  const { data: allocations = [], isLoading: aLoading } = useAllocations('all');

  const vendor = (vendors as any[]).find(v => v.id === selectedVendor);
  const vendorSales = (sales as any[]).filter(s => s.vendor_id === selectedVendor).slice(0, 30);
  const vendorAllocs = (allocations as any[]).filter(a => a.vendor_id === selectedVendor).slice(0, 30);

  const totalAllocated = vendorAllocs.reduce((s, a) => s + Number(a.total_value), 0);
  const totalSold = vendorSales.reduce((s, r) => s + Number(r.total_value), 0);
  const totalPaid = vendorSales.reduce((s, r) => s + Number(r.amount_paid), 0);
  const totalOutstanding = vendorSales.reduce((s, r) => s + Number(r.outstanding), 0);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Dues Statement - ${vendor?.name}</title>
      <style>body{font-family:Arial,sans-serif;padding:20px;color:#333}h1{font-size:20px}table{width:100%;border-collapse:collapse;margin-top:16px}th,td{border:1px solid #ddd;padding:8px;text-align:left;font-size:13px}th{background:#f5f5f5;font-weight:600}.summary{display:flex;gap:20px;margin:16px 0}.summary-item{padding:12px;border:1px solid #ddd;border-radius:6px;flex:1;text-align:center}.outstanding{color:#dc2626;font-weight:600}.footer{margin-top:40px;font-size:11px;color:#999;text-align:center}</style></head><body>
        <h1>OKFARM — Dues Statement</h1>
        <p><strong>${vendor?.name}</strong> (${vendor?.vendor_code}) | ${vendor?.territory} | ${vendor?.phone}</p>
        <p>Generated: ${new Date().toLocaleDateString()}</p>
        <div class="summary">
          <div class="summary-item"><small>Total Allocated</small><div style="font-size:18px;font-weight:700">₦${totalAllocated.toLocaleString()}</div></div>
          <div class="summary-item"><small>Total Sales</small><div style="font-size:18px;font-weight:700">₦${totalSold.toLocaleString()}</div></div>
          <div class="summary-item"><small>Total Paid</small><div style="font-size:18px;font-weight:700">₦${totalPaid.toLocaleString()}</div></div>
          <div class="summary-item"><small>Outstanding</small><div style="font-size:18px;font-weight:700" class="outstanding">₦${totalOutstanding.toLocaleString()}</div></div>
        </div>
        <table><thead><tr><th>Date</th><th>Total Value</th><th>Paid</th><th>Outstanding</th><th>Method</th></tr></thead>
        <tbody>${vendorSales.map(s => `<tr><td>${s.date}</td><td>₦${Number(s.total_value).toLocaleString()}</td><td>₦${Number(s.amount_paid).toLocaleString()}</td><td class="${Number(s.outstanding) > 0 ? 'outstanding' : ''}">₦${Number(s.outstanding).toLocaleString()}</td><td>${s.payment_method}</td></tr>`).join('')}</tbody></table>
        <div class="footer">Computer-generated statement from OKFARM Distributor Manager.</div>
      </body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

  if (vLoading || sLoading || aLoading) return <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-4 animate-fade-in">
      <ViewerBanner />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><FileText className="h-6 w-6" /> Dues Statement</h1>
        <Button onClick={handlePrint} disabled={!selectedVendor} className="gap-1" {...viewerProps}><Printer className="h-4 w-4" /> Print / PDF</Button>
      </div>

      <Select value={selectedVendor} onValueChange={setSelectedVendor}>
        <SelectTrigger className="w-full sm:w-80"><SelectValue placeholder="Select vendor" /></SelectTrigger>
        <SelectContent>
          {(vendors as any[]).map(v => <SelectItem key={v.id} value={v.id}>{v.name} ({v.vendor_code})</SelectItem>)}
        </SelectContent>
      </Select>

      {vendor && (
        <div ref={printRef}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Card><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Total Allocated</p><p className="text-xl font-bold">₦{totalAllocated.toLocaleString()}</p></CardContent></Card>
            <Card><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Total Sales</p><p className="text-xl font-bold">₦{totalSold.toLocaleString()}</p></CardContent></Card>
            <Card><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Total Paid</p><p className="text-xl font-bold text-green-600">₦{totalPaid.toLocaleString()}</p></CardContent></Card>
            <Card><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Outstanding</p><p className="text-xl font-bold text-destructive">₦{totalOutstanding.toLocaleString()}</p></CardContent></Card>
          </div>

          <Card className="mt-4">
            <CardHeader><CardTitle className="text-base">Transaction History</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Date</TableHead><TableHead>Total Value</TableHead><TableHead>Paid</TableHead><TableHead>Outstanding</TableHead><TableHead>Method</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {vendorSales.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>{s.date}</TableCell>
                      <TableCell>₦{Number(s.total_value).toLocaleString()}</TableCell>
                      <TableCell>₦{Number(s.amount_paid).toLocaleString()}</TableCell>
                      <TableCell><span className={Number(s.outstanding) > 0 ? 'text-destructive font-medium' : ''}>₦{Number(s.outstanding).toLocaleString()}</span></TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{s.payment_method?.replace('_', ' ')}</Badge></TableCell>
                    </TableRow>
                  ))}
                  {vendorSales.length === 0 && (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No sales records for this vendor.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
