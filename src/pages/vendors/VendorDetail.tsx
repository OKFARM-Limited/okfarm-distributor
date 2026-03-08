import { useParams, useNavigate } from 'react-router-dom';
import { useVendor, useAssets, useUpsertVendor } from '@/hooks/useSupabaseData';
import { useOutletContext } from '@/contexts/OutletContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ArrowLeft, Phone, MapPin, Fingerprint, Package, Loader2, UserX, UserCheck } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useState } from 'react';
import { ViewerBanner } from '@/components/ViewerGuard';
import { useViewerGuard } from '@/hooks/useViewerGuard';

export default function VendorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getOutletName } = useOutletContext();
  const { user } = useAuth();
  const { data: vendor, isLoading } = useVendor(id);
  const { data: allAssets = [] } = useAssets('all');
  const upsertVendor = useUpsertVendor();
  const [confirmDialog, setConfirmDialog] = useState(false);

  if (isLoading) return <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (!vendor) return <div className="p-8 text-center text-muted-foreground">Vendor not found</div>;

  const vendorAssets = allAssets.filter((a: any) => a.assigned_to === vendor.id);
  const isActive = vendor.status === 'active';

  const handleToggleStatus = () => {
    const newStatus = isActive ? 'inactive' : 'active';
    upsertVendor.mutate(
      { id: vendor.id, status: newStatus },
      {
        onSuccess: () => {
          toast({ title: isActive ? '🚫 Vendor Deactivated' : '✅ Vendor Reactivated', description: `${vendor.name} is now ${newStatus}.` });
          setConfirmDialog(false);
        },
        onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
      }
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/vendors')} className="gap-1">
          <ArrowLeft className="h-4 w-4" /> Back to Vendors
        </Button>
        {(user?.role === 'admin' || user?.role === 'assistant') && (
          <Button
            variant={isActive ? 'destructive' : 'default'}
            onClick={() => setConfirmDialog(true)}
            className="gap-1"
          >
            {isActive ? <><UserX className="h-4 w-4" /> Deactivate</> : <><UserCheck className="h-4 w-4" /> Reactivate</>}
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Card className="flex-1">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={vendor.photo_url || ''} />
                <AvatarFallback>{vendor.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold">{vendor.name}</h2>
                <p className="text-sm text-muted-foreground">{vendor.vendor_code}</p>
                <Badge className="mt-1" variant={vendor.status === 'active' ? 'default' : 'destructive'}>{vendor.status}</Badge>
                <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2"><Phone className="h-4 w-4" />{vendor.phone}</p>
                  <p className="flex items-center gap-2"><MapPin className="h-4 w-4" />{vendor.territory} — {getOutletName(vendor.outlet_id)}</p>
                  {vendor.biometrics_enabled && <p className="flex items-center gap-2 text-success"><Fingerprint className="h-4 w-4" />Biometrics Enabled</p>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3 sm:w-64">
          <Card><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Total Sales</p><p className="text-lg font-bold">₦{Number(vendor.total_sales || 0).toLocaleString()}</p></CardContent></Card>
          <Card><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Days Worked</p><p className="text-lg font-bold">{vendor.days_worked || 0}</p></CardContent></Card>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Package className="h-4 w-4" /> Assigned Assets</CardTitle></CardHeader>
        <CardContent>
          {vendorAssets.length === 0 ? <p className="text-sm text-muted-foreground">No assets assigned</p> : (
            <div className="flex flex-wrap gap-2">
              {vendorAssets.map((a: any) => (
                <Badge key={a.id} variant="outline" className="px-3 py-1.5">
                  {a.name} ({a.type.replace('_', ' ')}) — {a.condition}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Deactivate/Reactivate Confirmation Dialog */}
      <Dialog open={confirmDialog} onOpenChange={setConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isActive ? 'Deactivate Vendor?' : 'Reactivate Vendor?'}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {isActive
              ? `${vendor.name} will no longer appear in active vendor lists, allocation, or check-in workflows.`
              : `${vendor.name} will be restored to active status and can resume operations.`}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog(false)}>Cancel</Button>
            <Button
              variant={isActive ? 'destructive' : 'default'}
              onClick={handleToggleStatus}
              disabled={upsertVendor.isPending}
            >
              {upsertVendor.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              {isActive ? 'Deactivate' : 'Reactivate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
