import { Wallet, CreditCard, Smartphone, FileText } from 'lucide-react';
import { MobileMenuItem } from '@/components/mobile/MobileMenuItem';

export default function MobileFinance() {
  const items = [
    {
      icon: Wallet,
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      title: 'Sales Entry',
      description: 'Record and manage your sales transactions',
      to: '/sales',
    },
    {
      icon: CreditCard,
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      title: 'Payments',
      description: 'Track and manage payments',
      to: '/payments',
    },
    {
      icon: Smartphone,
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
      title: 'Mobile Money',
      description: 'Manage mobile money transactions',
      to: '/mobile-money',
    },
    {
      icon: FileText,
      iconBg: 'bg-amber-100 dark:bg-amber-900/30',
      iconColor: 'text-amber-600 dark:text-amber-400',
      title: 'Dues Statement',
      description: 'View and manage customer dues',
      to: '/dues',
    },
  ];

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="pb-2">
        <h1 className="text-2xl font-bold text-foreground">Finance</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your financial transactions and records</p>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <MobileMenuItem key={item.to} {...item} />
        ))}
      </div>
    </div>
  );
}
