import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, AlertTriangle, XCircle, Loader2 } from 'lucide-react';

interface VerificationResult {
  extracted: {
    invoice_number: string;
    date: string;
    supplier: string;
    line_items: { product_name: string; quantity: number; unit_price: number }[];
    total_value: number;
  };
  mismatches: { field: string; booked: string | number; extracted: string | number }[];
  itemMismatches: {
    product: string;
    booked_qty: number | null;
    extracted_qty: number | null;
    booked_price: number | null;
    extracted_price: number | null;
    qty_match: boolean;
    price_match: boolean;
    not_found_in_booking?: boolean;
    not_found_in_invoice?: boolean;
  }[];
  allMatch: boolean;
}

interface InvoiceVerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: VerificationResult | null;
  isLoading: boolean;
  error: string | null;
  onConfirm: () => void;
}

export default function InvoiceVerificationDialog({
  open,
  onOpenChange,
  result,
  isLoading,
  error,
  onConfirm,
}: InvoiceVerificationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
            {!isLoading && result?.allMatch && <CheckCircle className="h-5 w-5 text-green-500" />}
            {!isLoading && result && !result.allMatch && <AlertTriangle className="h-5 w-5 text-destructive" />}
            Invoice Verification
          </DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">AI is reading your invoice...</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center py-8 gap-2">
            <XCircle className="h-8 w-8 text-destructive" />
            <p className="text-sm text-destructive font-medium">Verification Failed</p>
            <p className="text-xs text-muted-foreground text-center">{error}</p>
          </div>
        )}

        {result && !isLoading && (
          <div className="space-y-4">
            {result.allMatch ? (
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-md p-4 text-center">
                <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-green-700 dark:text-green-400">All data matches!</p>
                <p className="text-xs text-muted-foreground mt-1">The uploaded invoice matches the booked delivery.</p>
              </div>
            ) : (
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-md p-4 text-center">
                <AlertTriangle className="h-6 w-6 text-amber-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Discrepancies found</p>
                <p className="text-xs text-muted-foreground mt-1">Review the differences below and confirm or re-check.</p>
              </div>
            )}

            {/* Header mismatches */}
            {result.mismatches.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold">Header Mismatches</p>
                <div className="space-y-1">
                  {result.mismatches.map((m, i) => (
                    <div key={i} className="flex items-center justify-between text-sm bg-muted/50 rounded px-3 py-2">
                      <span className="capitalize text-muted-foreground">{m.field.replace('_', ' ')}</span>
                      <div className="flex gap-4">
                        <span>Booked: <strong>{m.booked != null ? `₦${Number(m.booked).toLocaleString()}` : String(m.booked)}</strong></span>
                        <span>Invoice: <strong className="text-destructive">{m.extracted != null && typeof m.extracted === 'number' ? `₦${Number(m.extracted).toLocaleString()}` : String(m.extracted)}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Item comparison */}
            <div className="space-y-2">
              <p className="text-sm font-semibold">Line Item Comparison</p>
              {result.extracted.line_items.length === 0 && result.itemMismatches.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">AI could not extract line items from the invoice.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Booked Qty</TableHead>
                      <TableHead>Invoice Qty</TableHead>
                      <TableHead>Booked Price</TableHead>
                      <TableHead>Invoice Price</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Matched items with no issues */}
                    {result.extracted.line_items
                      .filter(ei => !result.itemMismatches.find(m => m.product === ei.product_name))
                      .map((item, idx) => (
                        <TableRow key={`match-${idx}`}>
                          <TableCell className="text-sm">{item.product_name}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>₦{item.unit_price.toLocaleString()}</TableCell>
                          <TableCell>₦{item.unit_price.toLocaleString()}</TableCell>
                          <TableCell><Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">Match</Badge></TableCell>
                        </TableRow>
                      ))}
                    {/* Mismatched items */}
                    {result.itemMismatches.map((m, idx) => (
                      <TableRow key={`mismatch-${idx}`} className="bg-destructive/5">
                        <TableCell className="text-sm font-medium">{m.product}</TableCell>
                        <TableCell>{m.booked_qty ?? '—'}</TableCell>
                        <TableCell className={!m.qty_match ? 'text-destructive font-medium' : ''}>{m.extracted_qty ?? '—'}</TableCell>
                        <TableCell>{m.booked_price != null ? `₦${m.booked_price.toLocaleString()}` : '—'}</TableCell>
                        <TableCell className={!m.price_match ? 'text-destructive font-medium' : ''}>{m.extracted_price != null ? `₦${m.extracted_price.toLocaleString()}` : '—'}</TableCell>
                        <TableCell>
                          {m.not_found_in_booking && <Badge variant="destructive">Not booked</Badge>}
                          {m.not_found_in_invoice && <Badge variant="outline" className="text-amber-600 border-amber-300">Missing from invoice</Badge>}
                          {!m.not_found_in_booking && !m.not_found_in_invoice && <Badge variant="destructive">Mismatch</Badge>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>

            {/* Total comparison */}
            <div className="flex items-center justify-between text-sm border-t pt-3">
              <span className="text-muted-foreground">Total Value</span>
              <div className="flex gap-4">
                <span>Booked: <strong>₦{Number(result.extracted.total_value || 0).toLocaleString()}</strong></span>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {result && !result.allMatch ? 'Review Later' : 'Close'}
          </Button>
          {result && (
            <Button onClick={onConfirm}>
              {result.allMatch ? 'Confirm Match' : 'Accept Anyway'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
