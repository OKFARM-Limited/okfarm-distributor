import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

// ===== OUTLETS =====
export type DbOutlet = Tables<'outlets'>;

export function useOutlets() {
  return useQuery({
    queryKey: ['outlets'],
    queryFn: async () => {
      const { data, error } = await supabase.from('outlets').select('*').order('name');
      if (error) throw error;
      return data as DbOutlet[];
    },
  });
}

export function useUpsertOutlet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (outlet: TablesInsert<'outlets'> | TablesUpdate<'outlets'>) => {
      if ('id' in outlet && outlet.id) {
        const { data, error } = await supabase.from('outlets').update(outlet).eq('id', outlet.id).select().single();
        if (error) throw error;
        return data;
      }
      const { data, error } = await supabase.from('outlets').insert(outlet as TablesInsert<'outlets'>).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['outlets'] }),
  });
}

// ===== PRODUCTS =====
export type DbProduct = Tables<'products'>;

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*').order('sku');
      if (error) throw error;
      return data as DbProduct[];
    },
  });
}

export function useUpsertProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (product: TablesInsert<'products'> | (TablesUpdate<'products'> & { id: string })) => {
      if ('id' in product && product.id) {
        const { id, ...rest } = product;
        const { data, error } = await supabase.from('products').update(rest).eq('id', id).select().single();
        if (error) throw error;
        return data;
      }
      const { data, error } = await supabase.from('products').insert(product as TablesInsert<'products'>).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}

// ===== VENDORS =====
export type DbVendor = Tables<'vendors'>;

export function useVendors(outletId?: string | null) {
  return useQuery({
    queryKey: ['vendors', outletId],
    queryFn: async () => {
      let query = supabase.from('vendors').select('*, outlets(name, short_code)').order('name');
      if (outletId && outletId !== 'all') {
        query = query.eq('outlet_id', outletId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useVendor(id: string | undefined) {
  return useQuery({
    queryKey: ['vendor', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase.from('vendors').select('*, outlets(name, short_code)').eq('id', id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useUpsertVendor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vendor: TablesInsert<'vendors'> | (TablesUpdate<'vendors'> & { id: string })) => {
      if ('id' in vendor && vendor.id) {
        const { id, ...rest } = vendor;
        const { data, error } = await supabase.from('vendors').update(rest).eq('id', id).select().single();
        if (error) throw error;
        return data;
      }
      const { data, error } = await supabase.from('vendors').insert(vendor as TablesInsert<'vendors'>).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendors'] }),
  });
}

// ===== ASSETS =====
export type DbAsset = Tables<'assets'>;

export function useAssets(outletId?: string | null) {
  return useQuery({
    queryKey: ['assets', outletId],
    queryFn: async () => {
      let query = supabase.from('assets').select('*, vendors(name, vendor_code), outlets(name, short_code)').order('asset_code');
      if (outletId && outletId !== 'all') query = query.eq('outlet_id', outletId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<'assets'> & { id: string }) => {
      const { data, error } = await supabase.from('assets').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['assets'] }),
  });
}

// ===== DEPOTS =====
export type DbDepot = Tables<'depots'>;

export function useDepots(outletId?: string | null) {
  return useQuery({
    queryKey: ['depots', outletId],
    queryFn: async () => {
      let query = supabase.from('depots').select('*, outlets(name, short_code)').order('name');
      if (outletId && outletId !== 'all') query = query.eq('outlet_id', outletId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useUpsertDepot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (depot: TablesInsert<'depots'> | (TablesUpdate<'depots'> & { id: string })) => {
      if ('id' in depot && depot.id) {
        const { id, ...rest } = depot;
        const { data, error } = await supabase.from('depots').update(rest).eq('id', id).select().single();
        if (error) throw error;
        return data;
      }
      const { data, error } = await supabase.from('depots').insert(depot as TablesInsert<'depots'>).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['depots'] }),
  });
}

// ===== ALLOCATIONS =====
export function useAllocations(outletId?: string | null) {
  return useQuery({
    queryKey: ['allocations', outletId],
    queryFn: async () => {
      let query = supabase.from('allocations').select('*, vendors(name, vendor_code, territory), outlets(name, short_code), allocation_items(*, products(name, sku))').order('date', { ascending: false });
      if (outletId && outletId !== 'all') query = query.eq('outlet_id', outletId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateAllocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ items, ...alloc }: TablesInsert<'allocations'> & { items: { product_id: string; quantity: number; unit_price: number }[] }) => {
      const { data, error } = await supabase.from('allocations').insert(alloc).select().single();
      if (error) throw error;
      if (items.length > 0) {
        const { error: itemErr } = await supabase.from('allocation_items').insert(
          items.map(i => ({ allocation_id: data.id, product_id: i.product_id, quantity: i.quantity, unit_price: i.unit_price }))
        );
        if (itemErr) throw itemErr;
      }
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['allocations'] }),
  });
}

// ===== SALES =====
export function useSales(outletId?: string | null) {
  return useQuery({
    queryKey: ['sales', outletId],
    queryFn: async () => {
      let query = supabase.from('sales').select('*, vendors(name, vendor_code), outlets(name, short_code), sale_items(*, products(name, sku))').order('date', { ascending: false });
      if (outletId && outletId !== 'all') query = query.eq('outlet_id', outletId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateSale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ items, ...sale }: TablesInsert<'sales'> & { items: { product_id: string; quantity: number; unit_price: number }[] }) => {
      const { data, error } = await supabase.from('sales').insert(sale).select().single();
      if (error) throw error;
      if (items.length > 0) {
        const { error: itemErr } = await supabase.from('sale_items').insert(
          items.map(i => ({ sale_id: data.id, product_id: i.product_id, quantity: i.quantity, unit_price: i.unit_price }))
        );
        if (itemErr) throw itemErr;
      }
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sales'] }),
  });
}

// ===== CHECK-INS =====
export function useCheckIns(date?: string) {
  return useQuery({
    queryKey: ['check_ins', date],
    queryFn: async () => {
      let query = supabase.from('check_ins').select('*, vendors(name, vendor_code, territory, photo_url, status)').order('check_in_time', { ascending: false });
      if (date) query = query.eq('date', date);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateCheckIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (checkIn: TablesInsert<'check_ins'>) => {
      const { data, error } = await supabase.from('check_ins').insert(checkIn).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['check_ins'] }),
  });
}

export function useUpdateCheckIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<TablesInsert<'check_ins'>>) => {
      const { data, error } = await supabase.from('check_ins').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['check_ins'] }),
  });
}

// ===== RECONCILIATIONS =====
export function useReconciliations(outletId?: string | null) {
  return useQuery({
    queryKey: ['reconciliations', outletId],
    queryFn: async () => {
      let query = supabase.from('reconciliations').select('*, vendors(name), outlets(name), reconciliation_items(*, products(name))').order('date', { ascending: false });
      if (outletId && outletId !== 'all') query = query.eq('outlet_id', outletId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateReconciliation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ items, ...recon }: TablesInsert<'reconciliations'> & { items: TablesInsert<'reconciliation_items'>[] }) => {
      const { data, error } = await supabase.from('reconciliations').insert(recon).select().single();
      if (error) throw error;
      if (items.length > 0) {
        const { error: itemErr } = await supabase.from('reconciliation_items').insert(
          items.map(i => ({ ...i, reconciliation_id: data.id }))
        );
        if (itemErr) throw itemErr;
      }
      await supabase.from('allocations').update({ status: 'reconciled' }).eq('id', recon.allocation_id);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reconciliations'] });
      qc.invalidateQueries({ queryKey: ['allocations'] });
    },
  });
}

// ===== PAYMENTS =====
export function usePayments(outletId?: string | null) {
  return useQuery({
    queryKey: ['payments', outletId],
    queryFn: async () => {
      let query = supabase.from('payments').select('*, vendors(name, vendor_code, mobile_money_number), outlets(name)').order('date', { ascending: false });
      if (outletId && outletId !== 'all') query = query.eq('outlet_id', outletId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useCreatePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payment: TablesInsert<'payments'>) => {
      const { data, error } = await supabase.from('payments').insert(payment).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payments'] }),
  });
}

// ===== COMMISSIONS =====
export function useCommissions(outletId?: string | null) {
  return useQuery({
    queryKey: ['commissions', outletId],
    queryFn: async () => {
      let query = supabase.from('commissions').select('*, vendors(name, vendor_code), outlets(name, short_code)').order('month', { ascending: false });
      if (outletId && outletId !== 'all') query = query.eq('outlet_id', outletId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

// ===== PAYOUTS =====
export function usePayouts() {
  return useQuery({
    queryKey: ['payouts'],
    queryFn: async () => {
      const { data, error } = await supabase.from('payouts').select('*, commissions(month, total_commission, vendors(name, vendor_code))').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreatePayout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payout: TablesInsert<'payouts'>) => {
      const { data, error } = await supabase.from('payouts').insert(payout).select().single();
      if (error) throw error;
      await supabase.from('commissions').update({ status: 'disbursed' }).eq('id', payout.commission_id);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payouts'] });
      qc.invalidateQueries({ queryKey: ['commissions'] });
    },
  });
}

// ===== SETTLEMENTS =====
export function useSettlements(outletId?: string | null) {
  return useQuery({
    queryKey: ['settlements', outletId],
    queryFn: async () => {
      let query = supabase.from('settlements').select('*, outlets(name), settlement_lines(*)').order('month', { ascending: false });
      if (outletId && outletId !== 'all') query = query.eq('outlet_id', outletId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

// ===== ORDERS =====
export function useOrders(outletId?: string | null) {
  return useQuery({
    queryKey: ['orders', outletId],
    queryFn: async () => {
      let query = supabase.from('orders').select('*, outlets(name), order_items(*, products(name, sku, category))').order('order_date', { ascending: false });
      if (outletId && outletId !== 'all') query = query.eq('outlet_id', outletId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ items, ...order }: TablesInsert<'orders'> & { items: { product_id: string; quantity: number; unit_price: number }[] }) => {
      const { data, error } = await supabase.from('orders').insert(order).select().single();
      if (error) throw error;
      if (items.length > 0) {
        const { error: itemErr } = await supabase.from('order_items').insert(
          items.map(i => ({ order_id: data.id, product_id: i.product_id, quantity: i.quantity, unit_price: i.unit_price }))
        );
        if (itemErr) throw itemErr;
      }
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  });
}

// ===== INBOUND DELIVERIES =====
export function useInboundDeliveries(outletId?: string | null) {
  return useQuery({
    queryKey: ['inbound_deliveries', outletId],
    queryFn: async () => {
      let query = supabase.from('inbound_deliveries').select('*, outlets(name), delivery_items(*, products(name, sku))').order('date', { ascending: false });
      if (outletId && outletId !== 'all') query = query.eq('outlet_id', outletId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateDelivery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Record<string, any>) => {
      const { data, error } = await supabase.from('inbound_deliveries').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inbound_deliveries'] }),
  });
}

// ===== STOCK LEVELS =====
export function useStockLevels(outletId?: string | null) {
  return useQuery({
    queryKey: ['stock_levels', outletId],
    queryFn: async () => {
      let query = supabase.from('stock_levels').select('*, products(name, sku, unit), outlets(name)');
      if (outletId && outletId !== 'all') query = query.eq('outlet_id', outletId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

// ===== NOTIFICATIONS =====
export function useNotifications(outletId?: string | null) {
  return useQuery({
    queryKey: ['notifications', outletId],
    queryFn: async () => {
      let query = supabase.from('notifications').select('*, outlets(name)').order('created_at', { ascending: false });
      if (outletId && outletId !== 'all') query = query.eq('outlet_id', outletId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Record<string, any>) => {
      const { data, error } = await supabase.from('notifications').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useDeleteNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('notifications').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

// ===== AUDIT LOGS =====
export function useAuditLogs() {
  return useQuery({
    queryKey: ['audit_logs'],
    queryFn: async () => {
      const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100);
      if (error) throw error;
      return data;
    },
  });
}

// ===== INCENTIVE PROGRAMS =====
export function useIncentivePrograms() {
  return useQuery({
    queryKey: ['incentive_programs'],
    queryFn: async () => {
      const { data, error } = await supabase.from('incentive_programs').select('*, vendor_incentives(*, vendors(name, vendor_code))').order('name');
      if (error) throw error;
      return data;
    },
  });
}

// ===== TRAINING =====
export function useTrainingModules() {
  return useQuery({
    queryKey: ['training_modules'],
    queryFn: async () => {
      const { data, error } = await supabase.from('training_modules').select('*, vendor_training_progress(*, vendors(name, vendor_code))').order('title');
      if (error) throw error;
      return data;
    },
  });
}

export function useVendorTrainingProgress() {
  return useQuery({
    queryKey: ['vendor_training_progress'],
    queryFn: async () => {
      const { data, error } = await supabase.from('vendor_training_progress').select('*, vendors(name, vendor_code), training_modules(title, category, mandatory)').order('created_at');
      if (error) throw error;
      return data;
    },
  });
}

// ===== FORECASTS =====
export function useForecasts(outletId?: string | null) {
  return useQuery({
    queryKey: ['forecasts', outletId],
    queryFn: async () => {
      let query = supabase.from('forecasts').select('*, products(name, sku, unit, unit_price, category), outlets(name)').order('days_until_stockout');
      if (outletId && outletId !== 'all') query = query.eq('outlet_id', outletId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

// ===== VENDORS WITH GPS =====
export function useVendorLocations() {
  return useQuery({
    queryKey: ['vendor_locations'],
    queryFn: async () => {
      const { data, error } = await supabase.from('vendors').select('id, name, vendor_code, territory, latitude, longitude, route_data, outlets(name)').not('latitude', 'is', null).not('longitude', 'is', null);
      if (error) throw error;
      return data;
    },
  });
}
