import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AppLayout } from "./components/layout/AppLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import VendorList from "./pages/vendors/VendorList";
import VendorDetail from "./pages/vendors/VendorDetail";
import VendorOnboarding from "./pages/vendors/VendorOnboarding";
import AssetManagement from "./pages/assets/AssetManagement";
import DailyAllocation from "./pages/allocation/DailyAllocation";
import Reconciliation from "./pages/allocation/Reconciliation";
import AllocationHistory from "./pages/allocation/AllocationHistory";
import SalesEntry from "./pages/sales/SalesEntry";
import PaymentTracking from "./pages/sales/PaymentTracking";
import PerformanceDashboard from "./pages/performance/PerformanceDashboard";
import VendorPerformance from "./pages/performance/VendorPerformance";
import CommissionCalculator from "./pages/commissions/CommissionCalculator";
import PayoutTracking from "./pages/commissions/PayoutTracking";
import OrderPlacement from "./pages/orders/OrderPlacement";
import VendorMap from "./pages/map/VendorMap";
import AuditTrail from "./pages/audit/AuditTrail";
import SettingsPage from "./pages/settings/Settings";
import NotFound from "./pages/NotFound";
import VendorCheckIn from "./pages/checkin/VendorCheckIn";
import InventoryInbound from "./pages/inventory/InventoryInbound";
import BarcodeScanner from "./pages/inventory/BarcodeScanner";
import DuesStatement from "./pages/dues/DuesStatement";
import MobileMoneyPayment from "./pages/payments/MobileMoneyPayment";
import NotificationCenter from "./pages/notifications/NotificationCenter";
import ForecastReorder from "./pages/forecast/ForecastReorder";
import MonthlySettlement from "./pages/settlement/MonthlySettlement";
import IncentivePrograms from "./pages/incentives/IncentivePrograms";
import FanAcademy from "./pages/training/FanAcademy";
import DepotManagement from "./pages/depots/DepotManagement";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (user?.role !== 'admin') return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
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
        <Route path="checkin" element={<VendorCheckIn />} />
        <Route path="inventory" element={<InventoryInbound />} />
        <Route path="scanner" element={<BarcodeScanner />} />
        <Route path="dues" element={<DuesStatement />} />
        <Route path="notifications" element={<NotificationCenter />} />
        <Route path="forecast" element={<AdminRoute><ForecastReorder /></AdminRoute>} />
        <Route path="commissions" element={<AdminRoute><CommissionCalculator /></AdminRoute>} />
        <Route path="payouts" element={<AdminRoute><PayoutTracking /></AdminRoute>} />
        <Route path="orders" element={<AdminRoute><OrderPlacement /></AdminRoute>} />
        <Route path="audit" element={<AdminRoute><AuditTrail /></AdminRoute>} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
