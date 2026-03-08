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
      if (outletId && outletId !== 'all') {
        query = query.eq('outlet_id', outletId);
      }
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
      if (outletId && outletId !== 'all') {
        query = query.eq('outlet_id', outletId);
      }
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
