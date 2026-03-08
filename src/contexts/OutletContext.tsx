import { createContext, useContext, useState, ReactNode } from 'react';
import { useOutlets, DbOutlet } from '@/hooks/useSupabaseData';

interface OutletContextType {
  selectedOutletId: string;
  setSelectedOutletId: (id: string) => void;
  selectedOutlet: DbOutlet | null;
  allOutlets: DbOutlet[];
  isAllOutlets: boolean;
  isLoading: boolean;
  getOutletName: (outletId: string | null) => string;
}

const OutletContext = createContext<OutletContextType | undefined>(undefined);

export function OutletProvider({ children }: { children: ReactNode }) {
  const [selectedOutletId, setSelectedOutletId] = useState('all');
  const { data: outlets = [], isLoading } = useOutlets();

  const selectedOutlet = selectedOutletId === 'all' ? null : outlets.find(o => o.id === selectedOutletId) || null;
  const isAllOutlets = selectedOutletId === 'all';

  const getOutletName = (outletId: string | null): string => {
    if (!outletId) return 'Unknown';
    const outlet = outlets.find(o => o.id === outletId);
    return outlet?.name || outletId;
  };

  return (
    <OutletContext.Provider value={{ selectedOutletId, setSelectedOutletId, selectedOutlet, allOutlets: outlets, isAllOutlets, isLoading, getOutletName }}>
      {children}
    </OutletContext.Provider>
  );
}

export function useOutletContext() {
  const ctx = useContext(OutletContext);
  if (!ctx) throw new Error('useOutletContext must be used within OutletProvider');
  return ctx;
}
