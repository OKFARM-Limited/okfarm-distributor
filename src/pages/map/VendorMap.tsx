import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { vendorLocations } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import 'leaflet/dist/leaflet.css';

export default function VendorMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

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
        L.marker([loc.lat, loc.lng], { icon }).addTo(map).bindPopup(`<b>${loc.vendorName}</b><br/>${loc.territory}`);
      });

      mapInstance.current = map;
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="text-2xl font-bold">Vendor Map</h1>
      <Card>
        <CardContent className="p-0">
          <div ref={mapRef} className="h-[500px] w-full rounded-lg" />
        </CardContent>
      </Card>
      <div className="flex flex-wrap gap-2">
        {vendorLocations.slice(0, 10).map(l => (
          <Badge key={l.vendorId} variant="outline">{l.vendorName} — {l.territory}</Badge>
        ))}
      </div>
    </div>
  );
}
