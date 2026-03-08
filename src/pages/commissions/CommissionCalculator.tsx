import { commissions, getOutletName } from '@/data/mockData';
import { useOutletContext } from '@/contexts/OutletContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, Trophy, TrendingUp, Calendar, Zap, MapPin } from 'lucide-react';

const tierColors: Record<string, string> = {
  platinum: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  gold: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  silver: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  bronze: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
};

export default function CommissionCalculator() {
  const { selectedOutletId, isAllOutlets } = useOutletContext();
  const filtered = isAllOutlets ? commissions : commissions.filter(c => c.outletId === selectedOutletId);

  const totalPending = filtered.filter(c => c.status === 'pending').reduce((s, c) => s + c.totalCommission, 0);
  const totalDisbursed = filtered.filter(c => c.status === 'disbursed').reduce((s, c) => s + c.totalCommission, 0);
  const avgConsistency = filtered.length ? Math.round(filtered.reduce((s, c) => s + c.consistencyRate, 0) / filtered.length) : 0;
  const avgDaysActive = filtered.length ? Math.round(filtered.reduce((s, c) => s + c.daysActive, 0) / filtered.length) : 0;

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
        <Card><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Pending</p><p className="text-xl font-bold text-warning">₦{totalPending.toLocaleString()}</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Disbursed</p><p className="text-xl font-bold text-success">₦{totalDisbursed.toLocaleString()}</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Avg Consistency</p><p className="text-xl font-bold">{avgConsistency}%</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Avg Days Active</p><p className="text-xl font-bold">{avgDaysActive}</p></CardContent></Card>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-muted-foreground mr-1">Tiers:</span>
        {(['platinum', 'gold', 'silver', 'bronze'] as const).map(tier => (
          <Badge key={tier} className={`${tierColors[tier]} capitalize text-xs`}>{tier}</Badge>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">February 2026 — Detailed KPI Breakdown</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor</TableHead>
                {isAllOutlets && <TableHead>Outlet</TableHead>}
                <TableHead>Tier</TableHead>
                <TableHead>Total Sales</TableHead>
                <TableHead><div className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Days Active</div></TableHead>
                <TableHead><div className="flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Avg Daily</div></TableHead>
                <TableHead><div className="flex items-center gap-1"><Zap className="h-3 w-3" /> Consistency</div></TableHead>
                <TableHead>Multiplier</TableHead>
                <TableHead>Volume</TableHead>
                <TableHead>Consistency</TableHead>
                <TableHead>Attendance</TableHead>
                <TableHead><div className="flex items-center gap-1"><Trophy className="h-3 w-3" /> Total</div></TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.vendorName}</TableCell>
                  {isAllOutlets && <TableCell className="text-xs">{getOutletName(c.outletId)}</TableCell>}
                  <TableCell><Badge className={`${tierColors[c.tier]} capitalize text-[10px]`}>{c.tier}</Badge></TableCell>
                  <TableCell>₦{c.totalSales.toLocaleString()}</TableCell>
                  <TableCell><span className={c.daysActive >= 22 ? 'text-success font-medium' : c.daysActive >= 15 ? '' : 'text-destructive'}>{c.daysActive}/{c.daysWorked}</span></TableCell>
                  <TableCell>₦{c.avgDailySales.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <div className="w-12 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className={`h-full rounded-full ${c.consistencyRate >= 70 ? 'bg-success' : c.consistencyRate >= 50 ? 'bg-warning' : 'bg-destructive'}`} style={{ width: `${Math.min(c.consistencyRate, 100)}%` }} />
                      </div>
                      <span className="text-xs">{c.consistencyRate}%</span>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant={c.consistencyMultiplier >= 1.5 ? 'default' : 'outline'} className="text-[10px]">{c.consistencyMultiplier}x</Badge></TableCell>
                  <TableCell className="text-xs">₦{c.volumeBonus.toLocaleString()}</TableCell>
                  <TableCell className="text-xs">₦{c.consistencyBonus.toLocaleString()}</TableCell>
                  <TableCell className="text-xs">₦{c.attendanceBonus.toLocaleString()}</TableCell>
                  <TableCell className="font-bold">₦{c.totalCommission.toLocaleString()}</TableCell>
                  <TableCell><Badge variant={c.status === 'disbursed' ? 'default' : 'secondary'}>{c.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
