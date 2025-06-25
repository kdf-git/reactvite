/**
 * Centralized exports for all API services from the React SDK
 */
import { secureApi, storeAuthTokens, clearAuthTokens, startTokenRefreshChecker, stopTokenRefreshChecker } from './api-interceptor';


// Export secure API services (with token refresh) for use throughout the application
export const authService = secureApi.auth;
export const usersService = secureApi.users;
export const stockService = secureApi.stock;
export const productsService = secureApi.products;
export const categoriesService = secureApi.categories;
export const customersService = secureApi.customers;
export const branchesService = secureApi.branches;
export const paymentModesService = secureApi.paymentModes;
export const vendorsService = secureApi.vendors;
export const devicesService = secureApi.devices;
export const purchaseOrdersService = secureApi.purchaseOrders;
export const staffService = secureApi.staff;
export const invoicesService = secureApi.invoices;
export const expensesService = secureApi.expenses;
export const expenseCategoriesService = secureApi.expenseCategories;

// Financial Reports and Accounts Services (now generated from SDK)
export const financialReportsService = secureApi.financialReports;
export const accountsService = secureApi.accounts;

// Admin services (needed for KRA data in product forms)
export const adminService = secureApi.admin;

// KRA VSCU services
export const kraVscuService = secureApi.kraVscu;

export const kraDataVerificationService = secureApi.kraDataVerification;

// Subscription services using the generated SDK
export const subscriptionService = {
    getMySubscription: () => secureApi.merchantSubscriptions.merchantSubscriptionControllerGetMySubscription(),
    getMyPayments: () => secureApi.merchantSubscriptions.merchantSubscriptionControllerGetMyPayments(),
    createPayment: (data: any) => secureApi.merchantSubscriptions.merchantSubscriptionControllerCreatePayment(data),
};

// Export token management functions
export { storeAuthTokens, clearAuthTokens, startTokenRefreshChecker, stopTokenRefreshChecker };


// Export both the regular API and secure API instances
export { secureApi };