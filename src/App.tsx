import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/providers/theme-provider";
import { AuthProvider } from "@/providers/AuthProvider";
import { Layout } from "@/components/layout/layout";
import MerchantProtectedRoute from "@/components/MerchantProtectedRoute";

import { useAuth } from "@/hooks/useAuth";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { Toaster } from "sonner";
import ScrollToTop from "./components/ScrollToTop";
import Login from "./pages/login";
import ForgotPassword from "./pages/forgot-password";
import Profile from "./pages/profile";
import NotFound from "./pages/not-found";
import Dashboard from "./pages/dashboard";

// Inventory Management
import ProductsPage from "./pages/products";
import CreateProductPage from "./pages/products/create";
import BOMManagementPage from "./pages/products/bom";
import CategoriesPage from "./pages/categories";

// Sales & Customers
import CustomersPage from "./pages/customers";
import CreateCustomerPage from "./pages/customers/create";
import EditCustomerPage from "./pages/customers/edit";
import InvoicesPage from "./pages/invoices";
import InvoiceViewPage from "./pages/invoices/view";
import CreateInvoicePage from "./pages/invoices/create";
import CreditNotesPage from "./pages/invoices/credit-notes";
import CreateCreditNotePage from "./pages/invoices/credit-notes/create";
import CreditNoteViewPage from "./pages/invoices/credit-notes/view";
import DebitNotesPage from "./pages/invoices/debit-notes/index";
import CreateDebitNotePage from "./pages/invoices/debit-notes/create";
import RefundsPage from "./pages/invoices/refunds/index";
import CreateRefundPage from "./pages/invoices/refunds/create";
import QuickSalePage from "./pages/sales/quick";
import PaymentsPage from "./pages/payments";
import PaymentModesPage from "./pages/payment-modes";
import PaymentReceiptPage from './pages/payments/receipt';
import EditPaymentPage from './pages/payments/edit';

// Purchasing
import VendorsPage from "./pages/vendors";
import PurchaseOrdersPage from "./pages/purchase-orders";
import CreatePurchaseOrderPage from "./pages/purchase-orders/create";
import PurchaseOrderViewPage from "./pages/purchase-orders/view";

// Operations
import BranchesPage from "./pages/branches";
import CreateBranchPage from "./pages/branches/create";
import EditBranchPage from "./pages/branches/edit";
import ViewBranchPage from "./pages/branches/view";
import DevicesPage from "./pages/devices";
import DeviceEditPage from "./pages/devices/edit";
import FuelTransactionsPage from "./pages/fuel-transactions";
import KraAuditPage from "./pages/kra-audit";
import KraVerificationPage from "./pages/kra-verification";

// Reports
import SalesReportsPage from "./pages/reports/sales";
import StockReportsPage from "./pages/reports/inventory";
import FinancialReportsPage from "./pages/reports/financial";

// Staff
import StaffPage from "./pages/staff";

// Expenses Management
import ExpensesPage from "./pages/expenses";

// Subscription Management
import SubscriptionPage from "./pages/subscription";
import CreatePaymentPage from "./pages/subscription/create-payment";
import ViewPaymentPage from "./pages/subscription/view-payment";

// Create a new query client
const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect to login with the return url
      navigate('/login', { state: { redirectTo: location.pathname } });
    }
  }, [isAuthenticated, isLoading, navigate, location]);

  // Show nothing while checking authentication
  if (isLoading) return null;

  // If authenticated, show the children
  return isAuthenticated ? <>{children}</> : null;
};

const App = () => {
  return (
    <ThemeProvider defaultTheme="light">
      <BrowserRouter>
        <ScrollToTop />
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <TooltipProvider>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* Protected Routes with Layout */}
                <Route element={
                  <MerchantProtectedRoute>
                    <Layout />
                  </MerchantProtectedRoute>
                }>
                  <Route path="/dashboard" element={<Dashboard />} />

                  {/* Inventory Management */}
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/products/create" element={<CreateProductPage />} />
                  <Route path="/products/edit/:id" element={<CreateProductPage />} />
                  <Route path="/products/:productId/bom" element={<BOMManagementPage />} />
                  <Route path="/categories" element={<CategoriesPage />} />

                  {/* Sales & Customers */}
                  <Route path="/customers" element={<CustomersPage />} />
                  <Route path="/customers/create" element={<CreateCustomerPage />} />
                  <Route path="/customers/edit/:id" element={<EditCustomerPage />} />
                  <Route path="/invoices" element={<InvoicesPage />} />
                  <Route path="/invoices/view/:id" element={<InvoiceViewPage />} />
                  <Route path="/invoices/create" element={<CreateInvoicePage />} />
                  <Route path="/invoices/edit/:id" element={<CreateInvoicePage />} />
                  <Route path="/invoices/credit-notes" element={<CreditNotesPage />} />
                  <Route path="/invoices/credit-notes/create" element={<CreateCreditNotePage />} />
                  <Route path="/invoices/credit-notes/view/:id" element={<CreditNoteViewPage />} />
                  <Route path="/invoices/debit-notes" element={<DebitNotesPage />} />
                  <Route path="/invoices/debit-notes/create" element={<CreateDebitNotePage />} />
                  <Route path="/invoices/refunds" element={<RefundsPage />} />
                  <Route path="/invoices/refunds/create" element={<CreateRefundPage />} />
                  <Route path="/sales/quick" element={<QuickSalePage />} />
                  <Route path="/payments" element={<PaymentsPage />} />
                  <Route path="/payments/receipt/:id" element={<PaymentReceiptPage />} />
                  <Route path="/payments/edit/:id" element={<EditPaymentPage />} />
                  <Route path="/payment-modes" element={<PaymentModesPage />} />

                  {/* Purchasing */}
                  <Route path="/vendors" element={<VendorsPage />} />
                  <Route path="/purchase-orders" element={<PurchaseOrdersPage />} />
                  <Route path="/purchase-orders/create" element={<CreatePurchaseOrderPage />} />
                  <Route path="/purchase-orders/edit/:id" element={<CreatePurchaseOrderPage />} />
                  <Route path="/purchase-orders/view/:id" element={<PurchaseOrderViewPage />} />

                  {/* Operations */}
                  <Route path="/branches" element={<BranchesPage />} />
                  <Route path="/branches/create" element={<CreateBranchPage />} />
                  <Route path="/branches/:id/edit" element={<EditBranchPage />} />
                  <Route path="/branches/:id/view" element={<ViewBranchPage />} />
                  <Route path="/devices" element={<DevicesPage />} />
                  <Route path="/devices/:id/edit" element={<DeviceEditPage />} />
                  <Route path="/fuel-transactions" element={<FuelTransactionsPage />} />
                  <Route path="/kra-audit" element={<KraAuditPage />} />
                  <Route path="/kra-verification" element={<KraVerificationPage />} />

                  {/* Reports */}
                  <Route path="/reports/sales" element={<SalesReportsPage />} />
                  <Route path="/reports/inventory" element={<StockReportsPage />} />
                  <Route path="/reports/financial" element={<FinancialReportsPage />} />

                  {/* Staff */}
                  <Route path="/staff" element={<StaffPage />} />

                  {/* Expenses Management */}
                  <Route path="/expenses" element={<ExpensesPage />} />

                  {/* Subscription Management */}
                  <Route path="/subscription" element={<SubscriptionPage />} />
                  <Route path="/subscription/payments/create" element={<CreatePaymentPage />} />
                  <Route path="/subscription/payments/:id" element={<ViewPaymentPage />} />

                  <Route path="/profile" element={<Profile />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>

              <Toaster />
            </TooltipProvider>
          </AuthProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;