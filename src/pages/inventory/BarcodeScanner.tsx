import { useState, useEffect, useRef } from 'react';
import { products } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { ScanLine, Package, Keyboard } from 'lucide-react';

export default function BarcodeScanner() {
  const [mode, setMode] = useState<'scan' | 'manual'>('scan');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [scannedItems, setScannedItems] = useState<{ productId: string; productName: string; barcode: string; quantity: number; time: string }[]>([]);
  const [scanning, setScanning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Simulate barcode scanner auto-focus
  useEffect(() => {
    if (mode === 'scan') inputRef.current?.focus();
  }, [mode]);

  const lookupBarcode = (barcode: string) => {
    const product = products.find(p => p.barcode === barcode || p.id === barcode);
    if (product) {
      setScannedItems(prev => {
        const existing = prev.find(i => i.productId === product.id);
        if (existing) {
          return prev.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i);
        }
        return [...prev, { productId: product.id, productName: product.name, barcode: product.barcode, quantity: 1, time: new Date().toLocaleTimeString() }];
      });
      toast({ title: '✅ Scanned', description: `${product.name} added` });
    } else {
      toast({ title: '❌ Not Found', description: `Barcode ${barcode} not recognized`, variant: 'destructive' });
    }
    setBarcodeInput('');
  };

  const simulateScan = () => {
    setScanning(true);
    setTimeout(() => {
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      lookupBarcode(randomProduct.barcode);
      setScanning(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && barcodeInput.trim()) {
      lookupBarcode(barcodeInput.trim());
    }
  };

  return (
    <div className="space-y-4 animate-fade-in max-w-2xl">
      <h1 className="text-2xl font-bold flex items-center gap-2"><ScanLine className="h-6 w-6" /> Barcode Scanner</h1>

      {/* Mode Toggle */}
      <div className="flex gap-2">
        <Button variant={mode === 'scan' ? 'default' : 'outline'} onClick={() => setMode('scan')} className="gap-1"><ScanLine className="h-4 w-4" /> Scanner</Button>
        <Button variant={mode === 'manual' ? 'default' : 'outline'} onClick={() => setMode('manual')} className="gap-1"><Keyboard className="h-4 w-4" /> Manual</Button>
      </div>

      {/* Scanner Area */}
      <Card>
        <CardContent className="pt-6">
          {mode === 'scan' ? (
            <div className="space-y-4">
              {/* Mock Scanner Viewport */}
              <div className="relative bg-muted rounded-lg h-64 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-32 border-2 border-dashed border-primary/50 rounded-lg" />
                </div>
                {scanning && (
                  <div className="absolute w-48 h-0.5 bg-destructive animate-pulse" style={{ animation: 'pulse 1s infinite' }} />
                )}
                <div className="text-center z-10">
                  <ScanLine className={`h-12 w-12 mx-auto mb-2 ${scanning ? 'text-destructive animate-pulse' : 'text-muted-foreground'}`} />
                  <p className="text-sm text-muted-foreground">{scanning ? 'Scanning...' : 'Point camera at barcode'}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Input ref={inputRef} value={barcodeInput} onChange={e => setBarcodeInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Barcode auto-reads here..." className="flex-1" />
                <Button onClick={simulateScan} disabled={scanning}>Simulate Scan</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Enter barcode or SKU ID manually</p>
              <div className="flex gap-2">
                <Input value={barcodeInput} onChange={e => setBarcodeInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Enter barcode or SKU-001..." className="flex-1" />
                <Button onClick={() => barcodeInput.trim() && lookupBarcode(barcodeInput.trim())}>Lookup</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {products.map(p => (
                  <Button key={p.id} size="sm" variant="outline" onClick={() => lookupBarcode(p.barcode)} className="text-xs">
                    {p.id}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scanned Items */}
      {scannedItems.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Package className="h-4 w-4" /> Scanned Items ({scannedItems.reduce((s, i) => s + i.quantity, 0)} total)</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {scannedItems.map(item => (
                <div key={item.productId} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium text-sm">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">{item.barcode}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">×{item.quantity}</Badge>
                    <span className="text-xs text-muted-foreground">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-4 gap-2">
              <Button variant="outline" onClick={() => setScannedItems([])}>Clear</Button>
              <Button onClick={() => { toast({ title: '✅ Saved', description: 'Scanned inventory saved.' }); setScannedItems([]); }}>Save to Inventory</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
