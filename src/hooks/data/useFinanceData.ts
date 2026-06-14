import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

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
      const { data, error } = await supabase.rpc('create_payout_with_status', {
        p_commission_id: payout.commission_id,
        p_vendor_id: payout.vendor_id,
        p_amount: payout.amount ?? 0,
        p_method: payout.method || 'mobile_money',
        p_reference: payout.reference ?? null,
      });
      if (error) throw error;
      return { id: data };
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

export function useCreateSettlement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ lines, ...settlement }: TablesInsert<'settlements'> & { lines: TablesInsert<'settlement_lines'>[] }) => {
      const { data, error } = await supabase.rpc('create_settlement_with_lines', {
        p_outlet_id: settlement.outlet_id ?? null,
        p_month: settlement.month,
        p_total_receivable: settlement.total_receivable ?? 0,
        p_total_paid: settlement.total_paid ?? 0,
        p_discount: settlement.discount ?? 0,
        p_discount_rate: settlement.discount_rate ?? 0,
        p_net_payable: settlement.net_payable ?? 0,
        p_status: settlement.status || 'open',
        p_notes: settlement.notes ?? null,
        p_lines: lines.map(l => ({
          invoice_number: l.invoice_number,
          date: l.date,
          amount: l.amount ?? 0,
          credit_days: l.credit_days ?? 30,
          due_date: l.due_date,
          amount_paid: l.amount_paid ?? 0,
          status: l.status || 'due',
        })),
      });
      if (error) throw error;
      return { id: data };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settlements'] }),
  });
}

// ===== CALCULATE COMMISSIONS RPC =====
export function useCalculateCommissions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ month, outletId }: { month: string; outletId?: string }) => {
      const { error } = await supabase.rpc('calculate_commissions', {
        p_month: month,
        p_outlet_id: outletId || null,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['commissions'] }),
  });
}
