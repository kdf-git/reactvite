import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Users,
    Package,
    ShoppingCart,
    DollarSign,
    TrendingUp,
    TrendingDown,
    Activity,
    AlertTriangle,
    Plus,
    Eye,
    BarChart3,
    PieChart,
    Calendar,
    Clock,
    ArrowUpRight,
    ArrowDownRight,
    Wallet,
    CreditCard,
    Building,
    Truck
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { useMerchantSettings, formatCurrency } from '@/hooks/useMerchantSettings';
import { CardAmount, CompactAmount } from '@/components/ui/amount-display';
import { SubscriptionStatusCard } from '@/components/subscription-status-card';
import {
    productsService,
    customersService,
    expensesService,
    invoicesService,
    financialReportsService,
    purchaseOrdersService
} from '@/services/sdk';

interface DashboardStats {
    // Financial metrics
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    revenueGrowth: number;

    // Business metrics
    totalProducts: number;
    lowStockProducts: number;
    totalCustomers: number;
    activeCustomers: number;

    // Transaction metrics
    totalInvoices: number;
    paidInvoices: number;
    pendingInvoices: number;
    overdueInvoices: number;

    // Inventory metrics
    totalStockValue: number;
    inventoryProducts: number; // Renamed from stockItems for clarity
    lowStockItems: number;

    // Purchase metrics
    totalPurchaseOrders: number;
    pendingPurchaseOrders: number;

    loading: boolean;
}

interface RecentActivity {
    id: string;
    type: 'sale' | 'purchase' | 'payment' | 'customer' | 'product';
    title: string;
    description: string;
    amount?: number;
    time: string;
    status?: string;
}

export default function Dashboard() {
    const { user } = useAuth();
    const merchantSettings = useMerchantSettings();

    const [stats, setStats] = useState<DashboardStats>({
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
        revenueGrowth: 0,
        totalProducts: 0,
        lowStockProducts: 0,
        totalCustomers: 0,
        activeCustomers: 0,
        totalInvoices: 0,
        paidInvoices: 0,
        pendingInvoices: 0,
        overdueInvoices: 0,
        totalStockValue: 0,
        inventoryProducts: 0,
        lowStockItems: 0,
        totalPurchaseOrders: 0,
        pendingPurchaseOrders: 0,
        loading: true,
    });

    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
    const [financialSummary, setFinancialSummary] = useState<any>(null);

    // Get merchantId from user context
    const getMerchantId = (): string | null => {
        if (user?.merchantId) {
            return user.merchantId;
        }
        if (user?.merchant?.id) {
            return user.merchant.id;
        }
        return null;
    };

    // Load dashboard data
    const loadDashboardData = async () => {
        try {
            const merchantId = getMerchantId();
            if (!merchantId) {
                console.error('Merchant ID not found');
                return;
            }

            setStats(prev => ({ ...prev, loading: true }));

            // Calculate date ranges for current and previous periods
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 30); // Last 30 days

            const [
                products,
                customers,
                expenses,
                invoices,
                purchaseOrders,
                financialData
            ] = await Promise.allSettled([
                productsService.productControllerFindAll(merchantId, '', ''),
                customersService.customerControllerFindAll(merchantId, undefined, ''),
                expensesService.expenseControllerFindAll(
                    merchantId,
                    undefined, // branchId
                    undefined, // categoryId
                    undefined, // vendorId
                    undefined, // status
                    undefined, // paymentStatus
                    startDate.toISOString(),
                    endDate.toISOString(),
                    undefined  // search
                ),
                invoicesService.invoiceControllerGetInvoices(),
                purchaseOrdersService.purchaseOrderControllerFindAll(),
                financialReportsService.financialReportsControllerGetFinancialSummary(
                    merchantId,
                    startDate.toISOString(),
                    endDate.toISOString(),
                    false
                )
            ]);

            // Process products data
            const productsData = products.status === 'fulfilled' ? products.value : [];
            const lowStockProducts = productsData.filter((product: any) =>
                product.reorderLevel && product.stockLevel <= product.reorderLevel
            );

            // Process customers data
            const customersData = customers.status === 'fulfilled' ? customers.value : [];
            const activeCustomers = customersData.filter((customer: any) => customer.isActive);

            // Process expenses data
            const expensesData = expenses.status === 'fulfilled' ? expenses.value : [];
            const totalExpenses = expensesData.reduce((sum: number, expense: any) =>
                sum + (expense.totalAmount || 0), 0
            );

            // Process invoices data
            const invoicesData = invoices.status === 'fulfilled' ? invoices.value : [];
            const paidInvoices = invoicesData.filter((invoice: any) => invoice.paymentStatus === 'PAID');
            const pendingInvoices = invoicesData.filter((invoice: any) =>
                invoice.paymentStatus === 'UNPAID' || invoice.paymentStatus === 'PARTIAL'
            );
            const overdueInvoices = invoicesData.filter((invoice: any) => {
                if (invoice.paymentStatus === 'PAID') return false;
                const dueDate = new Date(invoice.dueDate);
                return dueDate < new Date();
            });

            // Calculate total revenue from paid invoices
            const totalRevenue = paidInvoices.reduce((sum: number, invoice: any) => sum + (invoice.totalAmount || 0), 0);

            // Process inventory data from products (now that we use product-based inventory)
            const inventoryProducts = productsData.filter((product: any) => product.trackInventory);
            const lowStockItems = inventoryProducts.filter((product: any) =>
                product.reorderLevel && product.stockLevel <= product.reorderLevel
            );
            const totalStockValue = inventoryProducts.reduce((sum: number, product: any) =>
                sum + (product.stockLevel * product.costPrice), 0
            );

            // Process purchase orders data
            const purchaseOrdersData = purchaseOrders.status === 'fulfilled' ? purchaseOrders.value : [];
            const pendingPurchaseOrders = purchaseOrdersData.filter((po: any) =>
                po.status === 'PENDING_APPROVAL' || po.status === 'APPROVED'
            );

            // Process financial data
            const financialDataResult = financialData.status === 'fulfilled' ? financialData.value : null;
            setFinancialSummary(financialDataResult);

            // Calculate metrics
            const netProfit = totalRevenue - totalExpenses;
            const revenueGrowth = 0; // We'll calculate this properly later with historical data

            setStats({
                totalRevenue,
                totalExpenses,
                netProfit,
                revenueGrowth,
                totalProducts: productsData.length,
                lowStockProducts: lowStockProducts.length,
                totalCustomers: customersData.length,
                activeCustomers: activeCustomers.length,
                totalInvoices: invoicesData.length,
                paidInvoices: paidInvoices.length,
                pendingInvoices: pendingInvoices.length,
                overdueInvoices: overdueInvoices.length,
                totalStockValue,
                inventoryProducts: inventoryProducts.length,
                lowStockItems: lowStockItems.length,
                totalPurchaseOrders: purchaseOrdersData.length,
                pendingPurchaseOrders: pendingPurchaseOrders.length,
                loading: false,
            });

            // Generate recent activity
            const activities: RecentActivity[] = [];

            // Add recent invoices
            invoicesData.slice(0, 3).forEach((invoice: any) => {
                activities.push({
                    id: invoice.id,
                    type: 'sale',
                    title: `Invoice ${invoice.invoiceNumber}`,
                    description: `${invoice.customer?.name || 'Customer'}`,
                    amount: invoice.totalAmount,
                    time: new Date(invoice.createdAt).toLocaleDateString(),
                    status: invoice.paymentStatus
                });
            });

            // Add recent purchase orders
            purchaseOrdersData.slice(0, 2).forEach((po: any) => {
                activities.push({
                    id: po.id,
                    type: 'purchase',
                    title: `Purchase Order ${po.poNumber}`,
                    description: `${po.vendor?.name || 'Vendor'}`,
                    amount: po.totalAmount,
                    time: new Date(po.createdAt).toLocaleDateString(),
                    status: po.status
                });
            });

            setRecentActivity(activities.slice(0, 5));

        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            setStats(prev => ({ ...prev, loading: false }));
        }
    };

    useEffect(() => {
        if (user) {
            loadDashboardData();
        }
    }, [user]);

    // Overview cards configuration
    const overviewCards = [
        {
            title: 'Total Revenue',
            amount: stats.totalRevenue,
            description: `${stats.paidInvoices} paid invoices`,
            icon: DollarSign,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            trend: stats.revenueGrowth,
            link: '/invoices',
        },
        {
            title: 'Net Profit',
            amount: stats.netProfit,
            description: `Revenue - Expenses`,
            icon: TrendingUp,
            color: stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600',
            bgColor: stats.netProfit >= 0 ? 'bg-green-50' : 'bg-red-50',
            variant: stats.netProfit >= 0 ? 'green' : 'red',
            trend: stats.netProfit >= 0 ? 5.2 : -2.1,
            link: '/reports/financial',
        },
        {
            title: 'Total Products',
            value: stats.totalProducts,
            description: `${stats.lowStockProducts} low stock`,
            icon: Package,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            alert: stats.lowStockProducts > 0,
            link: '/products',
        },
        {
            title: 'Active Customers',
            value: stats.activeCustomers,
            description: `${stats.totalCustomers} total customers`,
            icon: Users,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            link: '/customers',
        },
    ];

    // Quick actions configuration
    const quickActions = [
        {
            title: 'Create Invoice',
            description: 'Generate new customer invoice',
            icon: CreditCard,
            link: '/invoices/create',
            color: 'bg-green-600',
        },
        {
            title: 'Add Product',
            description: 'Add new product to catalog',
            icon: Package,
            link: '/products/create',
            color: 'bg-blue-600',
        },
        {
            title: 'New Purchase Order',
            description: 'Create vendor purchase order',
            icon: Truck,
            link: '/purchase-orders/create',
            color: 'bg-orange-600',
        },
        {
            title: 'Manage Subscription',
            description: 'View subscription and payments',
            icon: CreditCard,
            link: '/subscription',
            color: 'bg-purple-600',
        },
        {
            title: 'Add Customer',
            description: 'Register new customer',
            icon: Users,
            link: '/customers',
            color: 'bg-purple-600',
        },
        {
            title: 'Record Expense',
            description: 'Log business expense',
            icon: Wallet,
            link: '/expenses',
            color: 'bg-red-600',
        },
        {
            title: 'View Reports',
            description: 'Financial and business reports',
            icon: BarChart3,
            link: '/reports/financial',
            color: 'bg-indigo-600',
        },
    ];

    // Show loading or error if user is not available
    if (!user) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-muted-foreground">Please log in to view dashboard</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Business Dashboard</h1>
                    <p className="text-muted-foreground">
                        Welcome back! Here's what's happening with your business today.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={loadDashboardData}>
                        <Activity className="mr-2 h-4 w-4" />
                        Refresh
                    </Button>
                    <Button asChild>
                        <Link to="/reports/financial">
                            <BarChart3 className="mr-2 h-4 w-4" />
                            View Reports
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {overviewCards.map((card, index) => {
                    const Icon = card.icon;
                    return (
                        <Card key={index} className="hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                                <div className={`p-2 rounded-full ${card.bgColor}`}>
                                    <Icon className={`h-4 w-4 ${card.color}`} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                {stats.loading ? (
                                    <div className="text-2xl font-bold">...</div>
                                ) : card.amount !== undefined ? (
                                    <CardAmount
                                        amount={card.amount}
                                        variant={card.variant as any}
                                    />
                                ) : (
                                    <div className="text-2xl font-bold">{card.value}</div>
                                )}
                                <div className="flex items-center justify-between mt-2">
                                    <p className="text-xs text-muted-foreground">{card.description}</p>
                                    {card.trend && (
                                        <div className={`flex items-center text-xs ${card.trend >= 0 ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {card.trend >= 0 ? (
                                                <ArrowUpRight className="h-3 w-3 mr-1" />
                                            ) : (
                                                <ArrowDownRight className="h-3 w-3 mr-1" />
                                            )}
                                            {Math.abs(card.trend)}%
                                        </div>
                                    )}
                                    {card.alert && (
                                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                                    )}
                                </div>
                                {card.link && (
                                    <Link to={card.link}>
                                        <Button variant="link" className="p-0 h-auto mt-2 text-xs">
                                            View details →
                                        </Button>
                                    </Link>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Business Metrics */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Sales & Inventory Overview */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Sales Overview</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Total Invoices</span>
                                    <span className="font-medium">{stats.totalInvoices}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Paid</span>
                                    <span className="font-medium text-green-600">{stats.paidInvoices}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Pending</span>
                                    <span className="font-medium text-orange-600">{stats.pendingInvoices}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Overdue</span>
                                    <span className="font-medium text-red-600">{stats.overdueInvoices}</span>
                                </div>
                                {stats.totalInvoices > 0 && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs">
                                            <span>Payment Rate</span>
                                            <span>{Math.round((stats.paidInvoices / stats.totalInvoices) * 100)}%</span>
                                        </div>
                                        <Progress
                                            value={(stats.paidInvoices / stats.totalInvoices) * 100}
                                            className="h-2"
                                        />
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Inventory Status</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Stock Items</span>
                                    <span className="font-medium">{stats.stockItems}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Low Stock</span>
                                    <span className="font-medium text-orange-600">{stats.lowStockItems}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Total Value</span>
                                    <CompactAmount amount={stats.totalStockValue} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Purchase Orders</span>
                                    <span className="font-medium">{stats.totalPurchaseOrders}</span>
                                </div>
                                {stats.stockItems > 0 && stats.lowStockItems > 0 && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs">
                                            <span>Stock Health</span>
                                            <span>{Math.round(((stats.stockItems - stats.lowStockItems) / stats.stockItems) * 100)}%</span>
                                        </div>
                                        <Progress
                                            value={((stats.stockItems - stats.lowStockItems) / stats.stockItems) * 100}
                                            className="h-2"
                                        />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>
                                Common business tasks and operations
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                {quickActions.map((action, index) => {
                                    const Icon = action.icon;
                                    return (
                                        <Link key={index} to={action.link}>
                                            <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                                                <div className={`p-2 rounded-full ${action.color} text-white`}>
                                                    <Icon className="h-4 w-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-medium truncate">{action.title}</h4>
                                                    <p className="text-xs text-muted-foreground truncate">{action.description}</p>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Subscription Status */}
                    <SubscriptionStatusCard />

                    {/* Recent Activity */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>
                                Latest business transactions and updates
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {stats.loading ? (
                                    <div className="text-center py-4">
                                        <p className="text-sm text-muted-foreground">Loading activity...</p>
                                    </div>
                                ) : recentActivity.length === 0 ? (
                                    <div className="text-center py-4">
                                        <p className="text-sm text-muted-foreground">No recent activity</p>
                                    </div>
                                ) : (
                                    recentActivity.map((activity) => (
                                        <div key={activity.id} className="flex items-center space-x-3">
                                            <div className="flex-shrink-0">
                                                {activity.type === 'sale' && (
                                                    <div className="p-2 rounded-full bg-green-50">
                                                        <CreditCard className="h-3 w-3 text-green-600" />
                                                    </div>
                                                )}
                                                {activity.type === 'purchase' && (
                                                    <div className="p-2 rounded-full bg-blue-50">
                                                        <Truck className="h-3 w-3 text-blue-600" />
                                                    </div>
                                                )}
                                                {activity.type === 'payment' && (
                                                    <div className="p-2 rounded-full bg-purple-50">
                                                        <Wallet className="h-3 w-3 text-purple-600" />
                                                    </div>
                                                )}
                                                {activity.type === 'customer' && (
                                                    <div className="p-2 rounded-full bg-orange-50">
                                                        <Users className="h-3 w-3 text-orange-600" />
                                                    </div>
                                                )}
                                                {activity.type === 'product' && (
                                                    <div className="p-2 rounded-full bg-indigo-50">
                                                        <Package className="h-3 w-3 text-indigo-600" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{activity.title}</p>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {activity.description}
                                                </p>
                                                {activity.amount && (
                                                    <div className="text-xs">
                                                        <CompactAmount
                                                            amount={activity.amount}
                                                            variant="green"
                                                            className="text-xs font-medium"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-shrink-0 text-right">
                                                <p className="text-xs text-muted-foreground">{activity.time}</p>
                                                {activity.status && (
                                                    <Badge
                                                        variant={activity.status === 'PAID' ? 'default' : 'outline'}
                                                        className="text-xs mt-1"
                                                    >
                                                        {activity.status}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="mt-4 pt-4 border-t">
                                <Link to="/reports/financial">
                                    <Button variant="outline" className="w-full">
                                        <Eye className="mr-2 h-4 w-4" />
                                        View All Activity
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Alerts and Notifications */}
            {(stats.lowStockProducts > 0 || stats.overdueInvoices > 0 || stats.pendingPurchaseOrders > 0) && (
                <Card className="border-orange-200 bg-orange-50/50">
                    <CardHeader>
                        <CardTitle className="flex items-center text-orange-800">
                            <AlertTriangle className="mr-2 h-5 w-5" />
                            Attention Required
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 md:grid-cols-3">
                            {stats.lowStockProducts > 0 && (
                                <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                                    <div>
                                        <p className="text-sm font-medium">Low Stock Alert</p>
                                        <p className="text-xs text-muted-foreground">
                                            {stats.lowStockProducts} products need restocking
                                        </p>
                                    </div>
                                    <Link to="/products?filter=lowStock">
                                        <Button size="sm" variant="outline">
                                            View
                                        </Button>
                                    </Link>
                                </div>
                            )}
                            {stats.overdueInvoices > 0 && (
                                <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                                    <div>
                                        <p className="text-sm font-medium">Overdue Payments</p>
                                        <p className="text-xs text-muted-foreground">
                                            {stats.overdueInvoices} invoices are overdue
                                        </p>
                                    </div>
                                    <Link to="/invoices?status=overdue">
                                        <Button size="sm" variant="outline">
                                            View
                                        </Button>
                                    </Link>
                                </div>
                            )}
                            {stats.pendingPurchaseOrders > 0 && (
                                <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                                    <div>
                                        <p className="text-sm font-medium">Pending Orders</p>
                                        <p className="text-xs text-muted-foreground">
                                            {stats.pendingPurchaseOrders} purchase orders pending
                                        </p>
                                    </div>
                                    <Link to="/purchase-orders?status=pending">
                                        <Button size="sm" variant="outline">
                                            View
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}