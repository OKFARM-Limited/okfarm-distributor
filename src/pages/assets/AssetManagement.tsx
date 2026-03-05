import { useState } from 'react';
import { assets as mockAssets, vendors, Asset } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Package, Bike, Truck } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const iconMap = { push_cart: Package, bicycle: Bike, tricycle: Truck };

export default function AssetManagement() {
  const [assetList, setAssetList] = useState<Asset[]>(mockAssets);

  const handleAssign = (assetId: string, vendorId: string | 'unassign') => {
    setAssetList(prev => prev.map(a => {
      if (a.id !== assetId) return a;
      if (vendorId === 'unassign') return { ...a, assignedTo: null, status: 'available' as const };
      return { ...a, assignedTo: vendorId, status: 'assigned' as const };
    }));
    toast({ title: vendorId === 'unassign' ? 'Asset unassigned' : 'Asset assigned', description: `${assetId} updated.` });
  };

  const stats = {
    total: assetList.length,
    available: assetList.filter(a => a.status === 'available').length,
    assigned: assetList.filter(a => a.status === 'assigned').length,
    maintenance: assetList.filter(a => a.status === 'maintenance').length,
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="text-2xl font-bold">Asset Management</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Assets', value: stats.total, color: 'bg-primary/10 text-primary' },
          { label: 'Available', value: stats.available, color: 'bg-success/10 text-success' },
          { label: 'Assigned', value: stats.assigned, color: 'bg-info/10 text-info' },
          { label: 'Maintenance', value: stats.maintenance, color: 'bg-warning/10 text-warning' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="pt-4 text-center">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color.split(' ')[1]}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">All Assets</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assetList.map(a => {
                const Icon = iconMap[a.type];
                return (
                  <TableRow key={a.id}>
                    <TableCell className="font-mono text-xs">{a.id}</TableCell>
                    <TableCell className="flex items-center gap-2"><Icon className="h-4 w-4 text-muted-foreground" />{a.name}</TableCell>
                    <TableCell className="capitalize">{a.type.replace('_', ' ')}</TableCell>
                    <TableCell>
                      <Badge variant={a.condition === 'good' ? 'default' : a.condition === 'fair' ? 'secondary' : 'destructive'}>{a.condition}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={a.status === 'available' ? 'outline' : a.status === 'assigned' ? 'default' : 'secondary'}>{a.status}</Badge>
                    </TableCell>
                    <TableCell>{a.assignedTo ? vendors.find(v => v.id === a.assignedTo)?.name || a.assignedTo : '—'}</TableCell>
                    <TableCell>
                      <Select value={a.assignedTo || 'unassign'} onValueChange={val => handleAssign(a.id, val)}>
                        <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassign">Unassign</SelectItem>
                          {vendors.filter(v => v.status === 'active').map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
