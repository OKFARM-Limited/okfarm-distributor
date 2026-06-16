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
  type DbVendorLocation, useVendorLocations,
} from './data/useVendorData';
export {
  type DbAllocation, type DbAllocationItem, useAllocations, useCreateAllocation,
  type DbSale, type DbSaleItem, useSales, useCreateSale,
  type DbCheckIn, useCheckIns, useCreateCheckIn, useUpdateCheckIn,
  type DbReconciliation, type DbReconciliationItem, useReconciliations, useCreateReconciliation,
} from './data/useSalesData';
export {
  type DbPayment, usePayments, useCreatePayment,
  type DbCommission, useCommissions,
  type DbPayout, usePayouts, useCreatePayout,
  type DbSettlement, useSettlements, useCreateSettlement,
  useCalculateCommissions,
} from './data/useFinanceData';
export {
  type DbOrder, type DbOrderItem, useOrders, useCreateOrder, useUpdateOrder,
  type DbDelivery, type DbDeliveryItem, useInboundDeliveries, useUpdateDelivery, useCreateDelivery,
  type DbStockLevel, useStockLevels,
} from './data/useInventoryData';
export {
  type DbNotification, useNotifications, useUpdateNotification, useDeleteNotification,
  type DbAuditLog, useAuditLogs,
  type DbIncentiveProgram, type DbVendorIncentive, useIncentivePrograms,
  type DbTrainingModule, type DbVendorTrainingProgress, useTrainingModules, useVendorTrainingProgress,
  type DbForecast, useForecasts,
} from './data/useSystemData';
