import { useState, useEffect } from 'react';
import { Calendar, Download, Filter, Search, Package, TrendingUp, TrendingDown, RotateCcw, AlertTriangle, FileText, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useMerchantSettings, formatCurrency } from '@/hooks/useMerchantSettings';
import { CardAmount } from '@/components/ui/amount-display';
import { stockService, branchesService, productsService } from '@/services/sdk';
import type {
    BranchResponseDto,
    ProductResponseDto,
    StockAdjustmentReasonResponseDto
} from '@/lib/sdk';
import { addDays, format } from 'date-fns';
import { DateRange } from 'react-day-picker';

// Stock Movement Types
const MOVEMENT_TYPES = {
    PURCHASE: 'Purchase',
    SALE: 'Sale',
    ADJUSTMENT: 'Adjustment',
    TRANSFER_IN: 'Transfer In',
    TRANSFER_OUT: 'Transfer Out',
    INITIAL: 'Initial Stock',
    DAMAGE: 'Damage',
    EXPIRY: 'Expiry',
    THEFT: 'Theft',
    CORRECTION: 'Correction'
};

const REFERENCE_TYPES = {
    INVOICE: 'Invoice',
    PURCHASE_ORDER: 'Purchase Order',
    ADJUSTMENT: 'Adjustment',
    TRANSFER: 'Transfer',
    MANUAL: 'Manual Entry'
};

// Stock Movement Interface (updated for product-based system)
interface StockMovement {
    id: string;
    merchantId: string;
    branchId: string;
    productId: string; // Updated from stockItemId to productId
    movementType: string;
    referenceType?: string;
    referenceId?: string;
    quantity: number;
    balanceAfter: number;
    unitCost?: number;
    notes?: string;
    createdBy?: string;
    createdAt: string;
    branch?: {
        id: string;
        name: string;
        code: string;
    };
    product?: { // Updated from stockItem to product
        id: string;
        name: string;
        code: string; // Updated from stockCode to code
        unitOfMeasure?: {
            id: string;
            code: string;
            name: string;
            symbol: string;
        };
    };
}

interface StockMovementReportsState {
    movements: StockMovement[];
    products: ProductResponseDto[]; // Updated from stockItems to products
    branches: BranchResponseDto[];
    adjustmentReasons: StockAdjustmentReasonResponseDto[];
    loading: boolean;
    error: string | null;
    filters: {
        search: string;
        productId?: string; // Updated from stockItemId to productId
        branchId?: string;
        movementType?: string;
        referenceType?: string;
        dateRange?: DateRange;
    };
    showMovementDialog: boolean;
    viewingMovement: StockMovement | null;
    summary: {
        totalMovements: number;
        totalInbound: number;
        totalOutbound: number;
        totalValue: number;
        uniqueItems: number;
    };
}

export default function InventoryReportsPage() {
    const { user } = useAuth();
    const merchantSettings = useMerchantSettings();
    const [state, setState] = useState<StockMovementReportsState>({
        movements: [],
        products: [], // Updated from stockItems to products
        branches: [],
        adjustmentReasons: [],
        loading: true,
        error: null,
        filters: {
            search: '',
            dateRange: {
                from: addDays(new Date(), -30),
                to: new Date(),
            },
        },
        showMovementDialog: false,
        viewingMovement: null,
        summary: {
            totalMovements: 0,
            totalInbound: 0,
            totalOutbound: 0,
            totalValue: 0,
            uniqueItems: 0,
        },
    });

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

    // Load inventory data and related information
    const loadInventoryData = async () => {
        try {
            setState(prev => ({ ...prev, loading: true, error: null }));

            const merchantId = getMerchantId();
            if (!merchantId) {
                throw new Error('Merchant ID not found. Please ensure you are logged in.');
            }

            // Load related data
            const [products, branches, adjustmentReasons] = await Promise.all([
                productsService.productControllerFindAll(merchantId, '', ''), // Updated to use products service
                branchesService.branchControllerFindAll(merchantId),
                stockService.stockControllerGetStockAdjustmentReasons()
            ]);

            // Since we've migrated to product-based inventory, we'll show current inventory status
            // instead of detailed movements (which would require new backend endpoints)
            let movements: StockMovement[] = [];

            // For now, we'll create a simplified view showing current product inventory status
            // This is more useful than historical movements for most inventory reporting needs
            console.log('Inventory reports now show current product stock levels instead of historical movements');

            // Apply filters to products instead of movements
            let filteredProducts = [...products];

            if (state.filters.search) {
                filteredProducts = filteredProducts.filter(product =>
                    product.name.toLowerCase().includes(state.filters.search.toLowerCase()) ||
                    product.code?.toLowerCase().includes(state.filters.search.toLowerCase()) ||
                    product.description?.toLowerCase().includes(state.filters.search.toLowerCase())
                );
            }

            if (state.filters.productId) {
                filteredProducts = filteredProducts.filter(product =>
                    product.id === state.filters.productId
                );
            }

            // Filter only inventory-tracked products for inventory reports
            filteredProducts = filteredProducts.filter(product => product.trackInventory);

            // Calculate inventory summary based on current product stock levels
            const summary = {
                totalMovements: 0, // Not applicable for current inventory view
                totalInbound: 0, // Not applicable for current inventory view
                totalOutbound: 0, // Not applicable for current inventory view
                totalValue: filteredProducts.reduce((sum, product) => sum + ((product.costPrice || 0) * (product.stockLevel || 0)), 0),
                uniqueItems: filteredProducts.length,
            };

            setState(prev => ({
                ...prev,
                movements: [], // Empty since we're not showing movements anymore
                products: filteredProducts, // Updated to use filtered products
                branches,
                adjustmentReasons,
                summary,
                loading: false,
            }));
        } catch (error: any) {
            console.error('Failed to load inventory data:', error);
            setState(prev => ({
                ...prev,
                error: error.message || 'Failed to load inventory data',
                loading: false,
            }));
            toast.error(error.message || 'Failed to load inventory data');
        }
    };

    useEffect(() => {
        if (user) {
            loadInventoryData();
        }
    }, [user, state.filters]);

    // Handle filter changes
    const handleFilterChange = (key: string, value: any) => {
        setState(prev => ({
            ...prev,
            filters: { ...prev.filters, [key]: value },
        }));
    };

    // Handle search
    const handleSearch = (value: string) => {
        setState(prev => ({
            ...prev,
            filters: { ...prev.filters, search: value },
        }));
    };

    // Format date
    const formatDate = (dateString: string) => {
        return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    };

    // Get movement type badge variant
    const getMovementTypeBadge = (movementType: string, quantity: number) => {
        if (quantity > 0) {
            return { variant: 'default' as const, icon: TrendingUp, color: 'text-green-600' };
        } else {
            return { variant: 'destructive' as const, icon: TrendingDown, color: 'text-red-600' };
        }
    };

    // Export movements to CSV
    const exportMovements = () => {
        const csvHeaders = [
            'Product Name',
            'Product Code',
            'Product Type',
            'Current Stock',
            'Reorder Level',
            'Cost Price',
            'Stock Value',
            'Status',
            'Unit of Measure'
        ];

        const csvData = state.products.map(product => {
            const stockLevel = product.stockLevel || 0;
            const reorderLevel = product.reorderLevel || 0;
            const costPrice = product.costPrice || 0;
            const stockValue = stockLevel * costPrice;

            const getStockStatus = () => {
                if (stockLevel <= 0) {
                    return 'Out of Stock';
                }
                if (reorderLevel > 0 && stockLevel <= reorderLevel) {
                    return 'Low Stock';
                }
                return 'In Stock';
            };

            return [
                product.name,
                product.code || '',
                product.productType === 'STORABLE_PRODUCT' ? 'Storable' :
                    product.productType === 'KIT' ? 'Kit' : 'Service',
                stockLevel,
                reorderLevel || 0,
                costPrice,
                stockValue,
                getStockStatus(),
                product.unitOfMeasure?.name || product.unitOfMeasure?.code || 'units'
            ];
        });

        const csvContent = [csvHeaders, ...csvData]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inventory-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    // Show loading or error if user is not available
    if (!user) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-muted-foreground">Please log in to view stock movement reports</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Inventory Reports</h1>
                    <p className="text-muted-foreground">
                        Monitor current inventory levels and stock status
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={exportMovements} disabled={state.products.length === 0}>
                        <Download className="mr-2 h-4 w-4" />
                        Export CSV
                    </Button>
                    <Button variant="outline" onClick={loadInventoryData}>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{state.summary.uniqueItems}</div>
                        <p className="text-xs text-muted-foreground">
                            Inventory-tracked products
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                            {state.products.filter(p => p.reorderLevel && p.stockLevel <= p.reorderLevel).length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Below reorder level
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {state.products.filter(p => p.stockLevel <= 0).length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Zero or negative stock
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <CardAmount amount={state.summary.totalValue} />
                        <p className="text-xs text-muted-foreground">
                            Current inventory value
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        {/* Search */}
                        <div className="grid gap-4 md:grid-cols-1">
                            <div>
                                <Label htmlFor="search">Search</Label>
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="search"
                                        placeholder="Search by product name, code, description..."
                                        value={state.filters.search}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        className="pl-8"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Filter Dropdowns */}
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <Label>Product</Label>
                                <Select
                                    value={state.filters.productId || 'all'}
                                    onValueChange={(value) =>
                                        handleFilterChange('productId', value === 'all' ? undefined : value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Products</SelectItem>
                                        {state.products.map((product) => (
                                            <SelectItem key={product.id} value={product.id}>
                                                {product.name} ({product.code})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Branch</Label>
                                <Select
                                    value={state.filters.branchId || 'all'}
                                    onValueChange={(value) =>
                                        handleFilterChange('branchId', value === 'all' ? undefined : value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Branches</SelectItem>
                                        {state.branches.map((branch) => (
                                            <SelectItem key={branch.id} value={branch.id}>
                                                {branch.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Error Display */}
            {state.error && (
                <Card className="border-destructive">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            <p className="text-destructive">{state.error}</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Inventory Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Current Inventory ({state.products.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead>Product Type</TableHead>
                                <TableHead className="text-right">Current Stock</TableHead>
                                <TableHead className="text-right">Reorder Level</TableHead>
                                <TableHead className="text-right">Cost Price</TableHead>
                                <TableHead className="text-right">Stock Value</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-12"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {state.loading ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8">
                                        Loading inventory data...
                                    </TableCell>
                                </TableRow>
                            ) : state.products.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8">
                                        <div className="flex flex-col items-center gap-2">
                                            <Package className="h-8 w-8 text-muted-foreground" />
                                            <p className="text-muted-foreground">No inventory products found</p>
                                            <p className="text-sm text-muted-foreground">
                                                Try adjusting your filters or create some inventory-tracked products
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                state.products.map((product) => {
                                    const stockLevel = product.stockLevel || 0;
                                    const reorderLevel = product.reorderLevel || 0;
                                    const costPrice = product.costPrice || 0;
                                    const stockValue = stockLevel * costPrice;

                                    const getStockStatus = () => {
                                        if (stockLevel <= 0) {
                                            return { label: 'Out of Stock', variant: 'destructive' as const, color: 'text-red-600' };
                                        }
                                        if (reorderLevel > 0 && stockLevel <= reorderLevel) {
                                            return { label: 'Low Stock', variant: 'secondary' as const, color: 'text-orange-600' };
                                        }
                                        return { label: 'In Stock', variant: 'outline' as const, color: 'text-green-600' };
                                    };

                                    const status = getStockStatus();

                                    return (
                                        <TableRow key={product.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{product.name}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {product.code}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {product.productType === 'STORABLE_PRODUCT' ? 'Storable' :
                                                        product.productType === 'KIT' ? 'Kit' : 'Service'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className={`font-medium ${status.color}`}>
                                                    {stockLevel}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {product.unitOfMeasure?.name || product.unitOfMeasure?.code || 'units'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="font-medium">
                                                    {reorderLevel || '-'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {costPrice ? formatCurrency(costPrice, merchantSettings) : '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="font-medium">
                                                    {stockValue ? formatCurrency(stockValue, merchantSettings) : '-'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={status.variant}>
                                                    {status.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        // Navigate to product details or open product view dialog
                                                        window.location.href = `/products/${product.id}`;
                                                    }}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>


        </div>
    );
} 