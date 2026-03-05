import { useState } from 'react';
import { vendors as mockVendors, Vendor } from '@/data/mockData';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Phone, MapPin, Fingerprint, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const territories = ['All', 'Ikeja', 'Lekki', 'Victoria Island', 'Surulere', 'Yaba', 'Mushin', 'Oshodi', 'Ikorodu', 'Ajah', 'Festac'];

export default function VendorList() {
  const [vendors, setVendors] = useState<Vendor[]>(mockVendors);
  const [search, setSearch] = useState('');
  const [territory, setTerritory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editVendor, setEditVendor] = useState<Vendor | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const navigate = useNavigate();

  const filtered = vendors.filter(v => {
    const matchSearch = v.name.toLowerCase().includes(search.toLowerCase()) || v.id.toLowerCase().includes(search.toLowerCase());
    const matchTerritory = territory === 'All' || v.territory === territory;
    const matchStatus = statusFilter === 'all' || v.status === statusFilter;
    return matchSearch && matchTerritory && matchStatus;
  });

  const handleSave = (vendor: Vendor) => {
    setVendors(prev => {
      const idx = prev.findIndex(v => v.id === vendor.id);
      if (idx >= 0) { const n = [...prev]; n[idx] = vendor; return n; }
      return [...prev, vendor];
    });
    setEditVendor(null);
    setShowAdd(false);
    toast({ title: 'Vendor saved', description: `${vendor.name} has been updated.` });
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Vendors</h1>
          <p className="text-muted-foreground text-sm">{filtered.length} vendors found</p>
        </div>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> Add Vendor</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Vendor</DialogTitle></DialogHeader>
            <VendorForm onSave={handleSave} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
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

      {/* Vendor Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(v => (
          <Card key={v.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/vendors/${v.id}`)}>
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={v.photo} />
                  <AvatarFallback>{v.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium truncate">{v.name}</p>
                    <Badge variant={v.status === 'active' ? 'default' : v.status === 'inactive' ? 'secondary' : 'destructive'} className="text-xs ml-2 shrink-0">
                      {v.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{v.id}</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{v.phone}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{v.territory}</span>
                    {v.biometricsEnabled && <span className="flex items-center gap-1 text-success"><Fingerprint className="h-3 w-3" />Bio</span>}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs font-medium">₦{v.totalSales.toLocaleString()}</span>
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

      {/* Edit Dialog */}
      <Dialog open={!!editVendor} onOpenChange={open => !open && setEditVendor(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Vendor</DialogTitle></DialogHeader>
          {editVendor && <VendorForm vendor={editVendor} onSave={handleSave} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function VendorForm({ vendor, onSave }: { vendor?: Vendor; onSave: (v: Vendor) => void }) {
  const [name, setName] = useState(vendor?.name || '');
  const [phone, setPhone] = useState(vendor?.phone || '');
  const [terr, setTerr] = useState(vendor?.territory || 'Ikeja');
  const [bio, setBio] = useState(vendor?.biometricsEnabled ?? false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: vendor?.id || `VND-${String(Math.floor(Math.random() * 900) + 100)}`,
      name, phone, territory: terr, biometricsEnabled: bio,
      photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(/\s/g, '')}`,
      status: vendor?.status || 'active',
      joinDate: vendor?.joinDate || new Date().toISOString().split('T')[0],
      totalSales: vendor?.totalSales || 0,
      daysWorked: vendor?.daysWorked || 0,
      assignedAssets: vendor?.assignedAssets || [],
    });
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
      <div className="flex items-center gap-2"><Switch checked={bio} onCheckedChange={setBio} /><Label>Enable Biometrics</Label></div>
      <Button type="submit" className="w-full">Save Vendor</Button>
    </form>
  );
}
