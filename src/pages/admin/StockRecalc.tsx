import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOutletContext } from '@/contexts/OutletContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Loader2, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

type DiffRow = {
  product_id: string;
  outlet_id: string | null;
  product_name: string | null;
  outlet_name: string | null;
  current_stock: number;
  expected_stock: number;
  variance: number;
  applied: boolean;
};

export default function StockRecalc() {
  const { selectedOutletId, isAllOutlets } = useOutletContext();
  const [rows, setRows] = useState<DiffRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [lastRunAt, setLastRunAt] = useState<Date | null>(null);

  const run = async (apply: boolean) => {
    apply ? setApplying(true) : setLoading(true);
    const { data, error } = await supabase.rpc('recalculate_stock', {
      p_outlet_id: isAllOutlets ? null : selectedOutletId,
      p_apply: apply,
    });
    apply ? setApplying(false) : setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setRows((data as DiffRow[]) || []);
    setLastRunAt(new Date());
    if (apply) toast.success(`Applied ${data?.length || 0} corrections`);
    else toast.success(`Found ${data?.length || 0} mismatches`);
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">Recalculate Stock</h1>
          <p className="text-sm text-muted-foreground">
            Compare expected stock (deliveries − allocations − sales + returns/spoilage) against current stock levels.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => run(false)} disabled={loading} variant="outline">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Run Diff
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button disabled={!rows || rows.length === 0 || applying} variant="default">
                {applying ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Apply Corrections
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Apply {rows?.length || 0} stock corrections?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will overwrite current stock with the expected value for each mismatched row.
                  Each change is recorded in the audit log. This cannot be undone automatically.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => run(true)}>Confirm & Apply</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {rows === null ? 'No diff yet' :
              rows.length === 0
                ? <><CheckCircle2 className="h-5 w-5 text-green-600" /> All stock levels match expected values</>
                : <><AlertTriangle className="h-5 w-5 text-amber-600" /> {rows.length} mismatched row{rows.length > 1 ? 's' : ''}</>
            }
          </CardTitle>
          {lastRunAt && (
            <p className="text-xs text-muted-foreground">Last run: {lastRunAt.toLocaleString()}</p>
          )}
        </CardHeader>
        <CardContent>
          {rows && rows.length > 0 && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Outlet</TableHead>
                    <TableHead className="text-right">Current</TableHead>
                    <TableHead className="text-right">Expected</TableHead>
                    <TableHead className="text-right">Variance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={`${r.product_id}-${r.outlet_id}`}>
                      <TableCell>{r.product_name || r.product_id.slice(0, 8)}</TableCell>
                      <TableCell>{r.outlet_name || '—'}</TableCell>
                      <TableCell className="text-right">{r.current_stock}</TableCell>
                      <TableCell className="text-right">{r.expected_stock}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={r.variance === 0 ? 'secondary' : r.variance > 0 ? 'default' : 'destructive'}>
                          {r.variance > 0 ? '+' : ''}{r.variance}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
