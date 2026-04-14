import { useOutletContext } from '@/contexts/OutletContext';
import { useVendors, useAssets } from '@/hooks/useSupabaseData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Phone, MapPin, Fingerprint, Edit, Building2, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { useUpsertVendor } from '@/hooks/useSupabaseData';
import { usePagination } from '@/hooks/usePagination';
import { PaginationControls } from '@/components/PaginationControls';
import { ViewerBanner } from '@/components/ViewerGuard';
import { useViewerGuard } from '@/hooks/useViewerGuard';

const territories = ['All', 'Ikeja', 'Lekki', 'Victoria Island', 'Surulere', 'Yaba', 'Mushin', 'Oshodi', 'Ikorodu', 'Ajah', 'Festac'];

export default function VendorList() {
  const [search, setSearch] = useState('');
  const [territory, setTerritory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editVendor, setEditVendor] = useState<any>(null);
  const navigate = useNavigate();
  const { viewerProps } = useViewerGuard();
  const { selectedOutletId, isAllOutlets, getOutletName } = useOutletContext();
  const { data: vendors = [], isLoading } = useVendors(isAllOutlets ? 'all' : selectedOutletId);

  const filtered = vendors.filter((v: any) => {
    const matchSearch = v.name.toLowerCase().includes(search.toLowerCase()) || v.vendor_code.toLowerCase().includes(search.toLowerCase());
    const matchTerritory = territory === 'All' || v.territory === territory;
    const matchStatus = statusFilter === 'all' || v.status === statusFilter;
    return matchSearch && matchTerritory && matchStatus;
  });

  const { paginatedItems, currentPage, totalPages, totalItems, goToPage, hasNextPage, hasPrevPage, resetPage } = usePagination(filtered, 18);

  useEffect(() => { resetPage(); }, [search, territory, statusFilter]);

  if (isLoading) return <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-4 animate-fade-in">
      <ViewerBanner />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Vendors</h1>
          <p className="text-muted-foreground text-sm">{filtered.length} vendors found{!isAllOutlets && ` in ${getOutletName(selectedOutletId)}`}</p>
        </div>
        <Button onClick={() => navigate('/vendors/onboard')} {...viewerProps}><Plus className="h-4 w-4 mr-1" /> Onboard Vendor</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search vendors..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={territory} onValueChange={setTerritory}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
          <SelectContent>{territories.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {paginatedItems.map((v: any) => (
          <Card key={v.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/vendors/${v.id}`)}>
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={v.photo_url} />
                  <AvatarFallback>{v.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium truncate">{v.name}</p>
                    <Badge variant={v.status === 'active' ? 'default' : v.status === 'inactive' ? 'secondary' : 'destructive'} className="text-xs ml-2 shrink-0">
                      {v.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{v.vendor_code}</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{v.phone}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{v.territory}</span>
                    <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{v.outlets?.name || getOutletName(v.outlet_id)}</span>
                    {v.biometrics_enabled && <span className="flex items-center gap-1 text-success"><Fingerprint className="h-3 w-3" />Bio</span>}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs font-medium">₦{Number(v.total_sales || 0).toLocaleString()}</span>
                    <Button size="sm" variant="ghost" className="h-7 px-2" onClick={e => { e.stopPropagation(); setEditVendor(v); }}>
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <PaginationControls currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} onPageChange={goToPage} hasNextPage={hasNextPage} hasPrevPage={hasPrevPage} />

      <Dialog open={!!editVendor} onOpenChange={open => !open && setEditVendor(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Quick Edit Vendor</DialogTitle></DialogHeader>
          {editVendor && <QuickEditForm vendor={editVendor} onDone={() => setEditVendor(null)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function QuickEditForm({ vendor, onDone }: { vendor: any; onDone: () => void }) {
  const { allOutlets } = useOutletContext();
  const upsertVendor = useUpsertVendor();
  const [name, setName] = useState(vendor.name);
  const [phone, setPhone] = useState(vendor.phone || '');
  const [terr, setTerr] = useState(vendor.territory || '');
  const [outletId, setOutletId] = useState(vendor.outlet_id || '');
  const [bio, setBio] = useState(vendor.biometrics_enabled || false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await upsertVendor.mutateAsync({ id: vendor.id, name, phone, territory: terr, outlet_id: outletId, biometrics_enabled: bio });
      toast({ title: 'Vendor saved', description: 'Vendor has been updated.' });
      onDone();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={e => setName(e.target.value)} required /></div>
      <div className="space-y-2"><Label>Phone</Label><Input value={phone} onChange={e => setPhone(e.target.value)} required /></div>
      <div className="space-y-2">
        <Label>Territory</Label>
        <Select value={terr} onValueChange={setTerr}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{['Ikeja', 'Lekki', 'Victoria Island', 'Surulere', 'Yaba', 'Mushin', 'Oshodi', 'Ikorodu', 'Ajah', 'Festac'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Outlet</Label>
        <Select value={outletId} onValueChange={setOutletId}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{allOutlets.map(o => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2"><Switch checked={bio} onCheckedChange={setBio} /><Label>Enable Biometrics</Label></div>
      <Button type="submit" className="w-full" disabled={upsertVendor.isPending}>
        {upsertVendor.isPending ? 'Saving...' : 'Save Vendor'}
      </Button>
    </form>
  );
}
