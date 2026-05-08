import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Upload, Download, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

type EntityType = 'vendors' | 'products';

const TEMPLATES: Record<EntityType, { headers: string[]; sample: string[] }> = {
  vendors: {
    headers: ['vendor_code', 'name', 'phone', 'email', 'territory', 'address', 'national_id', 'gender', 'status'],
    sample: ['VND-001', 'John Doe', '+2348012345678', 'john@example.com', 'Lagos', '12 Main St', 'NIN12345', 'male', 'active'],
  },
  products: {
    headers: ['sku', 'name', 'category', 'unit', 'unit_price', 'barcode'],
    sample: ['FM-001', 'FanChoco 90ml', 'Ice Cream', 'pack', '300', '1234567890'],
  },
};

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).map(line => {
    const values: string[] = [];
    let cur = '', inQuote = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') inQuote = !inQuote;
      else if (c === ',' && !inQuote) { values.push(cur); cur = ''; }
      else cur += c;
    }
    values.push(cur);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = (values[i] || '').trim().replace(/^"|"$/g, ''); });
    return row;
  });
}

export default function BulkImport() {
  const { user } = useAuth();
  const [entity, setEntity] = useState<EntityType>('vendors');
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ ok: number; errors: { row: number; error: string }[] } | null>(null);

  const downloadTemplate = (e: EntityType) => {
    const t = TEMPLATES[e];
    const csv = [t.headers.join(','), t.sample.join(',')].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${e}_template.csv`;
    a.click();
  };

  const handleFile = async (file: File) => {
    const text = await file.text();
    const parsed = parseCsv(text);
    setRows(parsed);
    setResult(null);
  };

  const runImport = async () => {
    if (rows.length === 0) return;
    setImporting(true);
    const errors: { row: number; error: string }[] = [];
    let ok = 0;

    const transform = (r: Record<string, string>) => {
      if (entity === 'products') {
        return { ...r, unit_price: Number(r.unit_price) || 0 };
      }
      return r;
    };

    // batch insert in chunks of 50
    const chunkSize = 50;
    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize).map(transform);
      const { error } = await supabase.from(entity).insert(chunk as any);
      if (error) {
        // fall back to per-row to identify failing ones
        for (let j = 0; j < chunk.length; j++) {
          const { error: rowErr } = await supabase.from(entity).insert(chunk[j] as any);
          if (rowErr) errors.push({ row: i + j + 2, error: rowErr.message });
          else ok++;
        }
      } else {
        ok += chunk.length;
      }
    }

    await supabase.from('import_batches').insert({
      entity_type: entity,
      total_rows: rows.length,
      inserted_rows: ok,
      failed_rows: errors.length,
      errors: errors.length ? errors : null,
      created_by: user?.id || null,
    });

    setResult({ ok, errors });
    setImporting(false);
    toast({
      title: 'Import complete',
      description: `${ok} inserted, ${errors.length} failed`,
      variant: errors.length ? 'destructive' : 'default',
    });
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Bulk Import</h1>
        <p className="text-sm text-muted-foreground">Upload CSV files to import vendors or products in bulk.</p>
      </div>

      <Tabs value={entity} onValueChange={v => { setEntity(v as EntityType); setRows([]); setResult(null); }}>
        <TabsList>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
        </TabsList>

        {(['vendors', 'products'] as EntityType[]).map(e => (
          <TabsContent key={e} value={e}>
            <Card>
              <CardHeader>
                <CardTitle className="capitalize">{e} CSV Import</CardTitle>
                <CardDescription>
                  Required columns: <code className="text-xs">{TEMPLATES[e].headers.join(', ')}</code>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => downloadTemplate(e)}>
                    <Download className="h-4 w-4 mr-1" /> Download Template
                  </Button>
                  <label>
                    <input
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={ev => { const f = ev.target.files?.[0]; if (f) handleFile(f); ev.target.value = ''; }}
                    />
                    <Button asChild variant="default" size="sm">
                      <span><Upload className="h-4 w-4 mr-1" /> Choose CSV</span>
                    </Button>
                  </label>
                  {rows.length > 0 && (
                    <Button onClick={runImport} disabled={importing} size="sm">
                      {importing && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                      Import {rows.length} row{rows.length === 1 ? '' : 's'}
                    </Button>
                  )}
                </div>

                {rows.length > 0 && (
                  <div className="border rounded-md max-h-96 overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-10">#</TableHead>
                          {TEMPLATES[e].headers.map(h => <TableHead key={h}>{h}</TableHead>)}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rows.slice(0, 50).map((r, i) => (
                          <TableRow key={i}>
                            <TableCell className="text-xs text-muted-foreground">{i + 2}</TableCell>
                            {TEMPLATES[e].headers.map(h => (
                              <TableCell key={h} className="text-xs">{r[h] || <span className="text-muted-foreground">—</span>}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {rows.length > 50 && (
                      <p className="text-xs text-muted-foreground p-2 border-t">…and {rows.length - 50} more rows</p>
                    )}
                  </div>
                )}

                {result && (
                  <div className="space-y-2 border-t pt-4">
                    <div className="flex gap-2">
                      <Badge className="bg-green-600"><CheckCircle2 className="h-3 w-3 mr-1" /> {result.ok} inserted</Badge>
                      {result.errors.length > 0 && (
                        <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> {result.errors.length} failed</Badge>
                      )}
                    </div>
                    {result.errors.length > 0 && (
                      <div className="max-h-48 overflow-auto text-xs space-y-1">
                        {result.errors.map((er, i) => (
                          <div key={i} className="text-destructive">Row {er.row}: {er.error}</div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
