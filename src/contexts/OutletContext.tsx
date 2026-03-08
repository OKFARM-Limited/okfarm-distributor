import { createContext, useContext, useState, ReactNode } from 'react';

export interface Outlet {
  id: string;
  name: string;
  shortCode: string;
  address: string;
  manager: string;
  phone: string;
  status: 'active' | 'inactive';
  description: string;
}

export const outlets: Outlet[] = [
  { id: 'sangotedo', name: 'Sangotedo (Main)', shortCode: 'SGT', address: '15 Lekki-Epe Expressway, Sangotedo, Lagos', manager: 'Ngozi Okafor', phone: '+2348012345678', status: 'active', description: 'Main office and distribution hub' },
  { id: 'abraham-adesanya', name: 'Abraham Adesanya', shortCode: 'ABA', address: '22 Abraham Adesanya Rd, Ajah, Lagos', manager: 'Emeka Chukwu', phone: '+2348023456789', status: 'active', description: 'Ajah corridor outlet' },
  { id: 'epe', name: 'Epe', shortCode: 'EPE', address: '8 Epe Marina, Epe, Lagos', manager: 'Funke Adeyemi', phone: '+2348034567890', status: 'active', description: 'Epe region coverage' },
  { id: 'ogombo', name: 'Ogombo', shortCode: 'OGM', address: '3 Ogombo Road, Lekki, Lagos', manager: 'Tunde Balogun', phone: '+2348045678901', status: 'active', description: 'Ogombo and environs' },
  { id: 'eleko', name: 'Eleko', shortCode: 'ELK', address: '12 Eleko Beach Road, Ibeju-Lekki, Lagos', manager: 'Halima Danjuma', phone: '+2348056789012', status: 'active', description: 'Ibeju-Lekki corridor' },
];

interface OutletContextType {
  selectedOutletId: string;
  setSelectedOutletId: (id: string) => void;
  selectedOutlet: Outlet | null;
  allOutlets: Outlet[];
  isAllOutlets: boolean;
}

const OutletContext = createContext<OutletContextType | undefined>(undefined);

export function OutletProvider({ children }: { children: ReactNode }) {
  const [selectedOutletId, setSelectedOutletId] = useState('sangotedo');

  const selectedOutlet = selectedOutletId === 'all' ? null : outlets.find(o => o.id === selectedOutletId) || null;
  const isAllOutlets = selectedOutletId === 'all';

  return (
    <OutletContext.Provider value={{ selectedOutletId, setSelectedOutletId, selectedOutlet, allOutlets: outlets, isAllOutlets }}>
      {children}
    </OutletContext.Provider>
  );
}

export function useOutletContext() {
  const ctx = useContext(OutletContext);
  if (!ctx) throw new Error('useOutletContext must be used within OutletProvider');
  return ctx;
}
