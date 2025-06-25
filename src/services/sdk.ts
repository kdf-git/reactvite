/**
 * Centralized exports for all API services from the React SDK
 */
import { secureApi, storeAuthTokens, clearAuthTokens, startTokenRefreshChecker, stopTokenRefreshChecker } from './api-interceptor';

// Export all services from the SDK
export {
  AccountsService,
  AdminService,
  AdminSubscriptionPaymentsService,
  AppService,
  AuthService,
  BranchesService,
  CategoriesService,
  CustomersService,
  DevicesService,
  ExpenseCategoriesService,
  ExpensesService,
  FinancialReportsService,
  FuelTransactionsService,
  HealthService,
  InvoicesService,
  KraDataVerificationService,
  KraVscuService,
  MerchantsService,
  MerchantSubscriptionsService,
  PaymentModesService,
  ProductsService,
  PurchaseOrdersService,
  StaffService,
  StockService,
  StorageService,
  UsersService,
  VendorsService
} from '@/lib/sdk';

// Export secure API services (with token refresh) for use throughout the application
export const authService = secureApi.auth;

// Export token management functions
export { storeAuthTokens, clearAuthTokens, startTokenRefreshChecker, stopTokenRefreshChecker };

// Export both the regular API and secure API instances
export { secureApi };