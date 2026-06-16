import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

// ===== ORDERS =====
type OrderRow = Tables<'orders'>;

export interface DbOrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  created_at: string;
  products: { name: string; sku: string; category: string } | null;
}

export interface DbOrder extends OrderRow {
  outlets: { name: string } | null;
  order_items: DbOrderItem[];
}

export function useOrders(outletId?: string | null) {
  return useQuery({
    queryKey: ['orders', outletId],
    queryFn: async () => {
      let query = supabase.from('orders').select('*, outlets(name), order_items(*, products(name, sku, category))').order('order_date', { ascending: false });
      if (outletId && outletId !== 'all') query = query.eq('outlet_id', outletId);
      const { data, error } = await query;
      if (error) throw error;
      return data as DbOrder[];
    },
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ items, ...order }: TablesInsert<'orders'> & { items: { product_id: string; quantity: number; unit_price: number }[] }) => {
      const { data, error } = await supabase.rpc('create_order_with_items', {
        p_outlet_id: order.outlet_id ?? null,
        p_status: order.status || 'pending',
        p_order_date: order.order_date || new Date().toISOString().split('T')[0],
        p_expected_delivery: order.expected_delivery ?? null,
        p_total_value: order.total_value ?? 0,
        p_notes: order.notes ?? null,
        p_items: items,
      });
      if (error) throw error;
      return { id: data };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  });
}

export function useUpdateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<TablesUpdate<'orders'>>) => {
      const { data, error } = await supabase.from('orders').update(updates as TablesUpdate<'orders'>).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  });
}

// ===== INBOUND DELIVERIES =====
type DeliveryRow = Tables<'inbound_deliveries'>;

export interface DbDeliveryItem {
  id: string;
  delivery_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  created_at: string;
  products: { name: string; sku: string } | null;
}

export interface DbDelivery extends DeliveryRow {
  outlets: { name: string } | null;
  delivery_items: DbDeliveryItem[];
}

export function useInboundDeliveries(outletId?: string | null) {
  return useQuery({
    queryKey: ['inbound_deliveries', outletId],
    queryFn: async () => {
      let query = supabase.from('inbound_deliveries').select('*, outlets(name), delivery_items(*, products(name, sku))').order('date', { ascending: false });
      if (outletId && outletId !== 'all') query = query.eq('outlet_id', outletId);
      const { data, error } = await query;
      if (error) throw error;
      return data as DbDelivery[];
    },
  });
}

export function useUpdateDelivery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<TablesUpdate<'inbound_deliveries'>>) => {
      const { data, error } = await supabase.from('inbound_deliveries').update(updates as TablesUpdate<'inbound_deliveries'>).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inbound_deliveries'] }),
  });
}

export function useCreateDelivery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ delivery, items }: { delivery: TablesInsert<'inbound_deliveries'>; items: { product_id: string; quantity: number; unit_price: number }[] }) => {
      const { data, error } = await supabase.rpc('create_delivery_with_items', {
        p_outlet_id: delivery.outlet_id ?? null,
        p_invoice_number: delivery.invoice_number || '',
        p_supplier: delivery.supplier || 'FanMilk',
        p_date: delivery.date || new Date().toISOString().split('T')[0],
        p_due_date: delivery.due_date ?? null,
        p_credit_term_days: delivery.credit_term_days ?? 30,
        p_total_value: delivery.total_value ?? 0,
        p_status: delivery.status || 'pending',
        p_received_by: delivery.received_by ?? null,
        p_notes: delivery.notes ?? null,
        p_items: items,
      });
      if (error) throw error;
      return { id: data };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inbound_deliveries'] }),
  });
}

// ===== STOCK LEVELS =====
type StockLevelRow = Tables<'stock_levels'>;

export interface DbStockLevel extends StockLevelRow {
  products: { name: string; sku: string; unit: string } | null;
  outlets: { name: string } | null;
}

export function useStockLevels(outletId?: string | null) {
  return useQuery({
    queryKey: ['stock_levels', outletId],
    queryFn: async () => {
      let query = supabase.from('stock_levels').select('*, products(name, sku, unit), outlets(name)');
      if (outletId && outletId !== 'all') query = query.eq('outlet_id', outletId);
      const { data, error } = await query;
      if (error) throw error;
      return data as DbStockLevel[];
    },
  });
}
