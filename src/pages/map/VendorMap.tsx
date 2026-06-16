import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useVendorLocations } from '@/hooks/useSupabaseData';
import { Loader2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

export default function VendorMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<import('leaflet').Map | null>(null);
  const routeLayers = useRef<import('leaflet').Polyline[]>([]);
  const [showRoutes, setShowRoutes] = useState(false);
  const [animating, setAnimating] = useState(false);
  const { data: vendorLocations = [], isLoading } = useVendorLocations();

  useEffect(() => {
    if (!mapRef.current || mapInstance.current || isLoading) return;

    import('leaflet').then(L => {
      const map = L.map(mapRef.current!, { scrollWheelZoom: true }).setView([6.5244, 3.3792], 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      const icon = L.divIcon({
        className: 'custom-marker',
        html: '<div style="background:hsl(210,80%,45%);width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>',
        iconSize: [12, 12],
      });

      vendorLocations.forEach(loc => {
        L.marker([Number(loc.latitude), Number(loc.longitude)], { icon }).addTo(map)
          .bindPopup(`<b>${loc.name}</b><br/>${loc.territory || ''}`);
      });

      mapInstance.current = map;
    });

    return () => {
      if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; }
    };
  }, [vendorLocations, isLoading]);

  useEffect(() => {
    if (!mapInstance.current) return;
    import('leaflet').then(L => {
      routeLayers.current.forEach(l => mapInstance.current.removeLayer(l));
      routeLayers.current = [];
      if (showRoutes) {
        const colors = ['#2563eb', '#16a34a', '#ea580c', '#9333ea', '#dc2626', '#0891b2', '#ca8a04', '#be185d'];
        vendorLocations.forEach((loc, i) => {
          const route = loc.route_data;
          if (Array.isArray(route) && route.length > 1) {
            const polyline = L.polyline(
              route.map((p) => [p.lat, p.lng] as [number, number]),
              { color: colors[i % colors.length], weight: 3, opacity: 0.7, dashArray: animating ? '10, 10' : undefined }
            ).addTo(mapInstance.current);
            routeLayers.current.push(polyline);
          }
        });
      }
    });
  }, [showRoutes, animating, vendorLocations]);

  useEffect(() => {
    if (!animating || !showRoutes) return;
    let offset = 0;
    const interval = setInterval(() => {
      offset += 1;
      routeLayers.current.forEach(layer => {
        const el = layer.getElement?.();
        if (el) el.style.strokeDashoffset = String(-offset);
      });
    }, 50);
    return () => clearInterval(interval);
  }, [animating, showRoutes]);

  if (isLoading) return <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Vendor Map</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2"><Switch checked={showRoutes} onCheckedChange={setShowRoutes} /><Label className="text-sm">Show Routes</Label></div>
          {showRoutes && <div className="flex items-center gap-2"><Switch checked={animating} onCheckedChange={setAnimating} /><Label className="text-sm">Animate</Label></div>}
        </div>
      </div>
      <Card>
        <CardContent className="p-0">
          <div ref={mapRef} className="h-[500px] w-full rounded-lg" />
        </CardContent>
      </Card>
      {vendorLocations.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center">No vendor GPS coordinates found. Update vendor records with latitude/longitude to see them on the map.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {vendorLocations.slice(0, 10).map((l) => (
            <Badge key={l.id} variant="outline">{l.name} — {l.territory || 'N/A'}</Badge>
          ))}
        </div>
      )}
    </div>
  );
}
