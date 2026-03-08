import { Check, X, ShieldCheck, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

type Permission = 'full' | 'read' | 'write' | 'none';

interface FeaturePermission {
  feature: string;
  category: string;
  admin: Permission;
  manager: Permission;
  assistant: Permission;
  viewer: Permission;
}

const permissions: FeaturePermission[] = [
  // Overview
  { feature: 'Dashboard', category: 'Overview', admin: 'full', manager: 'full', assistant: 'read', viewer: 'read' },
  { feature: 'Notifications', category: 'Overview', admin: 'full', manager: 'read', assistant: 'read', viewer: 'read' },
  // Operations
  { feature: 'Vendors (view)', category: 'Operations', admin: 'full', manager: 'read', assistant: 'read', viewer: 'read' },
  { feature: 'Vendors (create/edit)', category: 'Operations', admin: 'full', manager: 'write', assistant: 'write', viewer: 'none' },
  { feature: 'Check-In', category: 'Operations', admin: 'full', manager: 'write', assistant: 'write', viewer: 'read' },
  { feature: 'Assets', category: 'Operations', admin: 'full', manager: 'read', assistant: 'read', viewer: 'read' },
  { feature: 'Allocation', category: 'Operations', admin: 'full', manager: 'write', assistant: 'write', viewer: 'read' },
  { feature: 'Reconciliation', category: 'Operations', admin: 'full', manager: 'write', assistant: 'write', viewer: 'read' },
  // Inventory
  { feature: 'Inbound Stock', category: 'Inventory', admin: 'full', manager: 'write', assistant: 'read', viewer: 'read' },
  { feature: 'Stock Levels', category: 'Inventory', admin: 'full', manager: 'write', assistant: 'read', viewer: 'read' },
  { feature: 'Barcode Scanner', category: 'Inventory', admin: 'full', manager: 'full', assistant: 'full', viewer: 'read' },
  // Finance
  { feature: 'Sales Entry', category: 'Finance', admin: 'full', manager: 'write', assistant: 'write', viewer: 'read' },
  { feature: 'Payments', category: 'Finance', admin: 'full', manager: 'write', assistant: 'write', viewer: 'read' },
  { feature: 'Mobile Money', category: 'Finance', admin: 'full', manager: 'write', assistant: 'read', viewer: 'read' },
  { feature: 'Dues Statement', category: 'Finance', admin: 'full', manager: 'read', assistant: 'read', viewer: 'read' },
  // Analytics
  { feature: 'Performance Dashboard', category: 'Analytics', admin: 'full', manager: 'read', assistant: 'read', viewer: 'read' },
  { feature: 'Vendor Map', category: 'Analytics', admin: 'full', manager: 'read', assistant: 'read', viewer: 'read' },
  // Programs
  { feature: 'Incentives', category: 'Programs', admin: 'full', manager: 'read', assistant: 'read', viewer: 'read' },
  { feature: 'Fan Academy', category: 'Programs', admin: 'full', manager: 'read', assistant: 'read', viewer: 'read' },
  // Admin
  { feature: 'Outlets Management', category: 'Admin', admin: 'full', manager: 'read', assistant: 'none', viewer: 'read' },
  { feature: 'Products Management', category: 'Admin', admin: 'full', manager: 'read', assistant: 'none', viewer: 'read' },
  { feature: 'Commissions', category: 'Admin', admin: 'full', manager: 'read', assistant: 'none', viewer: 'read' },
  { feature: 'Payouts', category: 'Admin', admin: 'full', manager: 'read', assistant: 'none', viewer: 'read' },
  { feature: 'Orders', category: 'Admin', admin: 'full', manager: 'write', assistant: 'none', viewer: 'read' },
  { feature: 'Forecast & Reorder', category: 'Admin', admin: 'full', manager: 'read', assistant: 'none', viewer: 'read' },
  { feature: 'Settlement', category: 'Admin', admin: 'full', manager: 'read', assistant: 'none', viewer: 'read' },
  { feature: 'Depots', category: 'Admin', admin: 'full', manager: 'read', assistant: 'none', viewer: 'read' },
  { feature: 'Audit Trail', category: 'Admin', admin: 'full', manager: 'none', assistant: 'none', viewer: 'none' },
  { feature: 'User Roles', category: 'Admin', admin: 'full', manager: 'none', assistant: 'none', viewer: 'none' },
  { feature: 'Permissions', category: 'Admin', admin: 'full', manager: 'none', assistant: 'none', viewer: 'none' },
  // System
  { feature: 'Settings', category: 'System', admin: 'full', manager: 'full', assistant: 'full', viewer: 'read' },
];

function PermissionCell({ level }: { level: Permission }) {
  switch (level) {
    case 'full':
      return (
        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
          <Check className="h-4 w-4" /> Full
        </span>
      );
    case 'write':
      return (
        <span className="inline-flex items-center gap-1 text-primary">
          <ShieldCheck className="h-4 w-4" /> Read & Write
        </span>
      );
    case 'read':
      return (
        <span className="inline-flex items-center gap-1 text-muted-foreground">
          <Eye className="h-4 w-4" /> Read Only
        </span>
      );
    case 'none':
      return (
        <span className="inline-flex items-center gap-1 text-destructive/60">
          <X className="h-4 w-4" /> No Access
        </span>
      );
  }
}

export default function PermissionsMatrix() {
  const categories = [...new Set(permissions.map(p => p.category))];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Permissions Matrix</h1>
        <p className="text-muted-foreground">Overview of role-based access across all features.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Badge variant="destructive" className="text-sm px-3 py-1">Admin — Full system access</Badge>
        <Badge variant="default" className="text-sm px-3 py-1">Manager — Operations & analytics</Badge>
        <Badge variant="secondary" className="text-sm px-3 py-1">Assistant — Data entry & viewing</Badge>
        <Badge variant="outline" className="text-sm px-3 py-1">Viewer — Read-only access</Badge>
      </div>

      {categories.map(category => (
        <Card key={category}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{category}</CardTitle>
            <CardDescription>Feature permissions for the {category.toLowerCase()} section</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30%]">Feature</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Assistant</TableHead>
                  <TableHead>Viewer</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {permissions
                  .filter(p => p.category === category)
                  .map(p => (
                    <TableRow key={p.feature}>
                      <TableCell className="font-medium">{p.feature}</TableCell>
                      <TableCell><PermissionCell level={p.admin} /></TableCell>
                      <TableCell><PermissionCell level={p.manager} /></TableCell>
                      <TableCell><PermissionCell level={p.assistant} /></TableCell>
                      <TableCell><PermissionCell level={p.viewer} /></TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
