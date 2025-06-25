/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseHttpRequest } from './core/BaseHttpRequest';
import type { OpenAPIConfig } from './core/OpenAPI';
import { AxiosHttpRequest } from './core/AxiosHttpRequest';
import { AccountsService } from './services/AccountsService';
import { AdminService } from './services/AdminService';
import { AdminSubscriptionPaymentsService } from './services/AdminSubscriptionPaymentsService';
import { AppService } from './services/AppService';
import { AuthService } from './services/AuthService';
import { BranchesService } from './services/BranchesService';
import { CategoriesService } from './services/CategoriesService';
import { CustomersService } from './services/CustomersService';
import { DevicesService } from './services/DevicesService';
import { ExpenseCategoriesService } from './services/ExpenseCategoriesService';
import { ExpensesService } from './services/ExpensesService';
import { FinancialReportsService } from './services/FinancialReportsService';
import { FuelTransactionsService } from './services/FuelTransactionsService';
import { HealthService } from './services/HealthService';
import { InvoicesService } from './services/InvoicesService';
import { KraDataVerificationService } from './services/KraDataVerificationService';
import { KraVscuService } from './services/KraVscuService';
import { MerchantsService } from './services/MerchantsService';
import { MerchantSubscriptionsService } from './services/MerchantSubscriptionsService';
import { PaymentModesService } from './services/PaymentModesService';
import { ProductsService } from './services/ProductsService';
import { PurchaseOrdersService } from './services/PurchaseOrdersService';
import { StaffService } from './services/StaffService';
import { StockService } from './services/StockService';
import { StorageService } from './services/StorageService';
import { UsersService } from './services/UsersService';
import { VendorsService } from './services/VendorsService';
type HttpRequestConstructor = new (config: OpenAPIConfig) => BaseHttpRequest;
export class TracksolApi {
    public readonly accounts: AccountsService;
    public readonly admin: AdminService;
    public readonly adminSubscriptionPayments: AdminSubscriptionPaymentsService;
    public readonly app: AppService;
    public readonly auth: AuthService;
    public readonly branches: BranchesService;
    public readonly categories: CategoriesService;
    public readonly customers: CustomersService;
    public readonly devices: DevicesService;
    public readonly expenseCategories: ExpenseCategoriesService;
    public readonly expenses: ExpensesService;
    public readonly financialReports: FinancialReportsService;
    public readonly fuelTransactions: FuelTransactionsService;
    public readonly health: HealthService;
    public readonly invoices: InvoicesService;
    public readonly kraDataVerification: KraDataVerificationService;
    public readonly kraVscu: KraVscuService;
    public readonly merchants: MerchantsService;
    public readonly merchantSubscriptions: MerchantSubscriptionsService;
    public readonly paymentModes: PaymentModesService;
    public readonly products: ProductsService;
    public readonly purchaseOrders: PurchaseOrdersService;
    public readonly staff: StaffService;
    public readonly stock: StockService;
    public readonly storage: StorageService;
    public readonly users: UsersService;
    public readonly vendors: VendorsService;
    public readonly request: BaseHttpRequest;
    constructor(config?: Partial<OpenAPIConfig>, HttpRequest: HttpRequestConstructor = AxiosHttpRequest) {
        this.request = new HttpRequest({
            BASE: config?.BASE ?? 'https://kenyafuel.tracksolconnect.com',
            VERSION: config?.VERSION ?? '1.0',
            WITH_CREDENTIALS: config?.WITH_CREDENTIALS ?? false,
            CREDENTIALS: config?.CREDENTIALS ?? 'include',
            TOKEN: config?.TOKEN,
            USERNAME: config?.USERNAME,
            PASSWORD: config?.PASSWORD,
            HEADERS: config?.HEADERS,
            ENCODE_PATH: config?.ENCODE_PATH,
        });
        this.accounts = new AccountsService(this.request);
        this.admin = new AdminService(this.request);
        this.adminSubscriptionPayments = new AdminSubscriptionPaymentsService(this.request);
        this.app = new AppService(this.request);
        this.auth = new AuthService(this.request);
        this.branches = new BranchesService(this.request);
        this.categories = new CategoriesService(this.request);
        this.customers = new CustomersService(this.request);
        this.devices = new DevicesService(this.request);
        this.expenseCategories = new ExpenseCategoriesService(this.request);
        this.expenses = new ExpensesService(this.request);
        this.financialReports = new FinancialReportsService(this.request);
        this.fuelTransactions = new FuelTransactionsService(this.request);
        this.health = new HealthService(this.request);
        this.invoices = new InvoicesService(this.request);
        this.kraDataVerification = new KraDataVerificationService(this.request);
        this.kraVscu = new KraVscuService(this.request);
        this.merchants = new MerchantsService(this.request);
        this.merchantSubscriptions = new MerchantSubscriptionsService(this.request);
        this.paymentModes = new PaymentModesService(this.request);
        this.products = new ProductsService(this.request);
        this.purchaseOrders = new PurchaseOrdersService(this.request);
        this.staff = new StaffService(this.request);
        this.stock = new StockService(this.request);
        this.storage = new StorageService(this.request);
        this.users = new UsersService(this.request);
        this.vendors = new VendorsService(this.request);
    }
}

