import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

// ===== VENDORS =====
/** Base vendor row from the `vendors` table */
type VendorRow = Tables<'vendors'>;

/** Vendor row enriched with joined outlet info from .select('*, outlets(name, short_code)') */
export interface DbVendor extends VendorRow {
  outlets: { name: string; short_code: string } | null;
}

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
      return data as DbVendor[];
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
      return data as DbVendor;
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
/** Base asset row from the `assets` table */
type AssetRow = Tables<'assets'>;

/** Asset row enriched with joined vendor/outlet info */
export interface DbAsset extends AssetRow {
  vendors: { name: string; vendor_code: string } | null;
  outlets: { name: string; short_code: string } | null;
}

export function useAssets(outletId?: string | null) {
  return useQuery({
    queryKey: ['assets', outletId],
    queryFn: async () => {
      let query = supabase.from('assets').select('*, vendors(name, vendor_code), outlets(name, short_code)').order('asset_code');
      if (outletId && outletId !== 'all') query = query.eq('outlet_id', outletId);
      const { data, error } = await query;
      if (error) throw error;
      return data as DbAsset[];
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
/** Base depot row from the `depots` table */
type DepotRow = Tables<'depots'>;

/** Depot row enriched with joined outlet info */
export interface DbDepot extends DepotRow {
  outlets: { name: string; short_code: string } | null;
}

export function useDepots(outletId?: string | null) {
  return useQuery({
    queryKey: ['depots', outletId],
    queryFn: async () => {
      let query = supabase.from('depots').select('*, outlets(name, short_code)').order('name');
      if (outletId && outletId !== 'all') query = query.eq('outlet_id', outletId);
      const { data, error } = await query;
      if (error) throw error;
      return data as DbDepot[];
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

// ===== VENDOR LOCATIONS =====
/** Vendor location row — a projection of the vendors table with geo data */
export interface DbVendorLocation {
  id: string;
  name: string;
  vendor_code: string;
  territory: string | null;
  latitude: number | null;
  longitude: number | null;
  route_data: unknown;
  outlets: { name: string } | null;
}

export function useVendorLocations() {
  return useQuery({
    queryKey: ['vendor_locations'],
    queryFn: async () => {
      const { data, error } = await supabase.from('vendors').select('id, name, vendor_code, territory, latitude, longitude, route_data, outlets(name)').not('latitude', 'is', null).not('longitude', 'is', null);
      if (error) throw error;
      return data as DbVendorLocation[];
    },
  });
}
