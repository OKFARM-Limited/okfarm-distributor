import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { OutletProvider } from "./contexts/OutletContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AppLayout } from "./components/layout/AppLayout";
import Login from "./pages/Login";
import PasswordRecovery from "./pages/PasswordRecovery";
import { Loader2 } from "lucide-react";

// Route-based code splitting — lazy-load all pages except Login (auth critical path)
const Dashboard = lazy(() => import("./pages/Dashboard"));
const VendorList = lazy(() => import("./pages/vendors/VendorList"));
const VendorDetail = lazy(() => import("./pages/vendors/VendorDetail"));
const VendorOnboarding = lazy(() => import("./pages/vendors/VendorOnboarding"));
const AssetManagement = lazy(() => import("./pages/assets/AssetManagement"));
const DailyAllocation = lazy(() => import("./pages/allocation/DailyAllocation"));
const Reconciliation = lazy(() => import("./pages/allocation/Reconciliation"));
const AllocationHistory = lazy(() => import("./pages/allocation/AllocationHistory"));
const SalesEntry = lazy(() => import("./pages/sales/SalesEntry"));
const PaymentTracking = lazy(() => import("./pages/sales/PaymentTracking"));
const PerformanceDashboard = lazy(() => import("./pages/performance/PerformanceDashboard"));
const VendorPerformance = lazy(() => import("./pages/performance/VendorPerformance"));
const CommissionCalculator = lazy(() => import("./pages/commissions/CommissionCalculator"));
const PayoutTracking = lazy(() => import("./pages/commissions/PayoutTracking"));
const OrderPlacement = lazy(() => import("./pages/orders/OrderPlacement"));
const VendorMap = lazy(() => import("./pages/map/VendorMap"));
const AuditTrail = lazy(() => import("./pages/audit/AuditTrail"));
const SettingsPage = lazy(() => import("./pages/settings/Settings"));
const NotFound = lazy(() => import("./pages/NotFound"));
const VendorCheckIn = lazy(() => import("./pages/checkin/VendorCheckIn"));
const InventoryInbound = lazy(() => import("./pages/inventory/InventoryInbound"));
const BarcodeScanner = lazy(() => import("./pages/inventory/BarcodeScanner"));
const DuesStatement = lazy(() => import("./pages/dues/DuesStatement"));
const MobileMoneyPayment = lazy(() => import("./pages/payments/MobileMoneyPayment"));
const NotificationCenter = lazy(() => import("./pages/notifications/NotificationCenter"));
const ForecastReorder = lazy(() => import("./pages/forecast/ForecastReorder"));
const MonthlySettlement = lazy(() => import("./pages/settlement/MonthlySettlement"));
const IncentivePrograms = lazy(() => import("./pages/incentives/IncentivePrograms"));
const FanAcademy = lazy(() => import("./pages/training/FanAcademy"));
const ProductManagement = lazy(() => import("./pages/products/ProductManagement"));
const DepotManagement = lazy(() => import("./pages/depots/DepotManagement"));
const OutletManagement = lazy(() => import("./pages/outlets/OutletManagement"));
const RoleManagement = lazy(() => import("./pages/admin/RoleManagement"));
const PermissionsMatrix = lazy(() => import("./pages/admin/PermissionsMatrix"));
const StockRecalc = lazy(() => import("./pages/admin/StockRecalc"));
const BulkImport = lazy(() => import("./pages/admin/BulkImport"));
const VendorPortal = lazy(() => import("./pages/vendor/VendorPortal"));
const NotificationPreferences = lazy(() => import("./pages/settings/NotificationPreferences"));
// Mobile Hub Pages
const MobileOperations = lazy(() => import("./pages/mobile/MobileOperations"));
const MobileInventory = lazy(() => import("./pages/mobile/MobileInventory"));
const MobileFinance = lazy(() => import("./pages/mobile/MobileFinance"));
const MobileAnalytics = lazy(() => import("./pages/mobile/MobileAnalytics"));
const MobilePrograms = lazy(() => import("./pages/mobile/MobilePrograms"));
const MobileAdmin = lazy(() => import("./pages/mobile/MobileAdmin"));

const LazyFallback = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (user?.role !== 'admin' && user?.role !== 'manager') return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AdminOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (user?.role !== 'admin') return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Suspense fallback={<LazyFallback />}>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/password-recovery" element={<PasswordRecovery />} />
      <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="vendors" element={<VendorList />} />
        <Route path="vendors/onboard" element={<VendorOnboarding />} />
        <Route path="vendors/:id" element={<VendorDetail />} />
        <Route path="assets" element={<AssetManagement />} />
        <Route path="allocation" element={<DailyAllocation />} />
        <Route path="reconciliation" element={<Reconciliation />} />
        <Route path="allocation/history" element={<AllocationHistory />} />
        <Route path="sales" element={<SalesEntry />} />
        <Route path="payments" element={<PaymentTracking />} />
        <Route path="mobile-money" element={<MobileMoneyPayment />} />
        <Route path="performance" element={<PerformanceDashboard />} />
        <Route path="performance/:vendorId" element={<VendorPerformance />} />
        <Route path="map" element={<VendorMap />} />
        <Route path="checkin" element={<VendorCheckIn />} />
        <Route path="inventory" element={<InventoryInbound />} />
        <Route path="scanner" element={<BarcodeScanner />} />
        <Route path="dues" element={<DuesStatement />} />
        <Route path="notifications" element={<NotificationCenter />} />
        <Route path="forecast" element={<AdminRoute><ForecastReorder /></AdminRoute>} />
        <Route path="commissions" element={<AdminRoute><CommissionCalculator /></AdminRoute>} />
        <Route path="payouts" element={<AdminRoute><PayoutTracking /></AdminRoute>} />
        <Route path="orders" element={<AdminRoute><OrderPlacement /></AdminRoute>} />
        <Route path="audit" element={<AdminOnlyRoute><AuditTrail /></AdminOnlyRoute>} />
        <Route path="settlement" element={<AdminRoute><MonthlySettlement /></AdminRoute>} />
        <Route path="outlets" element={<AdminRoute><OutletManagement /></AdminRoute>} />
        <Route path="incentives" element={<IncentivePrograms />} />
        <Route path="training" element={<FanAcademy />} />
        <Route path="depots" element={<AdminRoute><DepotManagement /></AdminRoute>} />
        <Route path="products" element={<AdminRoute><ProductManagement /></AdminRoute>} />
        <Route path="roles" element={<AdminOnlyRoute><RoleManagement /></AdminOnlyRoute>} />
        <Route path="permissions" element={<AdminOnlyRoute><PermissionsMatrix /></AdminOnlyRoute>} />
        <Route path="stock-recalc" element={<AdminOnlyRoute><StockRecalc /></AdminOnlyRoute>} />
        <Route path="bulk-import" element={<AdminOnlyRoute><BulkImport /></AdminOnlyRoute>} />
        <Route path="my-portal" element={<VendorPortal />} />
        <Route path="settings/notifications" element={<NotificationPreferences />} />
        <Route path="settings" element={<SettingsPage />} />
        {/* Mobile Hub Pages */}
        <Route path="mobile/operations" element={<MobileOperations />} />
        <Route path="mobile/inventory" element={<MobileInventory />} />
        <Route path="mobile/finance" element={<MobileFinance />} />
        <Route path="mobile/analytics" element={<MobileAnalytics />} />
        <Route path="mobile/programs" element={<MobilePrograms />} />
        <Route path="mobile/admin" element={<AdminRoute><MobileAdmin /></AdminRoute>} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
    </Suspense>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <OutletProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <ErrorBoundary>
                  <AppRoutes />
                </ErrorBoundary>
              </BrowserRouter>
            </TooltipProvider>
          </OutletProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
