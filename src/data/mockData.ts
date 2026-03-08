// ===== OUTLET IDS =====
const outletIds = ['sangotedo', 'abraham-adesanya', 'epe', 'ogombo', 'eleko'];
const outletNames: Record<string, string> = {
  'sangotedo': 'Sangotedo (Main)',
  'abraham-adesanya': 'Abraham Adesanya',
  'epe': 'Epe',
  'ogombo': 'Ogombo',
  'eleko': 'Eleko',
};

// ===== VENDORS =====
export interface Vendor {
  id: string;
  name: string;
  phone: string;
  photo: string;
  territory: string;
  outletId: string;
  biometricsEnabled: boolean;
  status: 'active' | 'inactive' | 'suspended';
  joinDate: string;
  totalSales: number;
  daysWorked: number;
  assignedAssets: string[];
  email: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  nationalId: string;
  address: string;
  nextOfKin: string;
  nextOfKinPhone: string;
  bankName: string;
  bankAccount: string;
  guarantorName: string;
  guarantorPhone: string;
  mobileMoneyNumber: string;
  educationLevel: string;
  maritalStatus: string;
  languages: string[];
  uniformSize: string;
  healthStatus: string;
  notes: string;
}

const territories = ['Ikeja', 'Lekki', 'Victoria Island', 'Surulere', 'Yaba', 'Mushin', 'Oshodi', 'Ikorodu', 'Ajah', 'Festac'];
const firstNames = ['Adebayo', 'Chidinma', 'Emeka', 'Funke', 'Gbenga', 'Halima', 'Ibrahim', 'Jumoke', 'Kelechi', 'Lateef', 'Maryam', 'Ngozi', 'Oluwaseun', 'Precious', 'Rasheed', 'Sade', 'Tunde', 'Uchenna', 'Victor', 'Wale', 'Yetunde', 'Zainab', 'Aisha', 'Bola', 'Chidi', 'Damilola', 'Eze', 'Fatima', 'Grace', 'Hassan'];
const lastNames = ['Okafor', 'Adeyemi', 'Balogun', 'Chukwu', 'Danjuma', 'Eze', 'Fashola', 'Gbenga', 'Hussaini', 'Igwe', 'Johnson', 'Kalu', 'Lawal', 'Mohammed', 'Nwosu', 'Obi', 'Peters', 'Quadri', 'Raji', 'Salami', 'Thomas', 'Uche', 'Vincent', 'Williams', 'Yakubu', 'Zubair', 'Abubakar', 'Bakare', 'Collins', 'Dele'];
const banks = ['GTBank', 'First Bank', 'UBA', 'Access Bank', 'Zenith Bank'];
const eduLevels = ['Primary', 'Secondary', 'OND', 'HND', 'BSc', 'None'];

// Distribute vendors: 10 in Sangotedo, 5-6 in others
const vendorOutletAssignment = (i: number): string => {
  if (i < 10) return 'sangotedo';
  if (i < 15) return 'abraham-adesanya';
  if (i < 20) return 'epe';
  if (i < 25) return 'ogombo';
  return 'eleko';
};

export const vendors: Vendor[] = Array.from({ length: 30 }, (_, i) => ({
  id: `VND-${String(i + 1).padStart(3, '0')}`,
  name: `${firstNames[i]} ${lastNames[i]}`,
  phone: `+234${String(8010000000 + Math.floor(Math.random() * 89999999))}`,
  photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstNames[i]}${lastNames[i]}`,
  territory: territories[i % territories.length],
  outletId: vendorOutletAssignment(i),
  biometricsEnabled: Math.random() > 0.3,
  status: i < 25 ? 'active' : i < 28 ? 'inactive' : 'suspended',
  joinDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
  totalSales: Math.floor(Math.random() * 500000) + 50000,
  daysWorked: Math.floor(Math.random() * 25) + 5,
  assignedAssets: [],
  email: `${firstNames[i].toLowerCase()}.${lastNames[i].toLowerCase()}@email.com`,
  dateOfBirth: `19${85 + Math.floor(Math.random() * 15)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
  gender: i % 3 === 0 ? 'female' : 'male',
  nationalId: `NIN-${String(Math.floor(Math.random() * 90000000000) + 10000000000)}`,
  address: `${Math.floor(Math.random() * 200) + 1} ${['Broad St', 'Allen Ave', 'Awolowo Rd', 'Adeola Odeku St', 'Herbert Macaulay Way'][i % 5]}, Lagos`,
  nextOfKin: `${lastNames[(i + 5) % 30]} ${firstNames[(i + 3) % 30]}`,
  nextOfKinPhone: `+234${String(8010000000 + Math.floor(Math.random() * 89999999))}`,
  bankName: banks[i % banks.length],
  bankAccount: String(Math.floor(Math.random() * 9000000000) + 1000000000),
  guarantorName: `${firstNames[(i + 7) % 30]} ${lastNames[(i + 2) % 30]}`,
  guarantorPhone: `+234${String(8010000000 + Math.floor(Math.random() * 89999999))}`,
  mobileMoneyNumber: `+234${String(8010000000 + Math.floor(Math.random() * 89999999))}`,
  educationLevel: eduLevels[i % eduLevels.length],
  maritalStatus: i % 3 === 0 ? 'Married' : i % 3 === 1 ? 'Single' : 'Divorced',
  languages: i % 2 === 0 ? ['English', 'Yoruba'] : ['English', 'Igbo'],
  uniformSize: ['S', 'M', 'L', 'XL'][i % 4],
  healthStatus: i % 10 === 0 ? 'Requires glasses' : 'Fit',
  notes: '',
}));

// ===== ASSETS =====
export interface MaintenanceRecord {
  id: string;
  date: string;
  type: 'routine' | 'repair' | 'inspection';
  description: string;
  cost: number;
  performedBy: string;
}

export interface ConditionHistory {
  date: string;
  condition: 'good' | 'fair' | 'poor';
  note: string;
}

export interface Asset {
  id: string;
  type: 'push_cart' | 'bicycle' | 'tricycle';
  name: string;
  status: 'available' | 'assigned' | 'maintenance';
  assignedTo: string | null;
  outletId: string;
  condition: 'good' | 'fair' | 'poor';
  nextMaintenanceDate: string;
  maintenanceHistory: MaintenanceRecord[];
  conditionHistory: ConditionHistory[];
}

const generateMaintenanceHistory = (assetId: string, condition: string): MaintenanceRecord[] => {
  const types: MaintenanceRecord['type'][] = ['routine', 'repair', 'inspection'];
  const count = condition === 'poor' ? 4 : condition === 'fair' ? 2 : 1;
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (i + 1) * 15);
    return {
      id: `MNT-${assetId}-${i + 1}`,
      date: d.toISOString().split('T')[0],
      type: types[i % 3],
      description: i === 0 ? 'Wheel alignment and lubrication' : i === 1 ? 'Brake pad replacement' : i === 2 ? 'Frame welding repair' : 'General inspection',
      cost: Math.floor(Math.random() * 5000) + 1000,
      performedBy: 'Depot Technician',
    };
  });
};

const generateConditionHistory = (condition: string): ConditionHistory[] => {
  const conditions: Array<'good' | 'fair' | 'poor'> = condition === 'poor' ? ['good', 'fair', 'poor'] : condition === 'fair' ? ['good', 'fair'] : ['good'];
  return conditions.map((c, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (conditions.length - 1 - i) * 2);
    return { date: d.toISOString().split('T')[0], condition: c, note: c === 'good' ? 'Asset in excellent working condition' : c === 'fair' ? 'Minor wear observed, scheduled for maintenance' : 'Significant damage, requires immediate repair' };
  });
};

const getNextMaintenanceDate = (condition: string): string => {
  const d = new Date();
  d.setDate(d.getDate() + (condition === 'poor' ? 3 : condition === 'fair' ? 14 : 30));
  return d.toISOString().split('T')[0];
};

// Assign assets across outlets: 3 per outlet
const assetOutletAssignment = (i: number): string => outletIds[i % outletIds.length];

const rawAssets: Omit<Asset, 'nextMaintenanceDate' | 'maintenanceHistory' | 'conditionHistory'>[] = [
  { id: 'AST-001', type: 'push_cart', name: 'Push Cart Alpha', status: 'assigned', assignedTo: 'VND-001', outletId: 'sangotedo', condition: 'good' },
  { id: 'AST-002', type: 'push_cart', name: 'Push Cart Beta', status: 'assigned', assignedTo: 'VND-002', outletId: 'sangotedo', condition: 'good' },
  { id: 'AST-003', type: 'push_cart', name: 'Push Cart Gamma', status: 'available', assignedTo: null, outletId: 'sangotedo', condition: 'fair' },
  { id: 'AST-004', type: 'bicycle', name: 'Bike Delta', status: 'assigned', assignedTo: 'VND-003', outletId: 'sangotedo', condition: 'good' },
  { id: 'AST-005', type: 'bicycle', name: 'Bike Epsilon', status: 'assigned', assignedTo: 'VND-011', outletId: 'abraham-adesanya', condition: 'good' },
  { id: 'AST-006', type: 'push_cart', name: 'Push Cart Zeta', status: 'maintenance', assignedTo: null, outletId: 'abraham-adesanya', condition: 'poor' },
  { id: 'AST-007', type: 'tricycle', name: 'Trike Eta', status: 'assigned', assignedTo: 'VND-012', outletId: 'abraham-adesanya', condition: 'good' },
  { id: 'AST-008', type: 'push_cart', name: 'Push Cart Theta', status: 'available', assignedTo: null, outletId: 'epe', condition: 'good' },
  { id: 'AST-009', type: 'bicycle', name: 'Bike Iota', status: 'assigned', assignedTo: 'VND-016', outletId: 'epe', condition: 'fair' },
  { id: 'AST-010', type: 'push_cart', name: 'Push Cart Kappa', status: 'assigned', assignedTo: 'VND-017', outletId: 'epe', condition: 'good' },
  { id: 'AST-011', type: 'tricycle', name: 'Trike Lambda', status: 'available', assignedTo: null, outletId: 'ogombo', condition: 'good' },
  { id: 'AST-012', type: 'bicycle', name: 'Bike Mu', status: 'maintenance', assignedTo: null, outletId: 'ogombo', condition: 'poor' },
  { id: 'AST-013', type: 'push_cart', name: 'Push Cart Nu', status: 'assigned', assignedTo: 'VND-021', outletId: 'ogombo', condition: 'good' },
  { id: 'AST-014', type: 'push_cart', name: 'Push Cart Xi', status: 'assigned', assignedTo: 'VND-026', outletId: 'eleko', condition: 'fair' },
  { id: 'AST-015', type: 'bicycle', name: 'Bike Omicron', status: 'available', assignedTo: null, outletId: 'eleko', condition: 'good' },
];

export const assets: Asset[] = rawAssets.map(a => ({
  ...a,
  nextMaintenanceDate: getNextMaintenanceDate(a.condition),
  maintenanceHistory: generateMaintenanceHistory(a.id, a.condition),
  conditionHistory: generateConditionHistory(a.condition),
}));

// Vendor check-in attendance data
export interface CheckInRecord {
  vendorId: string;
  date: string;
  checkInTime: string;
  checkOutTime: string | null;
}

export const checkInRecords: CheckInRecord[] = [];
for (let d = 0; d < 30; d++) {
  const date = new Date(); date.setDate(date.getDate() - d);
  const dateStr = date.toISOString().split('T')[0];
  vendors.forEach(v => {
    if (v.status === 'active' && Math.random() > 0.2) {
      checkInRecords.push({
        vendorId: v.id,
        date: dateStr,
        checkInTime: `0${6 + Math.floor(Math.random() * 3)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
        checkOutTime: d === 0 && Math.random() > 0.5 ? null : `1${6 + Math.floor(Math.random() * 3)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      });
    }
  });
}

// Link assets to vendors
vendors.forEach(v => {
  v.assignedAssets = assets.filter(a => a.assignedTo === v.id).map(a => a.id);
});

// ===== PRODUCTS / SKUs =====
export interface Product {
  id: string;
  name: string;
  category: string;
  unitPrice: number;
  unit: string;
  barcode: string;
}

export const products: Product[] = [
  { id: 'SKU-001', name: 'FanYogo Strawberry', category: 'Yoghurt', unitPrice: 150, unit: 'pack', barcode: '5901234123457' },
  { id: 'SKU-002', name: 'FanYogo Vanilla', category: 'Yoghurt', unitPrice: 150, unit: 'pack', barcode: '5901234123464' },
  { id: 'SKU-003', name: 'FanIce Chocolate', category: 'Ice Cream', unitPrice: 200, unit: 'pack', barcode: '5901234123471' },
  { id: 'SKU-004', name: 'FanIce Vanilla', category: 'Ice Cream', unitPrice: 200, unit: 'pack', barcode: '5901234123488' },
  { id: 'SKU-005', name: 'FanDango Cone', category: 'Cone', unitPrice: 300, unit: 'piece', barcode: '5901234123495' },
  { id: 'SKU-006', name: 'Super Yogo 500ml', category: 'Yoghurt', unitPrice: 350, unit: 'bottle', barcode: '5901234123501' },
  { id: 'SKU-007', name: 'GoSlo Popsicle', category: 'Popsicle', unitPrice: 100, unit: 'piece', barcode: '5901234123518' },
  { id: 'SKU-008', name: 'FanChoc Bar', category: 'Bar', unitPrice: 250, unit: 'piece', barcode: '5901234123525' },
  { id: 'SKU-009', name: 'FanMilk Sachet', category: 'Milk', unitPrice: 100, unit: 'sachet', barcode: '5901234123532' },
  { id: 'SKU-010', name: 'FanVita Juice', category: 'Juice', unitPrice: 200, unit: 'pack', barcode: '5901234123549' },
];

// ===== INVENTORY INBOUND =====
export interface InboundDelivery {
  id: string;
  date: string;
  invoiceNumber: string;
  items: { productId: string; productName: string; quantity: number; unitPrice: number }[];
  totalValue: number;
  status: 'pending' | 'received' | 'verified';
  creditTermDays: number;
  dueDate: string;
  receivedBy: string;
  outletId: string;
}

export const inboundDeliveries: InboundDelivery[] = Array.from({ length: 15 }, (_, i) => {
  const d = new Date(); d.setDate(d.getDate() - i * 2);
  const items = products.slice(0, Math.floor(Math.random() * 6) + 4).map(p => ({
    productId: p.id,
    productName: p.name,
    quantity: Math.floor(Math.random() * 200) + 50,
    unitPrice: p.unitPrice,
  }));
  const total = items.reduce((s, it) => s + it.quantity * it.unitPrice, 0);
  const due = new Date(d); due.setDate(due.getDate() + 30);
  return {
    id: `INB-${String(i + 1).padStart(3, '0')}`,
    date: d.toISOString().split('T')[0],
    invoiceNumber: `FM-INV-${String(2024000 + i)}`,
    items,
    totalValue: total,
    status: i < 2 ? 'pending' : i < 5 ? 'received' : 'verified',
    creditTermDays: 30,
    dueDate: due.toISOString().split('T')[0],
    receivedBy: i < 2 ? '' : 'Depot Manager',
    outletId: outletIds[i % outletIds.length],
  };
});

// Depot stock levels
export interface StockLevel {
  productId: string;
  productName: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  lastRestocked: string;
  outletId: string;
}

export const stockLevels: StockLevel[] = outletIds.flatMap(outletId =>
  products.map(p => ({
    productId: p.id,
    productName: p.name,
    currentStock: Math.floor(Math.random() * 300) + 20,
    minStock: 50,
    maxStock: 500,
    lastRestocked: new Date(Date.now() - Math.floor(Math.random() * 5) * 86400000).toISOString().split('T')[0],
    outletId,
  }))
);

// ===== NOTIFICATIONS =====
export interface AppNotification {
  id: string;
  type: 'low_stock' | 'expiry' | 'pending_return' | 'attendance' | 'payment' | 'maintenance';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
  actionUrl?: string;
  outletId: string;
}

export const notifications: AppNotification[] = [
  { id: 'NTF-001', type: 'low_stock', title: 'Low Stock Alert', message: 'FanYogo Strawberry is below minimum stock (15 packs remaining)', timestamp: new Date().toISOString(), read: false, priority: 'high', actionUrl: '/inventory', outletId: 'sangotedo' },
  { id: 'NTF-002', type: 'expiry', title: 'Product Expiry Warning', message: 'GoSlo Popsicle batch #B045 expires in 2 days', timestamp: new Date(Date.now() - 3600000).toISOString(), read: false, priority: 'high', outletId: 'epe' },
  { id: 'NTF-003', type: 'pending_return', title: 'Pending Returns', message: '5 vendors have not returned stock from yesterday', timestamp: new Date(Date.now() - 7200000).toISOString(), read: false, priority: 'medium', actionUrl: '/reconciliation', outletId: 'sangotedo' },
  { id: 'NTF-004', type: 'attendance', title: 'Absent Vendors', message: '3 vendors in Abraham Adesanya have not checked in today', timestamp: new Date(Date.now() - 10800000).toISOString(), read: false, priority: 'medium', actionUrl: '/checkin', outletId: 'abraham-adesanya' },
  { id: 'NTF-005', type: 'payment', title: 'Outstanding Payment', message: 'VND-003 has ₦45,000 outstanding for 5+ days', timestamp: new Date(Date.now() - 14400000).toISOString(), read: true, priority: 'high', actionUrl: '/payments', outletId: 'sangotedo' },
  { id: 'NTF-006', type: 'maintenance', title: 'Maintenance Due', message: 'Push Cart Zeta is overdue for maintenance', timestamp: new Date(Date.now() - 18000000).toISOString(), read: true, priority: 'medium', actionUrl: '/assets', outletId: 'abraham-adesanya' },
  { id: 'NTF-007', type: 'low_stock', title: 'Low Stock Alert', message: 'FanMilk Sachet below minimum stock in Epe (30 sachets remaining)', timestamp: new Date(Date.now() - 21600000).toISOString(), read: true, priority: 'medium', outletId: 'epe' },
  { id: 'NTF-008', type: 'attendance', title: 'Late Check-In', message: 'VND-022 in Ogombo checked in 2 hours late today', timestamp: new Date(Date.now() - 25200000).toISOString(), read: true, priority: 'low', outletId: 'ogombo' },
];

// ===== ALLOCATIONS =====
export interface Allocation {
  id: string;
  date: string;
  vendorId: string;
  vendorName: string;
  outletId: string;
  items: { productId: string; productName: string; quantity: number; unitPrice: number }[];
  totalValue: number;
  status: 'pending' | 'confirmed' | 'reconciled';
}

export const generateAllocations = (): Allocation[] => {
  const allocs: Allocation[] = [];
  for (let d = 0; d < 30; d++) {
    const date = new Date();
    date.setDate(date.getDate() - d);
    const dateStr = date.toISOString().split('T')[0];
    const vendorCount = Math.floor(Math.random() * 8) + 5;
    for (let v = 0; v < vendorCount; v++) {
      const vendor = vendors[v % vendors.length];
      const items = products.slice(0, Math.floor(Math.random() * 5) + 3).map(p => ({
        productId: p.id,
        productName: p.name,
        quantity: Math.floor(Math.random() * 50) + 10,
        unitPrice: p.unitPrice,
      }));
      allocs.push({
        id: `ALC-${dateStr}-${vendor.id}`,
        date: dateStr,
        vendorId: vendor.id,
        vendorName: vendor.name,
        outletId: vendor.outletId,
        items,
        totalValue: items.reduce((s, i) => s + i.quantity * i.unitPrice, 0),
        status: d === 0 ? 'confirmed' : 'reconciled',
      });
    }
  }
  return allocs;
};

export const allocations = generateAllocations();

// ===== SALES =====
export interface SaleRecord {
  id: string;
  date: string;
  vendorId: string;
  vendorName: string;
  outletId: string;
  items: { productId: string; productName: string; qtySold: number; unitPrice: number }[];
  totalValue: number;
  paymentMethod: 'cash' | 'mobile_money' | 'mixed';
  amountPaid: number;
  outstanding: number;
}

export const generateSales = (): SaleRecord[] => {
  const sales: SaleRecord[] = [];
  for (let d = 0; d < 30; d++) {
    const date = new Date();
    date.setDate(date.getDate() - d);
    const dateStr = date.toISOString().split('T')[0];
    for (let v = 0; v < Math.min(20, vendors.length); v++) {
      const vendor = vendors[v];
      const items = products.slice(0, Math.floor(Math.random() * 6) + 2).map(p => ({
        productId: p.id,
        productName: p.name,
        qtySold: Math.floor(Math.random() * 40) + 5,
        unitPrice: p.unitPrice,
      }));
      const totalValue = items.reduce((s, i) => s + i.qtySold * i.unitPrice, 0);
      const amountPaid = Math.random() > 0.2 ? totalValue : Math.floor(totalValue * 0.7);
      sales.push({
        id: `SLE-${dateStr}-${vendor.id}`,
        date: dateStr,
        vendorId: vendor.id,
        vendorName: vendor.name,
        outletId: vendor.outletId,
        items,
        totalValue,
        paymentMethod: Math.random() > 0.5 ? 'cash' : Math.random() > 0.5 ? 'mobile_money' : 'mixed',
        amountPaid,
        outstanding: totalValue - amountPaid,
      });
    }
  }
  return sales;
};

export const salesRecords = generateSales();

// ===== COMMISSIONS =====
export interface Commission {
  id: string;
  vendorId: string;
  vendorName: string;
  outletId: string;
  month: string;
  totalSales: number;
  daysWorked: number;
  daysActive: number;
  avgDailySales: number;
  consistencyRate: number;
  consistencyMultiplier: number;
  volumeBonus: number;
  consistencyBonus: number;
  attendanceBonus: number;
  totalCommission: number;
  status: 'pending' | 'disbursed';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export const commissions: Commission[] = vendors.slice(0, 20).map((v, i) => {
  const totalSales = Math.floor(Math.random() * 400000) + 80000;
  const daysWorked = Math.floor(Math.random() * 22) + 8;
  const daysActive = Math.floor(daysWorked * (0.7 + Math.random() * 0.3));
  const avgDailySales = Math.round(totalSales / Math.max(daysWorked, 1));
  const consistencyRate = Math.round((daysActive / 26) * 100);
  const consistencyMultiplier = consistencyRate >= 85 ? 1.5 : consistencyRate >= 70 ? 1.25 : consistencyRate >= 50 ? 1.0 : 0.75;
  const volumeBonus = Math.floor(totalSales * 0.03);
  const consistencyBonus = daysWorked >= 20 ? 5000 : daysWorked >= 15 ? 3000 : 0;
  const attendanceBonus = daysActive >= 22 ? 3000 : daysActive >= 18 ? 1500 : 0;
  const tier: Commission['tier'] = totalSales >= 350000 ? 'platinum' : totalSales >= 250000 ? 'gold' : totalSales >= 150000 ? 'silver' : 'bronze';
  return {
    id: `COM-${String(i + 1).padStart(3, '0')}`,
    vendorId: v.id,
    vendorName: v.name,
    outletId: v.outletId,
    month: '2026-02',
    totalSales,
    daysWorked,
    daysActive,
    avgDailySales,
    consistencyRate,
    consistencyMultiplier,
    volumeBonus,
    consistencyBonus,
    attendanceBonus,
    totalCommission: Math.round((volumeBonus + consistencyBonus + attendanceBonus) * consistencyMultiplier),
    status: i < 12 ? 'disbursed' as const : 'pending' as const,
    tier,
  };
});

// ===== AUDIT LOG =====
export interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
}

export const auditLog: AuditEntry[] = [
  { id: 'AUD-001', timestamp: '2026-03-05T08:30:00', user: 'admin@okfarm.com', action: 'Login', details: 'Admin logged in' },
  { id: 'AUD-002', timestamp: '2026-03-05T08:35:00', user: 'admin@okfarm.com', action: 'Allocation', details: 'Morning allocation for VND-001' },
  { id: 'AUD-003', timestamp: '2026-03-05T09:00:00', user: 'assistant@okfarm.com', action: 'Login', details: 'Assistant logged in' },
  { id: 'AUD-004', timestamp: '2026-03-04T17:30:00', user: 'admin@okfarm.com', action: 'Reconciliation', details: 'Evening reconciliation completed' },
  { id: 'AUD-005', timestamp: '2026-03-04T14:00:00', user: 'admin@okfarm.com', action: 'Vendor Update', details: 'Updated vendor VND-005 territory' },
  { id: 'AUD-006', timestamp: '2026-03-04T10:00:00', user: 'assistant@okfarm.com', action: 'Sales Entry', details: 'Recorded sales for 15 vendors' },
  { id: 'AUD-007', timestamp: '2026-03-03T16:00:00', user: 'admin@okfarm.com', action: 'Commission', details: 'Processed February commissions' },
  { id: 'AUD-008', timestamp: '2026-03-03T09:00:00', user: 'admin@okfarm.com', action: 'Asset Assignment', details: 'Assigned AST-003 to VND-010' },
  { id: 'AUD-009', timestamp: '2026-03-02T11:00:00', user: 'admin@okfarm.com', action: 'Order', details: 'Placed depot order #ORD-045' },
  { id: 'AUD-010', timestamp: '2026-03-02T08:00:00', user: 'assistant@okfarm.com', action: 'Login', details: 'Assistant logged in' },
];

// ===== VENDOR MAP COORDINATES (Lagos area) =====
export interface VendorLocation {
  vendorId: string;
  vendorName: string;
  lat: number;
  lng: number;
  territory: string;
  outletId: string;
  route?: { lat: number; lng: number }[];
}

export const vendorLocations: VendorLocation[] = vendors.slice(0, 20).map((v, i) => {
  const baseLat = 6.45 + (Math.random() * 0.15);
  const baseLng = 3.35 + (Math.random() * 0.2);
  const routePoints = Array.from({ length: 6 }, (_, j) => ({
    lat: baseLat + (Math.random() - 0.5) * 0.02 * (j + 1),
    lng: baseLng + (Math.random() - 0.5) * 0.02 * (j + 1),
  }));
  return {
    vendorId: v.id,
    vendorName: v.name,
    lat: baseLat,
    lng: baseLng,
    territory: v.territory,
    outletId: v.outletId,
    route: [{ lat: baseLat, lng: baseLng }, ...routePoints],
  };
});

// ===== DAILY METRICS (per outlet) =====
export interface DailyMetric {
  date: string;
  outletId: string;
  totalSales: number;
  vendorsActive: number;
  cashCollected: number;
  mobileMoneyCollected: number;
}

export const dailyMetrics: DailyMetric[] = outletIds.flatMap(outletId =>
  Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const scale = outletId === 'sangotedo' ? 1 : 0.5 + Math.random() * 0.3;
    return {
      date: date.toISOString().split('T')[0],
      outletId,
      totalSales: Math.floor((Math.random() * 300000 + 150000) * scale),
      vendorsActive: Math.floor((Math.random() * 10 + 18) * scale),
      cashCollected: Math.floor((Math.random() * 250000 + 100000) * scale),
      mobileMoneyCollected: Math.floor((Math.random() * 80000 + 20000) * scale),
    };
  })
);

// ===== MOBILE MONEY PROVIDERS =====
export interface MobileMoneyProvider {
  id: string;
  name: string;
  code: string;
  logo: string;
}

export const mobileMoneyProviders: MobileMoneyProvider[] = [
  { id: 'momo-1', name: 'OPay', code: 'OPAY', logo: '💳' },
  { id: 'momo-2', name: 'PalmPay', code: 'PALMPAY', logo: '📱' },
  { id: 'momo-3', name: 'Paga', code: 'PAGA', logo: '💰' },
  { id: 'momo-4', name: 'Kuda', code: 'KUDA', logo: '🏦' },
  { id: 'momo-5', name: 'Moniepoint', code: 'MONIEPOINT', logo: '🔵' },
];

// ===== HELPER: Get outlet name =====
export const getOutletName = (outletId: string): string => outletNames[outletId] || outletId;
