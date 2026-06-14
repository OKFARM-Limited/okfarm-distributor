import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { TablesInsert } from '@/integrations/supabase/types';

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
      const { data, error } = await supabase.rpc('create_allocation_with_items', {
        p_vendor_id: alloc.vendor_id,
        p_outlet_id: alloc.outlet_id ?? null,
        p_date: alloc.date || new Date().toISOString().split('T')[0],
        p_total_value: alloc.total_value ?? 0,
        p_status: alloc.status || 'pending',
        p_notes: alloc.notes ?? null,
        p_items: items,
      });
      if (error) throw error;
      return { id: data };
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
      const { data, error } = await supabase.rpc('create_sale_with_items', {
        p_vendor_id: sale.vendor_id,
        p_outlet_id: sale.outlet_id ?? null,
        p_date: sale.date || new Date().toISOString().split('T')[0],
        p_total_value: sale.total_value ?? 0,
        p_amount_paid: sale.amount_paid ?? 0,
        p_outstanding: sale.outstanding ?? 0,
        p_payment_method: sale.payment_method || 'cash',
        p_items: items,
      });
      if (error) throw error;
      return { id: data };
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
      const { data, error } = await supabase.rpc('create_reconciliation_with_items', {
        p_allocation_id: recon.allocation_id,
        p_vendor_id: recon.vendor_id,
        p_outlet_id: recon.outlet_id ?? null,
        p_date: recon.date || new Date().toISOString().split('T')[0],
        p_total_returned: recon.total_returned ?? 0,
        p_total_spoilage: recon.total_spoilage ?? 0,
        p_total_sold: recon.total_sold ?? 0,
        p_cash_collected: recon.cash_collected ?? 0,
        p_status: recon.status || 'pending',
        p_notes: recon.notes ?? null,
        p_items: items.map(i => ({
          product_id: i.product_id,
          allocated_qty: i.allocated_qty ?? 0,
          returned_qty: i.returned_qty ?? 0,
          spoilage_qty: i.spoilage_qty ?? 0,
          sold_qty: i.sold_qty ?? 0,
          unit_price: i.unit_price ?? 0,
        })),
      });
      if (error) throw error;
      return { id: data };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reconciliations'] });
      qc.invalidateQueries({ queryKey: ['allocations'] });
    },
  });
}
