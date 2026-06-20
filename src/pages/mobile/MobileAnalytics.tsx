import { BarChart3, MapPin } from 'lucide-react';
import { MobileMenuItem } from '@/components/mobile/MobileMenuItem';

export default function MobileAnalytics() {
  const items = [
    {
      icon: BarChart3,
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      title: 'Performance',
      description: 'Track and analyze performance metrics',
      to: '/performance',
    },
    {
      icon: MapPin,
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      title: 'Vendor Maps',
      description: 'View vendor locations and coverage',
      to: '/map',
    },
  ];

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="pb-2">
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Gain insights and make data-driven decisions</p>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <MobileMenuItem key={item.to} {...item} />
        ))}
      </div>
    </div>
  );
}
