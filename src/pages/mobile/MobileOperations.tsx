import { Users, CheckSquare, Package, ClipboardList, History, FileText } from 'lucide-react';
import { MobileMenuItem } from '@/components/mobile/MobileMenuItem';

export default function MobileOperations() {
  const items = [
    {
      icon: Users,
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      title: 'Vendors',
      description: 'Manage your vendors and their details',
      to: '/vendors',
    },
    {
      icon: CheckSquare,
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      title: 'Check-in',
      description: 'Track and manage check-in activities',
      to: '/checkin',
    },
    {
      icon: Package,
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600 dark:text-green-400',
      title: 'Assets',
      description: 'View and manage your assets',
      to: '/assets',
    },
    {
      icon: ClipboardList,
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
      title: 'Allocation',
      description: 'Allocate resources and manage allocations',
      to: '/allocation',
    },
    {
      icon: History,
      iconBg: 'bg-orange-100 dark:bg-orange-900/30',
      iconColor: 'text-orange-600 dark:text-orange-400',
      title: 'Reconciliation',
      description: 'Reconcile data and transactions',
      to: '/reconciliation',
    },
    {
      icon: FileText,
      iconBg: 'bg-slate-100 dark:bg-slate-900/30',
      iconColor: 'text-slate-600 dark:text-slate-400',
      title: 'Allocation History',
      description: 'View allocation history and records',
      to: '/allocation/history',
    },
  ];

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="pb-2">
        <h1 className="text-2xl font-bold text-foreground">Operations</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage and streamline your operations</p>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <MobileMenuItem key={item.to} {...item} />
        ))}
      </div>
    </div>
  );
}
