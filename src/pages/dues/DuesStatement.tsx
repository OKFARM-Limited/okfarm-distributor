import { useState, useRef } from 'react';
import { vendors, salesRecords, allocations } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Printer, FileText } from 'lucide-react';

export default function DuesStatement() {
  const [selectedVendor, setSelectedVendor] = useState(vendors[0]?.id || '');
  const printRef = useRef<HTMLDivElement>(null);

  const vendor = vendors.find(v => v.id === selectedVendor);
  const vendorSales = salesRecords.filter(s => s.vendorId === selectedVendor).slice(0, 30);
  const vendorAllocs = allocations.filter(a => a.vendorId === selectedVendor).slice(0, 30);

  const totalAllocated = vendorAllocs.reduce((s, a) => s + a.totalValue, 0);
  const totalSold = vendorSales.reduce((s, r) => s + r.totalValue, 0);
  const totalPaid = vendorSales.reduce((s, r) => s + r.amountPaid, 0);
  const totalOutstanding = vendorSales.reduce((s, r) => s + r.outstanding, 0);

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Dues Statement - ${vendor?.name}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
        h1 { font-size: 20px; margin-bottom: 4px; }
        h2 { font-size: 16px; color: #666; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 13px; }
        th { background-color: #f5f5f5; font-weight: 600; }
        .summary { display: flex; gap: 20px; margin: 16px 0; }
        .summary-item { padding: 12px; border: 1px solid #ddd; border-radius: 6px; flex: 1; text-align: center; }
        .summary-label { font-size: 12px; color: #666; }
        .summary-value { font-size: 18px; font-weight: 700; margin-top: 4px; }
        .footer { margin-top: 40px; font-size: 11px; color: #999; text-align: center; }
        .outstanding { color: #dc2626; font-weight: 600; }
      </style></head><body>
        <h1>OKFARM Distributor Manager</h1>
        <h2>Dues Statement — ${vendor?.name} (${vendor?.id})</h2>
        <p>Territory: ${vendor?.territory} | Phone: ${vendor?.phone}</p>
        <p>Generated: ${new Date().toLocaleDateString()}</p>
        <div class="summary">
          <div class="summary-item"><div class="summary-label">Total Allocated</div><div class="summary-value">₦${totalAllocated.toLocaleString()}</div></div>
          <div class="summary-item"><div class="summary-label">Total Sales</div><div class="summary-value">₦${totalSold.toLocaleString()}</div></div>
          <div class="summary-item"><div class="summary-label">Total Paid</div><div class="summary-value">₦${totalPaid.toLocaleString()}</div></div>
          <div class="summary-item"><div class="summary-label">Outstanding</div><div class="summary-value outstanding">₦${totalOutstanding.toLocaleString()}</div></div>
        </div>
        <table>
          <thead><tr><th>Date</th><th>Type</th><th>Total Value</th><th>Paid</th><th>Outstanding</th><th>Method</th></tr></thead>
          <tbody>${vendorSales.map(s => `<tr><td>${s.date}</td><td>Sale</td><td>₦${s.totalValue.toLocaleString()}</td><td>₦${s.amountPaid.toLocaleString()}</td><td class="${s.outstanding > 0 ? 'outstanding' : ''}">₦${s.outstanding.toLocaleString()}</td><td>${s.paymentMethod}</td></tr>`).join('')}</tbody>
        </table>
        <div class="footer">This is a computer-generated statement from OKFARM Distributor Manager. No signature required.</div>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><FileText className="h-6 w-6" /> Dues Statement</h1>
        <Button onClick={handlePrint} className="gap-1"><Printer className="h-4 w-4" /> Print / PDF</Button>
      </div>

      {/* Vendor Selector */}
      <Select value={selectedVendor} onValueChange={setSelectedVendor}>
        <SelectTrigger className="w-full sm:w-80"><SelectValue placeholder="Select vendor" /></SelectTrigger>
        <SelectContent>
          {vendors.map(v => <SelectItem key={v.id} value={v.id}>{v.name} ({v.id})</SelectItem>)}
        </SelectContent>
      </Select>

      {vendor && (
        <div ref={printRef}>
          {/* Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Card><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Total Allocated</p><p className="text-xl font-bold">₦{totalAllocated.toLocaleString()}</p></CardContent></Card>
            <Card><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Total Sales</p><p className="text-xl font-bold">₦{totalSold.toLocaleString()}</p></CardContent></Card>
            <Card><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Total Paid</p><p className="text-xl font-bold text-success">₦{totalPaid.toLocaleString()}</p></CardContent></Card>
            <Card><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Outstanding</p><p className="text-xl font-bold text-destructive">₦{totalOutstanding.toLocaleString()}</p></CardContent></Card>
          </div>

          {/* Transaction Table */}
          <Card className="mt-4">
            <CardHeader><CardTitle className="text-base">Transaction History</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Total Value</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Outstanding</TableHead>
                    <TableHead>Method</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendorSales.map(s => (
                    <TableRow key={s.id}>
                      <TableCell>{s.date}</TableCell>
                      <TableCell>₦{s.totalValue.toLocaleString()}</TableCell>
                      <TableCell>₦{s.amountPaid.toLocaleString()}</TableCell>
                      <TableCell>
                        <span className={s.outstanding > 0 ? 'text-destructive font-medium' : ''}>
                          ₦{s.outstanding.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{s.paymentMethod.replace('_', ' ')}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
