import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

type TableName = 'sales' | 'allocations' | 'check_ins' | 'notifications' | 'payments' | 'stock_levels' | 'orders';

const tableQueryKeyMap: Record<TableName, string[]> = {
  sales: ['sales'],
  allocations: ['allocations'],
  check_ins: ['check_ins'],
  notifications: ['notifications'],
  payments: ['payments'],
  stock_levels: ['stock_levels'],
  orders: ['orders'],
};

export function useRealtimeSubscription(tables: TableName[]) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('realtime-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public' },
        (payload) => {
          const tableName = payload.table as TableName;
          const queryKeys = tableQueryKeyMap[tableName];
          if (queryKeys) {
            queryClient.invalidateQueries({ queryKey: queryKeys });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, tables.join(',')]);
}
