import { describe, it, expect } from 'vitest';

// Extract the permission matrix and logic for direct testing
// (mirrors the logic from usePermissions.ts without the React hook)

type Permission = 'full' | 'read' | 'write' | 'none';
type UserRole = 'admin' | 'manager' | 'assistant' | 'viewer';

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

function getPermission(role: UserRole, feature: FeatureKey): Permission {
  return matrix[feature]?.[role] || 'none';
}

function canRead(role: UserRole, feature: FeatureKey): boolean {
  const p = getPermission(role, feature);
  return p === 'full' || p === 'read' || p === 'write';
}

function canWrite(role: UserRole, feature: FeatureKey): boolean {
  const p = getPermission(role, feature);
  return p === 'full' || p === 'write';
}

function hasFullAccess(role: UserRole, feature: FeatureKey): boolean {
  return getPermission(role, feature) === 'full';
}

describe('Permissions Matrix', () => {
  describe('Admin role', () => {
    it('has full access to all features', () => {
      const features = Object.keys(matrix) as FeatureKey[];
      for (const feature of features) {
        expect(hasFullAccess('admin', feature)).toBe(true);
      }
    });
  });

  describe('Viewer role', () => {
    it('can read dashboard but cannot write', () => {
      expect(canRead('viewer', 'dashboard')).toBe(true);
      expect(canWrite('viewer', 'dashboard')).toBe(false);
    });

    it('cannot edit vendors', () => {
      expect(canWrite('viewer', 'vendors_edit')).toBe(false);
      expect(canRead('viewer', 'vendors_edit')).toBe(false);
    });

    it('cannot access admin features', () => {
      expect(canRead('viewer', 'audit_trail')).toBe(false);
      expect(canRead('viewer', 'user_roles')).toBe(false);
      expect(canRead('viewer', 'permissions')).toBe(false);
    });

    it('can read settings', () => {
      expect(canRead('viewer', 'settings')).toBe(true);
      expect(canWrite('viewer', 'settings')).toBe(false);
    });
  });

  describe('Manager role', () => {
    it('can write sales, allocations, and payments', () => {
      expect(canWrite('manager', 'sales_entry')).toBe(true);
      expect(canWrite('manager', 'allocation')).toBe(true);
      expect(canWrite('manager', 'payments')).toBe(true);
    });

    it('can read but not write to commissions', () => {
      expect(canRead('manager', 'commissions')).toBe(true);
      expect(canWrite('manager', 'commissions')).toBe(false);
    });

    it('cannot access admin-only features', () => {
      expect(canRead('manager', 'audit_trail')).toBe(false);
      expect(canRead('manager', 'user_roles')).toBe(false);
    });

    it('has full access to settings and barcode scanner', () => {
      expect(hasFullAccess('manager', 'settings')).toBe(true);
      expect(hasFullAccess('manager', 'barcode_scanner')).toBe(true);
    });
  });

  describe('Assistant role', () => {
    it('can write sales and allocations', () => {
      expect(canWrite('assistant', 'sales_entry')).toBe(true);
      expect(canWrite('assistant', 'allocation')).toBe(true);
    });

    it('cannot access admin pages', () => {
      expect(canRead('assistant', 'outlets')).toBe(false);
      expect(canRead('assistant', 'products')).toBe(false);
      expect(canRead('assistant', 'commissions')).toBe(false);
    });

    it('can read inbound stock but not write', () => {
      expect(canRead('assistant', 'inbound_stock')).toBe(true);
      expect(canWrite('assistant', 'inbound_stock')).toBe(false);
    });
  });

  describe('Permission hierarchy', () => {
    it('full implies read and write', () => {
      expect(canRead('admin', 'dashboard')).toBe(true);
      expect(canWrite('admin', 'dashboard')).toBe(true);
      expect(hasFullAccess('admin', 'dashboard')).toBe(true);
    });

    it('write implies read', () => {
      expect(canRead('manager', 'sales_entry')).toBe(true);
      expect(canWrite('manager', 'sales_entry')).toBe(true);
      expect(hasFullAccess('manager', 'sales_entry')).toBe(false);
    });

    it('read does not imply write', () => {
      expect(canRead('viewer', 'dashboard')).toBe(true);
      expect(canWrite('viewer', 'dashboard')).toBe(false);
    });

    it('none implies no access at all', () => {
      expect(canRead('viewer', 'audit_trail')).toBe(false);
      expect(canWrite('viewer', 'audit_trail')).toBe(false);
      expect(hasFullAccess('viewer', 'audit_trail')).toBe(false);
    });
  });

  describe('Matrix completeness', () => {
    it('all features have all 4 roles defined', () => {
      const roles: UserRole[] = ['admin', 'manager', 'assistant', 'viewer'];
      const features = Object.keys(matrix) as FeatureKey[];
      for (const feature of features) {
        for (const role of roles) {
          expect(matrix[feature][role]).toBeDefined();
          expect(['full', 'read', 'write', 'none']).toContain(matrix[feature][role]);
        }
      }
    });

    it('has expected number of features (31)', () => {
      expect(Object.keys(matrix)).toHaveLength(31);
    });
  });
});
