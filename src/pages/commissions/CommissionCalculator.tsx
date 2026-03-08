import { useOutletContext } from '@/contexts/OutletContext';
import { useCommissions } from '@/hooks/useSupabaseData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, Trophy, TrendingUp, Calendar, Zap, MapPin, Loader2 } from 'lucide-react';

const tierColors: Record<string, string> = {
  platinum: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  gold: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  silver: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  bronze: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
};

export default function CommissionCalculator() {
  const { selectedOutletId, isAllOutlets, getOutletName } = useOutletContext();
  const { data: commissions = [], isLoading } = useCommissions(isAllOutlets ? 'all' : selectedOutletId);

  const filtered = commissions as any[];
  const totalPending = filtered.filter(c => c.status === 'pending').reduce((s, c) => s + Number(c.total_commission), 0);
  const totalDisbursed = filtered.filter(c => c.status === 'disbursed').reduce((s, c) => s + Number(c.total_commission), 0);
  const avgConsistency = filtered.length ? Math.round(filtered.reduce((s, c) => s + Number(c.consistency_rate), 0) / filtered.length) : 0;
  const avgDaysActive = filtered.length ? Math.round(filtered.reduce((s, c) => s + c.days_active, 0) / filtered.length) : 0;

  if (isLoading) return <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Commission Calculator</h1>
          {!isAllOutlets && <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{getOutletName(selectedOutletId)}</p>}
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger><Info className="h-5 w-5 text-muted-foreground" /></TooltipTrigger>
            <TooltipContent className="max-w-xs text-xs">
              <p className="font-medium mb-1">Commission Formula:</p>
              <p>(Volume Bonus + Consistency Bonus + Attendance Bonus) × Consistency Multiplier</p>
              <p className="mt-1 text-muted-foreground">Multiplier: ≥85% = 1.5x, ≥70% = 1.25x, ≥50% = 1.0x, &lt;50% = 0.75x</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
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
                <TableRow><TableCell colSpan={isAllOutlets ? 9 : 8} className="text-center text-muted-foreground py-8">No commission data yet.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
