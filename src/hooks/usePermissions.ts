import { useAuth, UserRole } from '@/contexts/AuthContext';

type Permission = 'full' | 'read' | 'write' | 'none';

type FeatureKey =
  | 'dashboard' | 'notifications'
  | 'vendors_view' | 'vendors_edit' | 'checkin' | 'assets' | 'allocation' | 'reconciliation'
  | 'inbound_stock' | 'stock_levels' | 'barcode_scanner'
  | 'sales_entry' | 'payments' | 'mobile_money' | 'dues_statement'
  | 'performance' | 'vendor_map'
  | 'incentives' | 'fan_academy'
  | 'outlets' | 'products' | 'commissions' | 'payouts' | 'orders' | 'forecast'
  | 'settlement' | 'depots' | 'audit_trail' | 'user_roles' | 'permissions'
  | 'settings';

const matrix: Record<FeatureKey, Record<UserRole, Permission>> = {
  dashboard:        { admin: 'full', manager: 'full', assistant: 'read', viewer: 'read' },
  notifications:    { admin: 'full', manager: 'read', assistant: 'read', viewer: 'read' },
  vendors_view:     { admin: 'full', manager: 'read', assistant: 'read', viewer: 'read' },
  vendors_edit:     { admin: 'full', manager: 'write', assistant: 'write', viewer: 'none' },
  checkin:          { admin: 'full', manager: 'write', assistant: 'write', viewer: 'read' },
  assets:           { admin: 'full', manager: 'read', assistant: 'read', viewer: 'read' },
  allocation:       { admin: 'full', manager: 'write', assistant: 'write', viewer: 'read' },
  reconciliation:   { admin: 'full', manager: 'write', assistant: 'write', viewer: 'read' },
  inbound_stock:    { admin: 'full', manager: 'write', assistant: 'read', viewer: 'read' },
  stock_levels:     { admin: 'full', manager: 'write', assistant: 'read', viewer: 'read' },
  barcode_scanner:  { admin: 'full', manager: 'full', assistant: 'full', viewer: 'read' },
  sales_entry:      { admin: 'full', manager: 'write', assistant: 'write', viewer: 'read' },
  payments:         { admin: 'full', manager: 'write', assistant: 'write', viewer: 'read' },
  mobile_money:     { admin: 'full', manager: 'write', assistant: 'read', viewer: 'read' },
  dues_statement:   { admin: 'full', manager: 'read', assistant: 'read', viewer: 'read' },
  performance:      { admin: 'full', manager: 'read', assistant: 'read', viewer: 'read' },
  vendor_map:       { admin: 'full', manager: 'read', assistant: 'read', viewer: 'read' },
  incentives:       { admin: 'full', manager: 'read', assistant: 'read', viewer: 'read' },
  fan_academy:      { admin: 'full', manager: 'read', assistant: 'read', viewer: 'read' },
  outlets:          { admin: 'full', manager: 'read', assistant: 'none', viewer: 'read' },
  products:         { admin: 'full', manager: 'read', assistant: 'none', viewer: 'read' },
  commissions:      { admin: 'full', manager: 'read', assistant: 'none', viewer: 'read' },
  payouts:          { admin: 'full', manager: 'read', assistant: 'none', viewer: 'read' },
  orders:           { admin: 'full', manager: 'write', assistant: 'none', viewer: 'read' },
  forecast:         { admin: 'full', manager: 'read', assistant: 'none', viewer: 'read' },
  settlement:       { admin: 'full', manager: 'read', assistant: 'none', viewer: 'read' },
  depots:           { admin: 'full', manager: 'read', assistant: 'none', viewer: 'read' },
  audit_trail:      { admin: 'full', manager: 'none', assistant: 'none', viewer: 'none' },
  user_roles:       { admin: 'full', manager: 'none', assistant: 'none', viewer: 'none' },
  permissions:      { admin: 'full', manager: 'none', assistant: 'none', viewer: 'none' },
  settings:         { admin: 'full', manager: 'full', assistant: 'full', viewer: 'read' },
};

export function usePermissions() {
  const { user } = useAuth();
  const role = user?.role || 'viewer';

  const getPermission = (feature: FeatureKey): Permission => {
    return matrix[feature]?.[role] || 'none';
  };

  const canRead = (feature: FeatureKey): boolean => {
    const p = getPermission(feature);
    return p === 'full' || p === 'read' || p === 'write';
  };

  const canWrite = (feature: FeatureKey): boolean => {
    const p = getPermission(feature);
    return p === 'full' || p === 'write';
  };

  const hasFullAccess = (feature: FeatureKey): boolean => {
    return getPermission(feature) === 'full';
  };

  return { getPermission, canRead, canWrite, hasFullAccess, role };
}
