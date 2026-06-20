import { Gift, GraduationCap } from 'lucide-react';
import { MobileMenuItem } from '@/components/mobile/MobileMenuItem';

export default function MobilePrograms() {
  const items = [
    {
      icon: Gift,
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      title: 'Incentives',
      description: 'Manage incentives and rewards programs',
      to: '/incentives',
    },
    {
      icon: GraduationCap,
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      title: 'Fan Academy',
      description: 'Access training and learning resources',
      to: '/training',
    },
  ];

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="pb-2">
        <h1 className="text-2xl font-bold text-foreground">Programs</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your programs and initiatives</p>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <MobileMenuItem key={item.to} {...item} />
        ))}
      </div>
    </div>
  );
}
