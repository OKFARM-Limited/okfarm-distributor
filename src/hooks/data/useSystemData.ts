import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesUpdate } from '@/integrations/supabase/types';

// ===== NOTIFICATIONS =====
type NotificationRow = Tables<'notifications'>;

export interface DbNotification extends NotificationRow {
  outlets: { name: string } | null;
}

export function useNotifications(outletId?: string | null) {
  return useQuery({
    queryKey: ['notifications', outletId],
    queryFn: async () => {
      let query = supabase.from('notifications').select('*, outlets(name)').order('created_at', { ascending: false });
      if (outletId && outletId !== 'all') query = query.eq('outlet_id', outletId);
      const { data, error } = await query;
      if (error) throw error;
      return data as DbNotification[];
    },
  });
}

export function useUpdateNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<TablesUpdate<'notifications'>>) => {
      const { data, error } = await supabase.from('notifications').update(updates as TablesUpdate<'notifications'>).eq('id', id).select().single();
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
export type DbAuditLog = Tables<'audit_logs'>;

export function useAuditLogs() {
  return useQuery({
    queryKey: ['audit_logs'],
    queryFn: async () => {
      const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100);
      if (error) throw error;
      return data as DbAuditLog[];
    },
  });
}

// ===== INCENTIVE PROGRAMS =====
type IncentiveProgramRow = Tables<'incentive_programs'>;

export interface DbVendorIncentive {
  id: string;
  program_id: string;
  vendor_id: string;
  status: string;
  progress: number | null;
  created_at: string;
  vendors: { name: string; vendor_code: string } | null;
}

export interface DbIncentiveProgram extends IncentiveProgramRow {
  vendor_incentives: DbVendorIncentive[];
}

export function useIncentivePrograms() {
  return useQuery({
    queryKey: ['incentive_programs'],
    queryFn: async () => {
      const { data, error } = await supabase.from('incentive_programs').select('*, vendor_incentives(*, vendors(name, vendor_code))').order('name');
      if (error) throw error;
      return data as DbIncentiveProgram[];
    },
  });
}

// ===== TRAINING =====
type TrainingModuleRow = Tables<'training_modules'>;

export interface DbVendorTrainingProgressItem {
  id: string;
  module_id: string;
  vendor_id: string;
  status: string;
  score: number | null;
  completed_at: string | null;
  created_at: string;
  vendors: { name: string; vendor_code: string } | null;
}

export interface DbTrainingModule extends TrainingModuleRow {
  vendor_training_progress: DbVendorTrainingProgressItem[];
}

type VendorTrainingProgressRow = Tables<'vendor_training_progress'>;

export interface DbVendorTrainingProgress extends VendorTrainingProgressRow {
  vendors: { name: string; vendor_code: string } | null;
  training_modules: { title: string; category: string; mandatory: boolean } | null;
}

export function useTrainingModules() {
  return useQuery({
    queryKey: ['training_modules'],
    queryFn: async () => {
      const { data, error } = await supabase.from('training_modules').select('*, vendor_training_progress(*, vendors(name, vendor_code))').order('title');
      if (error) throw error;
      return data as DbTrainingModule[];
    },
  });
}

export function useVendorTrainingProgress() {
  return useQuery({
    queryKey: ['vendor_training_progress'],
    queryFn: async () => {
      const { data, error } = await supabase.from('vendor_training_progress').select('*, vendors(name, vendor_code), training_modules(title, category, mandatory)').order('created_at');
      if (error) throw error;
      return data as DbVendorTrainingProgress[];
    },
  });
}

// ===== FORECASTS =====
type ForecastRow = Tables<'forecasts'>;

export interface DbForecast extends ForecastRow {
  products: { name: string; sku: string; unit: string; unit_price: number; category: string } | null;
  outlets: { name: string } | null;
}

export function useForecasts(outletId?: string | null) {
  return useQuery({
    queryKey: ['forecasts', outletId],
    queryFn: async () => {
      let query = supabase.from('forecasts').select('*, products(name, sku, unit, unit_price, category), outlets(name)').order('days_until_stockout');
      if (outletId && outletId !== 'all') query = query.eq('outlet_id', outletId);
      const { data, error } = await query;
      if (error) throw error;
      return data as DbForecast[];
    },
  });
}
