import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

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
