import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { TablesInsert } from '@/integrations/supabase/types';

const DB_NAME = 'distribo_offline';
const STORE = 'queue';
const VERSION = 1;

export type QueueOp =
  | { kind: 'sale'; payload: TablesInsert<'sales'> & { items: { product_id: string; quantity: number; unit_price: number }[] } }
  | { kind: 'allocation'; payload: TablesInsert<'allocations'> & { items: { product_id: string; quantity: number; unit_price: number }[] } };

interface QueueItem {
  id?: number;
  op: QueueOp;
  created_at: number;
  attempts: number;
  last_error?: string;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest): Promise<T> {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const store = t.objectStore(STORE);
    const req = fn(store);
    req.onsuccess = () => resolve(req.result as T);
    req.onerror = () => reject(req.error);
  });
}

export async function enqueue(op: QueueOp) {
  const item: QueueItem = { op, created_at: Date.now(), attempts: 0 };
  await tx<number>('readwrite', s => s.add(item));
}

export async function listQueue(): Promise<QueueItem[]> {
  return tx<QueueItem[]>('readonly', s => s.getAll());
}

async function removeItem(id: number) {
  await tx('readwrite', s => s.delete(id));
}

async function updateItem(item: QueueItem) {
  await tx('readwrite', s => s.put(item));
}

async function executeOp(op: QueueOp): Promise<void> {
  if (op.kind === 'sale') {
    const { items, ...sale } = op.payload;
    const { error } = await supabase.rpc('create_sale_with_items', {
      p_vendor_id: sale.vendor_id,
      p_outlet_id: sale.outlet_id ?? null,
      p_date: sale.date || new Date().toISOString().split('T')[0],
      p_total_value: sale.total_value ?? 0,
      p_amount_paid: sale.amount_paid ?? 0,
      p_outstanding: sale.outstanding ?? 0,
      p_payment_method: sale.payment_method || 'cash',
      p_items: items || [],
    });
    if (error) throw error;
  } else if (op.kind === 'allocation') {
    const { items, ...alloc } = op.payload;
    const { error } = await supabase.rpc('create_allocation_with_items', {
      p_vendor_id: alloc.vendor_id,
      p_outlet_id: alloc.outlet_id ?? null,
      p_date: alloc.date || new Date().toISOString().split('T')[0],
      p_total_value: alloc.total_value ?? 0,
      p_status: alloc.status || 'pending',
      p_notes: alloc.notes ?? null,
      p_items: items || [],
    });
    if (error) throw error;
  }
}

export async function flushQueue(): Promise<{ ok: number; failed: number }> {
  const items = await listQueue();
  let ok = 0, failed = 0;
  for (const item of items) {
    try {
      await executeOp(item.op);
      await removeItem(item.id!);
      ok++;
    } catch (e: unknown) {
      item.attempts += 1;
      item.last_error = e instanceof Error ? e.message : String(e);
      await updateItem(item);
      failed++;
    }
  }
  return { ok, failed };
}

export function useOfflineQueue() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [pendingCount, setPendingCount] = useState(0);

  const refresh = useCallback(async () => {
    const items = await listQueue();
    setPendingCount(items.length);
  }, []);

  useEffect(() => {
    refresh();
    const onOnline = async () => {
      setIsOnline(true);
      const items = await listQueue();
      if (items.length === 0) return;
      toast({ title: 'Back online', description: `Syncing ${items.length} queued item(s)…` });
      const { ok, failed } = await flushQueue();
      await refresh();
      toast({
        title: 'Sync complete',
        description: `${ok} synced${failed ? `, ${failed} failed` : ''}.`,
        variant: failed ? 'destructive' : 'default',
      });
    };
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [refresh]);

  const queueOrExecute = useCallback(async (op: QueueOp): Promise<'queued' | 'sent'> => {
    if (!navigator.onLine) {
      await enqueue(op);
      await refresh();
      return 'queued';
    }
    try {
      await executeOp(op);
      return 'sent';
    } catch (e) {
      await enqueue(op);
      await refresh();
      return 'queued';
    }
  }, [refresh]);

  return { isOnline, pendingCount, refresh, queueOrExecute, flush: async () => { const r = await flushQueue(); await refresh(); return r; } };
}
