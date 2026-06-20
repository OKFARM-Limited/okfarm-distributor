import { Package, ScanLine } from 'lucide-react';
import { MobileMenuItem } from '@/components/mobile/MobileMenuItem';

export default function MobileInventory() {
  const items = [
    {
      icon: Package,
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      title: 'Inbound Stock',
      description: 'Manage incoming stock and deliveries',
      to: '/inventory',
    },
    {
      icon: ScanLine,
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      title: 'Scanner',
      description: 'Scan barcodes and manage inventory',
      to: '/scanner',
    },
  ];

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="pb-2">
        <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Track and manage your inventory in real-time</p>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <MobileMenuItem key={item.to} {...item} />
        ))}
      </div>
    </div>
  );
}
