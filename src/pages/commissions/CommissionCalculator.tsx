import { useState } from 'react';
import { useOutletContext } from '@/contexts/OutletContext';
import { useCommissions, useCalculateCommissions } from '@/hooks/useSupabaseData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Info, Trophy, TrendingUp, Calendar, Zap, MapPin, Loader2, Calculator, FileDown } from 'lucide-react';
import { generatePDFReport } from '@/lib/generatePDF';
import { ViewerBanner } from '@/components/ViewerGuard';
import { useViewerGuard } from '@/hooks/useViewerGuard';

const tierColors: Record<string, string> = {
  platinum: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  gold: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  silver: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  bronze: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
};

export default function CommissionCalculator() {
  const { selectedOutletId, isAllOutlets, getOutletName } = useOutletContext();
  const { data: commissions = [], isLoading } = useCommissions(isAllOutlets ? 'all' : selectedOutletId);
  const calculateCommissions = useCalculateCommissions();
  const { viewerProps } = useViewerGuard();
  const [calcDialog, setCalcDialog] = useState(false);
  const [calcMonth, setCalcMonth] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const filtered = commissions;
  const totalPending = filtered.filter(c => c.status === 'pending').reduce((s, c) => s + Number(c.total_commission), 0);
  const totalDisbursed = filtered.filter(c => c.status === 'disbursed').reduce((s, c) => s + Number(c.total_commission), 0);
  const avgConsistency = filtered.length ? Math.round(filtered.reduce((s, c) => s + Number(c.consistency_rate), 0) / filtered.length) : 0;
  const avgDaysActive = filtered.length ? Math.round(filtered.reduce((s, c) => s + c.days_active, 0) / filtered.length) : 0;

  const handleCalculate = () => {
    calculateCommissions.mutate(
      { month: calcMonth, outletId: isAllOutlets ? undefined : selectedOutletId },
      {
        onSuccess: () => { toast({ title: '✅ Calculated', description: `Commissions for ${calcMonth} computed from sales data.` }); setCalcDialog(false); },
        onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
      }
    );
  };

  if (isLoading) return <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-4 animate-fade-in">
      <ViewerBanner />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Commission Calculator</h1>
          {!isAllOutlets && <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{getOutletName(selectedOutletId)}</p>}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-1" onClick={() => {
            generatePDFReport({
              title: 'Commission Report',
              subtitle: `Generated for ${isAllOutlets ? 'All Outlets' : getOutletName(selectedOutletId)}`,
              filename: `commissions-${new Date().toISOString().split('T')[0]}.pdf`,
              columns: [
                { header: 'Vendor', key: 'vendor' },
                { header: 'Month', key: 'month' },
                { header: 'Tier', key: 'tier' },
                { header: 'Total Sales', key: 'total_sales', align: 'right', format: (v: number) => `₦${Number(v).toLocaleString()}` },
                { header: 'Days Active', key: 'days_active', align: 'center' },
                { header: 'Consistency', key: 'consistency_rate', align: 'center', format: (v: number) => `${v}%` },
                { header: 'Commission', key: 'total_commission', align: 'right', format: (v: number) => `₦${Number(v).toLocaleString()}` },
                { header: 'Status', key: 'status' },
              ],
              data: filtered.map(c => ({ ...c, vendor: c.vendors?.name || '—', total_sales: c.total_sales, total_commission: c.total_commission })),
              summaryRows: [
                { label: 'Total Pending', value: `₦${totalPending.toLocaleString()}` },
                { label: 'Total Disbursed', value: `₦${totalDisbursed.toLocaleString()}` },
              ],
            });
          }}>
            <FileDown className="h-4 w-4" /> Export PDF
          </Button>
          <Button onClick={() => setCalcDialog(true)} className="gap-1" {...viewerProps}>
            <Calculator className="h-4 w-4" /> Auto-Calculate
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger><Info className="h-5 w-5 text-muted-foreground" /></TooltipTrigger>
              <TooltipContent className="max-w-xs text-xs">
                <p className="font-medium mb-1">Commission Formula:</p>
                <p>(Volume Bonus + Consistency Bonus + Attendance Bonus) × Consistency Multiplier</p>
                <p className="mt-1 text-muted-foreground">Multiplier: ≥85% = 1.15x, ≥70% = 1.08x, ≥50% = 1.02x, &lt;50% = 1.00x</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Card><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Total Commissions</p><p className="text-xl font-bold">₦{(totalPending + totalDisbursed).toLocaleString()}</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Pending</p><p className="text-xl font-bold text-yellow-600">₦{totalPending.toLocaleString()}</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Disbursed</p><p className="text-xl font-bold text-green-600">₦{totalDisbursed.toLocaleString()}</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Avg Consistency</p><p className="text-xl font-bold">{avgConsistency}%</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Avg Days Active</p><p className="text-xl font-bold">{avgDaysActive}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Commission Breakdown</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor</TableHead>
                {isAllOutlets && <TableHead>Outlet</TableHead>}
                <TableHead>Month</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Total Sales</TableHead>
                <TableHead><div className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Days</div></TableHead>
                <TableHead><div className="flex items-center gap-1"><Zap className="h-3 w-3" /> Consistency</div></TableHead>
                <TableHead><div className="flex items-center gap-1"><Trophy className="h-3 w-3" /> Commission</div></TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.vendors?.name}</TableCell>
                  {isAllOutlets && <TableCell className="text-xs">{c.outlets?.name || '—'}</TableCell>}
                  <TableCell>{c.month}</TableCell>
                  <TableCell><Badge className={`${tierColors[c.tier] || ''} capitalize text-[10px]`}>{c.tier}</Badge></TableCell>
                  <TableCell>₦{Number(c.total_sales).toLocaleString()}</TableCell>
                  <TableCell>{c.days_active}/{c.days_worked}</TableCell>
                  <TableCell>{Number(c.consistency_rate)}%</TableCell>
                  <TableCell className="font-bold">₦{Number(c.total_commission).toLocaleString()}</TableCell>
                  <TableCell><Badge variant={c.status === 'disbursed' ? 'default' : 'secondary'}>{c.status}</Badge></TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={isAllOutlets ? 9 : 8} className="text-center text-muted-foreground py-8">No commission data yet. Use Auto-Calculate to generate from sales.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Auto-Calculate Dialog */}
      <Dialog open={calcDialog} onOpenChange={setCalcDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Auto-Calculate Commissions</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">This will compute commissions from actual sales and attendance data for the selected month.</p>
          <div className="space-y-2">
            <Label>Month (YYYY-MM)</Label>
            <Input value={calcMonth} onChange={e => setCalcMonth(e.target.value)} placeholder="e.g. 2026-03" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCalcDialog(false)}>Cancel</Button>
            <Button onClick={handleCalculate} disabled={calculateCommissions.isPending}>
              {calculateCommissions.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}Calculate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
