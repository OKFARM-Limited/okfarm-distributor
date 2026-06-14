/**
 * Barrel re-export for all data hooks.
 *
 * The hooks have been split into domain-specific files under ./data/
 * for better maintainability. This file re-exports everything so
 * existing imports from '@/hooks/useSupabaseData' continue to work.
 */

export { type DbOutlet, useOutlets, useUpsertOutlet } from './data/useOutletData';
export { type DbProduct, useProducts, useUpsertProduct, useDeleteProduct } from './data/useProductData';
export {
  type DbVendor, useVendors, useVendor, useUpsertVendor,
  type DbAsset, useAssets, useUpdateAsset,
  type DbDepot, useDepots, useUpsertDepot,
  useVendorLocations,
} from './data/useVendorData';
export {
  useAllocations, useCreateAllocation,
  useSales, useCreateSale,
  useCheckIns, useCreateCheckIn, useUpdateCheckIn,
  useReconciliations, useCreateReconciliation,
} from './data/useSalesData';
export {
  usePayments, useCreatePayment,
  useCommissions,
  usePayouts, useCreatePayout,
  useSettlements, useCreateSettlement,
  useCalculateCommissions,
} from './data/useFinanceData';
export {
  useOrders, useCreateOrder, useUpdateOrder,
  useInboundDeliveries, useUpdateDelivery, useCreateDelivery,
  useStockLevels,
} from './data/useInventoryData';
export {
  useNotifications, useUpdateNotification, useDeleteNotification,
  useAuditLogs,
  useIncentivePrograms,
  useTrainingModules, useVendorTrainingProgress,
  useForecasts,
} from './data/useSystemData';
