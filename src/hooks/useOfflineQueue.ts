import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const DB_NAME = 'okfarm_offline';
const STORE = 'queue';
const VERSION = 1;

export type QueueOp =
  | { kind: 'sale'; payload: any }
  | { kind: 'allocation'; payload: any };

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
    const { data, error } = await supabase.from('sales').insert(sale).select().single();
    if (error) throw error;
    if (items?.length) {
      const rows = items.map((i: any) => ({ ...i, sale_id: data.id }));
      const { error: e2 } = await supabase.from('sale_items').insert(rows);
      if (e2) throw e2;
    }
  } else if (op.kind === 'allocation') {
    const { items, ...alloc } = op.payload;
    const { data, error } = await supabase.from('allocations').insert(alloc).select().single();
    if (error) throw error;
    if (items?.length) {
      const rows = items.map((i: any) => ({ ...i, allocation_id: data.id }));
      const { error: e2 } = await supabase.from('allocation_items').insert(rows);
      if (e2) throw e2;
    }
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
    } catch (e: any) {
      item.attempts += 1;
      item.last_error = e?.message || String(e);
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
