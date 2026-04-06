import { Check, X, ShieldCheck, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePermissions } from '@/hooks/usePermissions';

type Permission = 'full' | 'read' | 'write' | 'none';

interface FeaturePermission {
  feature: string;
  featureKey: string;
  category: string;
  categoryKey: string;
  admin: Permission;
  manager: Permission;
  assistant: Permission;
  viewer: Permission;
}

const permissions: FeaturePermission[] = [
  { feature: 'Dashboard', featureKey: 'dashboard', category: 'Overview', categoryKey: 'overview', admin: 'full', manager: 'full', assistant: 'read', viewer: 'read' },
  { feature: 'Notifications', featureKey: 'notifications', category: 'Overview', categoryKey: 'overview', admin: 'full', manager: 'read', assistant: 'read', viewer: 'read' },
  { feature: 'Vendors (view)', featureKey: 'vendors', category: 'Operations', categoryKey: 'operations', admin: 'full', manager: 'read', assistant: 'read', viewer: 'read' },
  { feature: 'Vendors (create/edit)', featureKey: 'addVendor', category: 'Operations', categoryKey: 'operations', admin: 'full', manager: 'write', assistant: 'write', viewer: 'none' },
  { feature: 'Check-In', featureKey: 'checkIn', category: 'Operations', categoryKey: 'operations', admin: 'full', manager: 'write', assistant: 'write', viewer: 'read' },
  { feature: 'Assets', featureKey: 'assets', category: 'Operations', categoryKey: 'operations', admin: 'full', manager: 'read', assistant: 'read', viewer: 'read' },
  { feature: 'Allocation', featureKey: 'allocation', category: 'Operations', categoryKey: 'operations', admin: 'full', manager: 'write', assistant: 'write', viewer: 'read' },
  { feature: 'Reconciliation', featureKey: 'reconciliation', category: 'Operations', categoryKey: 'operations', admin: 'full', manager: 'write', assistant: 'write', viewer: 'read' },
  { feature: 'Inbound Stock', featureKey: 'inboundStock', category: 'Inventory', categoryKey: 'inventory', admin: 'full', manager: 'write', assistant: 'read', viewer: 'read' },
  { feature: 'Barcode Scanner', featureKey: 'scanner', category: 'Inventory', categoryKey: 'inventory', admin: 'full', manager: 'full', assistant: 'full', viewer: 'read' },
  { feature: 'Sales Entry', featureKey: 'salesEntry', category: 'Finance', categoryKey: 'finance', admin: 'full', manager: 'write', assistant: 'write', viewer: 'read' },
  { feature: 'Payments', featureKey: 'payments', category: 'Finance', categoryKey: 'finance', admin: 'full', manager: 'write', assistant: 'write', viewer: 'read' },
  { feature: 'Mobile Money', featureKey: 'mobileMoney', category: 'Finance', categoryKey: 'finance', admin: 'full', manager: 'write', assistant: 'read', viewer: 'read' },
  { feature: 'Dues Statement', featureKey: 'duesStatement', category: 'Finance', categoryKey: 'finance', admin: 'full', manager: 'read', assistant: 'read', viewer: 'read' },
  { feature: 'Performance', featureKey: 'performance', category: 'Analytics', categoryKey: 'analytics', admin: 'full', manager: 'read', assistant: 'read', viewer: 'read' },
  { feature: 'Vendor Map', featureKey: 'vendorMap', category: 'Analytics', categoryKey: 'analytics', admin: 'full', manager: 'read', assistant: 'read', viewer: 'read' },
  { feature: 'Incentives', featureKey: 'incentives', category: 'Programs', categoryKey: 'programs', admin: 'full', manager: 'read', assistant: 'read', viewer: 'read' },
  { feature: 'Fan Academy', featureKey: 'fanAcademy', category: 'Programs', categoryKey: 'programs', admin: 'full', manager: 'read', assistant: 'read', viewer: 'read' },
  { feature: 'Outlets', featureKey: 'outlets', category: 'Admin', categoryKey: 'admin', admin: 'full', manager: 'read', assistant: 'none', viewer: 'read' },
  { feature: 'Products', featureKey: 'products', category: 'Admin', categoryKey: 'admin', admin: 'full', manager: 'read', assistant: 'none', viewer: 'read' },
  { feature: 'Commissions', featureKey: 'commissions', category: 'Admin', categoryKey: 'admin', admin: 'full', manager: 'read', assistant: 'none', viewer: 'read' },
  { feature: 'Payouts', featureKey: 'payouts', category: 'Admin', categoryKey: 'admin', admin: 'full', manager: 'read', assistant: 'none', viewer: 'read' },
  { feature: 'Orders', featureKey: 'orders', category: 'Admin', categoryKey: 'admin', admin: 'full', manager: 'write', assistant: 'none', viewer: 'read' },
  { feature: 'Forecast', featureKey: 'forecast', category: 'Admin', categoryKey: 'admin', admin: 'full', manager: 'read', assistant: 'none', viewer: 'read' },
  { feature: 'Settlement', featureKey: 'settlement', category: 'Admin', categoryKey: 'admin', admin: 'full', manager: 'read', assistant: 'none', viewer: 'read' },
  { feature: 'Depots', featureKey: 'depots', category: 'Admin', categoryKey: 'admin', admin: 'full', manager: 'read', assistant: 'none', viewer: 'read' },
  { feature: 'Audit Trail', featureKey: 'auditTrail', category: 'Admin', categoryKey: 'admin', admin: 'full', manager: 'none', assistant: 'none', viewer: 'none' },
  { feature: 'User Roles', featureKey: 'userRoles', category: 'Admin', categoryKey: 'admin', admin: 'full', manager: 'none', assistant: 'none', viewer: 'none' },
  { feature: 'Permissions', featureKey: 'permissions', category: 'Admin', categoryKey: 'admin', admin: 'full', manager: 'none', assistant: 'none', viewer: 'none' },
  { feature: 'Settings', featureKey: 'settings', category: 'System', categoryKey: 'system', admin: 'full', manager: 'full', assistant: 'full', viewer: 'read' },
];

function PermissionCell({ level, t }: { level: Permission; t: (key: string) => string }) {
  switch (level) {
    case 'full':
      return (
        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
          <Check className="h-4 w-4" /> {t('fullAccess')}
        </span>
      );
    case 'write':
      return (
        <span className="inline-flex items-center gap-1 text-primary">
          <ShieldCheck className="h-4 w-4" /> {t('readWrite')}
        </span>
      );
    case 'read':
      return (
        <span className="inline-flex items-center gap-1 text-muted-foreground">
          <Eye className="h-4 w-4" /> {t('readOnly')}
        </span>
      );
    case 'none':
      return (
        <span className="inline-flex items-center gap-1 text-destructive/60">
          <X className="h-4 w-4" /> {t('noAccess')}
        </span>
      );
  }
}

export default function PermissionsMatrix() {
  const { t } = useLanguage();
  const { role } = usePermissions();
  const categories = [...new Set(permissions.map(p => p.categoryKey))];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('permissionsMatrix')}</h1>
        <p className="text-muted-foreground">{t('roleOverview')}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Badge variant="destructive" className="text-sm px-3 py-1">{t('adminFullAccess')}</Badge>
        <Badge variant="default" className="text-sm px-3 py-1">{t('managerOpsAnalytics')}</Badge>
        <Badge variant="secondary" className="text-sm px-3 py-1">{t('assistantDataEntry')}</Badge>
        <Badge variant="outline" className="text-sm px-3 py-1">{t('viewerReadOnly')}</Badge>
      </div>

      {categories.map(categoryKey => {
        const categoryPerms = permissions.filter(p => p.categoryKey === categoryKey);
        return (
          <Card key={categoryKey}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{t(categoryKey)}</CardTitle>
              <CardDescription>{t('featurePermissions')} {t(categoryKey).toLowerCase()} {t('section')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[30%]">{t('feature')}</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead>Manager</TableHead>
                    <TableHead>Assistant</TableHead>
                    <TableHead>Viewer</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categoryPerms.map(p => (
                    <TableRow key={p.featureKey} className={p[role as keyof typeof p] === role ? 'bg-primary/5' : ''}>
                      <TableCell className="font-medium">{t(p.featureKey)}</TableCell>
                      <TableCell><PermissionCell level={p.admin} t={t} /></TableCell>
                      <TableCell><PermissionCell level={p.manager} t={t} /></TableCell>
                      <TableCell><PermissionCell level={p.assistant} t={t} /></TableCell>
                      <TableCell><PermissionCell level={p.viewer} t={t} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
