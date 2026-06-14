import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Fetches a single value from the app_settings table by key.
 * Returns the parsed JSON value, or the fallback if not found.
 */
export function useAppSetting<T>(key: string, fallback: T) {
  return useQuery({
    queryKey: ['app_settings', key],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', key)
        .maybeSingle();
      if (error) throw error;
      if (!data?.value) return fallback;
      try {
        return JSON.parse(data.value) as T;
      } catch {
        return data.value as unknown as T;
      }
    },
    staleTime: 5 * 60 * 1000, // cache for 5 minutes — these change rarely
  });
}
