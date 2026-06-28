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
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      let query = supabase.from('notifications').select('*, outlets(name)').order('created_at', { ascending: false });
      if (outletId && outletId !== 'all') query = query.eq('outlet_id', outletId);
      
      const [notifsResult, prefsResult] = await Promise.all([
        query,
        userId ? supabase.from('notification_preferences').select('*').eq('user_id', userId).maybeSingle() : Promise.resolve({ data: null, error: null })
      ]);

      if (notifsResult.error) throw notifsResult.error;
      if (prefsResult.error) throw prefsResult.error;

      let items = notifsResult.data as DbNotification[];
      const prefs = prefsResult.data;

      if (prefs) {
        if (!prefs.channel_in_app) return [];
        
        items = items.filter(n => {
          const t = n.type;
          if ((t === 'stock' || t === 'low_stock') && prefs.cat_stock === false) return false;
          if (t === 'payment' && prefs.cat_payment === false) return false;
          if (t === 'sales' && prefs.cat_sales === false) return false;
          if ((t === 'maintenance' || t === 'info' || t === 'system') && prefs.cat_system === false) return false;
          return true;
        });
      }

      return items;
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

// ===== NOTIFICATION PREFERENCES =====
export function useNotificationPreferences() {
  return useQuery({
    queryKey: ['notification_preferences'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data, error } = await supabase.from('notification_preferences').select('*').eq('user_id', user.id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useUpsertNotificationPreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (prefs: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase.from('notification_preferences').upsert({ user_id: user.id, ...prefs }, { onConflict: 'user_id' }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notification_preferences'] }),
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
