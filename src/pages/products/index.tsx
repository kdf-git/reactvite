import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, MoreHorizontal, Edit, Trash2, Package, Eye, AlertTriangle, Settings, CheckSquare, Square, Upload, ExternalLink, ArrowRightLeft, Layers, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { KraSyncIndicator } from '@/components/ui/kra-sync-indicator';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useMerchantSettings, formatCurrency } from '@/hooks/useMerchantSettings';
import { CardAmount } from '@/components/ui/amount-display';
import { productsService, categoriesService, branchesService, stockService } from '@/services/sdk';
import { extractErrorMessage } from '@/lib/error-utils';
import type {
    ProductResponseDto,
    CategoryResponseDto,
    BranchResponseDto,
    CreateStockAdjustmentDto,
    StockAdjustmentReasonResponseDto,
    CreateStockTransferDto,
    StockTransferResponseDto,
    StockTransferItemDto,
} from '@/lib/sdk';

// Update interfaces to match the API DTOs
interface Product extends ProductResponseDto { }

// Product Type enum to match backend
enum ProductType {
    STORABLE_PRODUCT = 'STORABLE_PRODUCT',
    KIT = 'KIT',
    SERVICE = 'SERVICE'
}

// Stock Adjustment Types
enum StockAdjustmentType {
    INCREASE = 'INCREASE',
    DECREASE = 'DECREASE',
    SET_QUANTITY = 'SET_QUANTITY'
}

interface StockAdjustmentItem {
    productId: string;
    productName: string;
    currentQuantity: number;
    adjustmentType: StockAdjustmentType;
    quantity: number;
    unitCost?: number;
    reason: string;
    notes?: string;
}

interface StockTransferItem {
    productId: string;
    productName: string;
    currentQuantity: number;
    availableQuantity: number;
    quantity: number;
    unitCost?: number;
    notes?: string;
}

interface ProductsPageState {
    products: Product[];
    branches: BranchResponseDto[];
    stockAdjustmentReasons: StockAdjustmentReasonResponseDto[];
    loading: boolean;
    error: string | null;
    filters: {
        search: string;
        categoryId?: string;
        productType?: ProductType;
        isActive?: boolean;
        lowStock?: boolean;
        trackInventory?: boolean;
    };
    showDeleteDialog: boolean;
    showViewDialog: boolean;
    showAdjustmentDialog: boolean;
    showBulkAdjustmentDialog: boolean;
    showTransferDialog: boolean;
    deletingProduct: Product | null;
    viewingProduct: Product | null;
    selectedItems: Set<string>;
    adjustmentItems: StockAdjustmentItem[];
    adjustmentBranch: string;
    adjustmentNotes: string;
    adjustmentReference: string;
    // Transfer States
    transferItems: StockTransferItem[];
    transferFromBranch: string;
    transferToBranch: string;
    transferReference: string;
    transferNotes: string;
    transferLoading: boolean;
    // KRA Integration States
    kraLoading: boolean;
    showKraBulkSubmitDialog: boolean;
    kraSelectedItems: Set<string>;
}

const adjustmentTypeLabels = {
    [StockAdjustmentType.INCREASE]: 'Increase Stock',
    [StockAdjustmentType.DECREASE]: 'Decrease Stock',
    [StockAdjustmentType.SET_QUANTITY]: 'Set Quantity'
};

const productTypeLabels = {
    [ProductType.STORABLE_PRODUCT]: 'Storable Product',
    [ProductType.KIT]: 'Kit/Bundle',
    [ProductType.SERVICE]: 'Service'
};

const productTypeIcons = {
    [ProductType.STORABLE_PRODUCT]: Package,
    [ProductType.KIT]: Layers,
    [ProductType.SERVICE]: Wrench
};

export default function ProductsPage() {
    const { user } = useAuth();
    const merchantSettings = useMerchantSettings();
    const navigate = useNavigate();
    const [state, setState] = useState<ProductsPageState>({
        products: [],
        branches: [],
        stockAdjustmentReasons: [],
        loading: true,
        error: null,
        filters: {
            search: '',
        },
        showDeleteDialog: false,
        showViewDialog: false,
        showAdjustmentDialog: false,
        showBulkAdjustmentDialog: false,
        showTransferDialog: false,
        deletingProduct: null,
        viewingProduct: null,
        selectedItems: new Set(),
        adjustmentItems: [],
        adjustmentBranch: '',
        adjustmentNotes: '',
        adjustmentReference: '',
        // Transfer States
        transferItems: [],
        transferFromBranch: '',
        transferToBranch: '',
        transferReference: '',
        transferNotes: '',
        transferLoading: false,
        kraLoading: false,
        showKraBulkSubmitDialog: false,
        kraSelectedItems: new Set(),
    });

    const [categories, setCategories] = useState<CategoryResponseDto[]>([]);

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

    // Load products and related data from API
    const loadProducts = async () => {
        try {
            setState(prev => ({ ...prev, loading: true, error: null }));

            const merchantId = getMerchantId();
            if (!merchantId) {
                throw new Error('Merchant ID not found. Please ensure you are logged in.');
            }

            // Load products, categories, branches, and adjustment reasons
            const [products, categoriesData, branches, adjustmentReasons] = await Promise.all([
                productsService.productControllerFindAll(
                    merchantId,
                    state.filters.categoryId || '',
                    state.filters.search || ''
                ),
                categoriesService.categoryControllerFindAll(merchantId, ''),
                branchesService.branchControllerFindAll(merchantId),
                stockService.stockControllerGetStockAdjustmentReasons()
            ]);

            // Apply client-side filters
            let filteredProducts = [...products];

            if (state.filters.isActive !== undefined) {
                filteredProducts = filteredProducts.filter(product =>
                    product.isActive === state.filters.isActive
                );
            }

            if (state.filters.productType) {
                filteredProducts = filteredProducts.filter(product =>
                    product.productType === state.filters.productType
                );
            }

            if (state.filters.trackInventory !== undefined) {
                filteredProducts = filteredProducts.filter(product =>
                    product.trackInventory === state.filters.trackInventory
                );
            }

            if (state.filters.lowStock) {
                filteredProducts = filteredProducts.filter(product =>
                    product.trackInventory &&
                    product.reorderLevel &&
                    product.stockLevel !== undefined &&
                    product.stockLevel <= product.reorderLevel
                );
            }

            setCategories(categoriesData);
            setState(prev => ({
                ...prev,
                products: filteredProducts,
                branches,
                stockAdjustmentReasons: adjustmentReasons,
                loading: false,
            }));
        } catch (error: any) {
            console.error('Failed to load products:', error);
            setState(prev => ({
                ...prev,
                error: error.message || 'Failed to load products',
                loading: false,
            }));
            toast.error(error.message || 'Failed to load products');
        }
    };

    useEffect(() => {
        if (user) {
            loadProducts();
        }
    }, [user, state.filters]);

    // Handle delete product
    const handleDeleteProduct = async () => {
        if (!state.deletingProduct) return;

        try {
            await productsService.productControllerRemove(state.deletingProduct.id);
            toast.success('Product deleted successfully');
            setState(prev => ({ ...prev, showDeleteDialog: false, deletingProduct: null }));
            loadProducts();
        } catch (error: any) {
            console.error('Failed to delete product:', error);
            toast.error(error.message || 'Failed to delete product');
        }
    };

    // Handle toggle product status
    const handleToggleStatus = async (product: Product) => {
        try {
            await productsService.productControllerToggleStatus(product.id);
            toast.success(`Product ${product.isActive ? 'deactivated' : 'activated'} successfully`);
            loadProducts();
        } catch (error: any) {
            console.error('Failed to toggle product status:', error);
            toast.error(error.message || 'Failed to update product status');
        }
    };

    // Handle single product stock adjustment
    const handleSingleAdjustment = (product: Product) => {
        if (!product.trackInventory) {
            toast.error('This product does not track inventory');
            return;
        }

        setState(prev => ({
            ...prev,
            adjustmentItems: [{
                productId: product.id,
                productName: product.name,
                currentQuantity: product.stockLevel || 0,
                adjustmentType: StockAdjustmentType.INCREASE,
                quantity: 1,
                unitCost: product.costPrice,
                reason: '',
                notes: ''
            }],
            adjustmentBranch: user?.branch?.id || '',
            showAdjustmentDialog: true
        }));
    };

    // Handle bulk stock adjustment
    const handleBulkAdjustment = () => {
        const inventoryProducts = state.products.filter(p =>
            state.selectedItems.has(p.id) && p.trackInventory
        );

        if (inventoryProducts.length === 0) {
            toast.error('Please select products that track inventory');
            return;
        }

        setState(prev => ({
            ...prev,
            adjustmentItems: inventoryProducts.map(product => ({
                productId: product.id,
                productName: product.name,
                currentQuantity: product.stockLevel || 0,
                adjustmentType: StockAdjustmentType.INCREASE,
                quantity: 1,
                unitCost: product.costPrice,
                reason: '',
                notes: ''
            })),
            adjustmentBranch: user?.branch?.id || '',
            showBulkAdjustmentDialog: true
        }));
    };

    // Handle submit stock adjustment
    const handleSubmitAdjustment = async () => {
        try {
            const merchantId = getMerchantId();
            if (!merchantId) {
                throw new Error('Merchant ID not found');
            }

            if (!state.adjustmentBranch) {
                toast.error('Please select a branch');
                return;
            }

            // Validate adjustment items
            for (const item of state.adjustmentItems) {
                if (!item.reason) {
                    toast.error(`Please select a reason for ${item.productName}`);
                    return;
                }
                if (item.quantity <= 0) {
                    toast.error(`Please enter a valid quantity for ${item.productName}`);
                    return;
                }
            }

            // Create stock adjustments via the product stock update endpoint
            for (const item of state.adjustmentItems) {
                await productsService.productControllerUpdateProductStock(item.productId, {
                    branchId: state.adjustmentBranch,
                    adjustmentType: item.adjustmentType,
                    quantity: item.quantity,
                    unitCost: item.unitCost,
                    reason: item.reason,
                    notes: item.notes || state.adjustmentNotes,
                    reference: state.adjustmentReference
                });
            }

            toast.success(`Stock adjustment completed for ${state.adjustmentItems.length} product(s)`);
            setState(prev => ({
                ...prev,
                showAdjustmentDialog: false,
                showBulkAdjustmentDialog: false,
                adjustmentItems: [],
                adjustmentNotes: '',
                adjustmentReference: '',
                selectedItems: new Set()
            }));
            loadProducts();
        } catch (error: any) {
            console.error('Failed to submit stock adjustment:', error);
            toast.error(extractErrorMessage(error));
        }
    };

    // Handle item selection for bulk operations
    const handleItemSelection = (productId: string, selected: boolean) => {
        setState(prev => {
            const newSelected = new Set(prev.selectedItems);
            if (selected) {
                newSelected.add(productId);
            } else {
                newSelected.delete(productId);
            }
            return { ...prev, selectedItems: newSelected };
        });
    };

    // Handle select all
    const handleSelectAll = () => {
        const allSelected = state.selectedItems.size === state.products.length;
        setState(prev => ({
            ...prev,
            selectedItems: allSelected ? new Set() : new Set(state.products.map(p => p.id))
        }));
    };

    // Update adjustment item
    const updateAdjustmentItem = (index: number, field: keyof StockAdjustmentItem, value: any) => {
        setState(prev => ({
            ...prev,
            adjustmentItems: prev.adjustmentItems.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            )
        }));
    };

    // Handle stock transfer
    const handleStockTransfer = async (product: Product) => {
        if (!product.trackInventory) {
            toast.error('This product does not track inventory');
            return;
        }

        setState(prev => ({
            ...prev,
            transferItems: [{
                productId: product.id,
                productName: product.name,
                currentQuantity: product.stockLevel || 0,
                availableQuantity: product.stockLevel || 0,
                quantity: 1,
                unitCost: product.costPrice,
                notes: ''
            }],
            transferFromBranch: user?.branch?.id || '',
            transferToBranch: '',
            showTransferDialog: true
        }));
    };

    // Handle search
    const handleSearch = (value: string) => {
        setState(prev => ({
            ...prev,
            filters: { ...prev.filters, search: value }
        }));
    };

    // Handle filter change
    const handleFilterChange = (key: string, value: any) => {
        setState(prev => ({
            ...prev,
            filters: { ...prev.filters, [key]: value }
        }));
    };

    // Check if product has low stock
    const isLowStock = (product: Product) => {
        return product.trackInventory &&
            product.reorderLevel &&
            product.stockLevel !== undefined &&
            product.stockLevel <= product.reorderLevel;
    };

    // Get reason name
    const getReasonName = (reasonId: string) => {
        const reason = state.stockAdjustmentReasons.find(r => r.id === reasonId);
        return reason?.name || reasonId;
    };

    // Handle KRA submission for single product
    const handleKraSubmission = async (product: Product) => {
        try {
            setState(prev => ({ ...prev, kraLoading: true }));
            await productsService.productControllerSubmitToKra(product.id);
            toast.success(`Product "${product.name}" submitted to KRA successfully`);
            loadProducts();
        } catch (error: any) {
            console.error('Failed to submit product to KRA:', error);
            toast.error(extractErrorMessage(error));
        } finally {
            setState(prev => ({ ...prev, kraLoading: false }));
        }
    };

    // Handle bulk KRA submission
    const handleBulkKraSubmission = async () => {
        try {
            setState(prev => ({ ...prev, kraLoading: true }));

            const selectedProducts = state.products.filter(p => state.kraSelectedItems.has(p.id));
            let successCount = 0;
            let errorCount = 0;

            for (const product of selectedProducts) {
                try {
                    await productsService.productControllerSubmitToKra(product.id);
                    successCount++;
                } catch (error) {
                    console.error(`Failed to submit ${product.name} to KRA:`, error);
                    errorCount++;
                }
            }

            if (successCount > 0) {
                toast.success(`${successCount} product(s) submitted to KRA successfully`);
            }
            if (errorCount > 0) {
                toast.error(`${errorCount} product(s) failed to submit to KRA`);
            }

            setState(prev => ({
                ...prev,
                showKraBulkSubmitDialog: false,
                kraSelectedItems: new Set()
            }));
            loadProducts();
        } catch (error: any) {
            console.error('Failed to submit products to KRA:', error);
            toast.error(extractErrorMessage(error));
        } finally {
            setState(prev => ({ ...prev, kraLoading: false }));
        }
    };

    // Get product type icon
    const getProductTypeIcon = (productType: ProductType) => {
        const IconComponent = productTypeIcons[productType];
        return IconComponent ? <IconComponent className="h-4 w-4" /> : <Package className="h-4 w-4" />;
    };

    // Get product type badge color
    const getProductTypeBadgeColor = (productType: ProductType) => {
        switch (productType) {
            case ProductType.STORABLE_PRODUCT:
                return 'bg-blue-100 text-blue-800';
            case ProductType.KIT:
                return 'bg-purple-100 text-purple-800';
            case ProductType.SERVICE:
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (state.loading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                        <p className="mt-2 text-sm text-gray-600">Loading products...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (state.error) {
        return (
            <div className="p-6">
                <div className="text-center">
                    <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Products</h3>
                    <p className="text-sm text-gray-600 mb-4">{state.error}</p>
                    <Button onClick={loadProducts}>Try Again</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                    <p className="text-sm text-gray-600">
                        Manage your products, inventory, and stock levels
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {state.selectedItems.size > 0 && (
                        <>
                            <Button
                                variant="outline"
                                onClick={handleBulkAdjustment}
                                disabled={!Array.from(state.selectedItems).some(id =>
                                    state.products.find(p => p.id === id)?.trackInventory
                                )}
                            >
                                <ArrowRightLeft className="h-4 w-4 mr-2" />
                                Adjust Stock ({state.selectedItems.size})
                            </Button>
                            {merchantSettings.country === 'KE' && (
                                <Button
                                    variant="outline"
                                    onClick={() => setState(prev => ({
                                        ...prev,
                                        kraSelectedItems: new Set(state.selectedItems),
                                        showKraBulkSubmitDialog: true
                                    }))}
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Submit to KRA ({state.selectedItems.size})
                                </Button>
                            )}
                        </>
                    )}
                    <Button onClick={() => navigate('/products/create')}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Product
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                        <div className="lg:col-span-2">
                            <Label htmlFor="search">Search Products</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    id="search"
                                    placeholder="Search by name, code, or barcode..."
                                    value={state.filters.search}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="category">Category</Label>
                            <Select
                                value={state.filters.categoryId || 'all'}
                                onValueChange={(value) => handleFilterChange('categoryId', value === 'all' ? undefined : value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All Categories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {categories.map((category) => (
                                        <SelectItem key={category.id} value={category.id}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="productType">Product Type</Label>
                            <Select
                                value={state.filters.productType || 'all'}
                                onValueChange={(value) => handleFilterChange('productType', value === 'all' ? undefined : value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All Types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    {Object.values(ProductType).map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {productTypeLabels[type]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={state.filters.isActive === undefined ? 'all' : state.filters.isActive ? 'active' : 'inactive'}
                                onValueChange={(value) => handleFilterChange('isActive', value === 'all' ? undefined : value === 'active')}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col space-y-2">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="trackInventory"
                                    checked={state.filters.trackInventory === true}
                                    onCheckedChange={(checked) =>
                                        handleFilterChange('trackInventory', checked ? true : undefined)
                                    }
                                />
                                <Label htmlFor="trackInventory" className="text-sm">
                                    Inventory Tracked
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="lowStock"
                                    checked={state.filters.lowStock === true}
                                    onCheckedChange={(checked) =>
                                        handleFilterChange('lowStock', checked ? true : undefined)
                                    }
                                />
                                <Label htmlFor="lowStock" className="text-sm">
                                    Low Stock Only
                                </Label>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Products Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>
                            Products ({state.products.length})
                        </CardTitle>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                checked={state.selectedItems.size === state.products.length && state.products.length > 0}
                                onCheckedChange={handleSelectAll}
                            />
                            <Label className="text-sm">Select All</Label>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">
                                        <span className="sr-only">Select</span>
                                    </TableHead>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Stock Level</TableHead>
                                    <TableHead>Cost Price</TableHead>
                                    <TableHead>Selling Price</TableHead>
                                    <TableHead>Status</TableHead>
                                    {merchantSettings.country === 'KE' && (
                                        <TableHead>KRA Status</TableHead>
                                    )}
                                    <TableHead className="w-12">
                                        <span className="sr-only">Actions</span>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {state.products.map((product) => (
                                    <TableRow key={product.id} className="hover:bg-gray-50">
                                        <TableCell>
                                            <Checkbox
                                                checked={state.selectedItems.has(product.id)}
                                                onCheckedChange={(checked) =>
                                                    handleItemSelection(product.id, checked as boolean)
                                                }
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-3">
                                                {getProductTypeIcon(product.productType as ProductType)}
                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {product.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {product.code}
                                                    </div>
                                                    {product.barcode && (
                                                        <div className="text-xs text-gray-400">
                                                            Barcode: {product.barcode}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getProductTypeBadgeColor(product.productType as ProductType)}>
                                                {productTypeLabels[product.productType as ProductType]}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm text-gray-900">
                                                {product.category?.name || 'Uncategorized'}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {product.trackInventory ? (
                                                <div className="flex items-center space-x-2">
                                                    <span className={`font-medium ${isLowStock(product) ? 'text-red-600' : 'text-gray-900'}`}>
                                                        {product.stockLevel || 0}
                                                    </span>
                                                    {isLowStock(product) && (
                                                        <AlertTriangle className="h-4 w-4 text-red-500" />
                                                    )}
                                                    {product.reorderLevel && (
                                                        <span className="text-xs text-gray-500">
                                                            (Min: {product.reorderLevel})
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-500">Not tracked</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <CardAmount
                                                amount={product.costPrice}
                                                currency={merchantSettings.currency}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <CardAmount
                                                amount={product.sellingPrice}
                                                currency={merchantSettings.currency}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <Badge variant={product.isActive ? 'default' : 'secondary'}>
                                                    {product.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                                <Switch
                                                    checked={product.isActive}
                                                    onCheckedChange={() => handleToggleStatus(product)}
                                                    size="sm"
                                                />
                                            </div>
                                        </TableCell>
                                        {merchantSettings.country === 'KE' && (
                                            <TableCell>
                                                <KraSyncIndicator
                                                    submitted={product.kraSubmitted}
                                                    submittedAt={product.kraSubmittedAt}
                                                    submissionData={product.kraSubmissionData}
                                                />
                                            </TableCell>
                                        )}
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>

                                                    <DropdownMenuItem
                                                        onClick={() => setState(prev => ({
                                                            ...prev,
                                                            viewingProduct: product,
                                                            showViewDialog: true
                                                        }))}
                                                    >
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        View Details
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem
                                                        onClick={() => navigate(`/products/${product.id}/edit`)}
                                                    >
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Edit Product
                                                    </DropdownMenuItem>

                                                    {product.trackInventory && (
                                                        <>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() => handleSingleAdjustment(product)}
                                                            >
                                                                <ArrowRightLeft className="h-4 w-4 mr-2" />
                                                                Adjust Stock
                                                            </DropdownMenuItem>

                                                            <DropdownMenuItem
                                                                onClick={() => handleStockTransfer(product)}
                                                            >
                                                                <Package className="h-4 w-4 mr-2" />
                                                                Transfer Stock
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}

                                                    {product.productType === ProductType.KIT && (
                                                        <>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() => navigate(`/products/${product.id}/bom`)}
                                                            >
                                                                <Layers className="h-4 w-4 mr-2" />
                                                                Manage BOM
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}

                                                    {merchantSettings.country === 'KE' && (
                                                        <>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() => handleKraSubmission(product)}
                                                                disabled={state.kraLoading}
                                                            >
                                                                <Upload className="h-4 w-4 mr-2" />
                                                                Submit to KRA
                                                            </DropdownMenuItem>

                                                            {product.kraSubmitted && (
                                                                <DropdownMenuItem
                                                                    onClick={() => window.open(`/kra/audit/${product.id}`, '_blank')}
                                                                >
                                                                    <ExternalLink className="h-4 w-4 mr-2" />
                                                                    View KRA Audit
                                                                </DropdownMenuItem>
                                                            )}
                                                        </>
                                                    )}

                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => setState(prev => ({
                                                            ...prev,
                                                            deletingProduct: product,
                                                            showDeleteDialog: true
                                                        }))}
                                                        className="text-red-600"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete Product
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {state.products.length === 0 && (
                            <div className="text-center py-12">
                                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    {state.filters.search || state.filters.categoryId || state.filters.productType
                                        ? 'No products match your current filters.'
                                        : 'Get started by creating your first product.'}
                                </p>
                                <Button onClick={() => navigate('/products/create')}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Product
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* View Product Dialog */}
            <Dialog open={state.showViewDialog} onOpenChange={(open) =>
                setState(prev => ({ ...prev, showViewDialog: open, viewingProduct: open ? prev.viewingProduct : null }))
            }>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Product Details</DialogTitle>
                    </DialogHeader>
                    {state.viewingProduct && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Product Name</Label>
                                    <p className="text-sm text-gray-900">{state.viewingProduct.name}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Product Code</Label>
                                    <p className="text-sm text-gray-900">{state.viewingProduct.code}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Product Type</Label>
                                    <Badge className={getProductTypeBadgeColor(state.viewingProduct.productType as ProductType)}>
                                        {productTypeLabels[state.viewingProduct.productType as ProductType]}
                                    </Badge>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Category</Label>
                                    <p className="text-sm text-gray-900">{state.viewingProduct.category?.name || 'Uncategorized'}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Cost Price</Label>
                                    <CardAmount
                                        amount={state.viewingProduct.costPrice}
                                        currency={merchantSettings.currency}
                                    />
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Selling Price</Label>
                                    <CardAmount
                                        amount={state.viewingProduct.sellingPrice}
                                        currency={merchantSettings.currency}
                                    />
                                </div>
                                {state.viewingProduct.trackInventory && (
                                    <>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Stock Level</Label>
                                            <p className={`text-sm ${isLowStock(state.viewingProduct) ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                                                {state.viewingProduct.stockLevel || 0}
                                                {isLowStock(state.viewingProduct) && (
                                                    <span className="ml-2 text-red-500">(Low Stock)</span>
                                                )}
                                            </p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Reorder Level</Label>
                                            <p className="text-sm text-gray-900">{state.viewingProduct.reorderLevel || 'Not set'}</p>
                                        </div>
                                    </>
                                )}
                            </div>
                            {state.viewingProduct.description && (
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Description</Label>
                                    <p className="text-sm text-gray-900">{state.viewingProduct.description}</p>
                                </div>
                            )}
                            {state.viewingProduct.barcode && (
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Barcode</Label>
                                    <p className="text-sm text-gray-900">{state.viewingProduct.barcode}</p>
                                </div>
                            )}
                            {merchantSettings.country === 'KE' && (
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">KRA Status</Label>
                                    <KraSyncIndicator
                                        submitted={state.viewingProduct.kraSubmitted}
                                        submittedAt={state.viewingProduct.kraSubmittedAt}
                                        submissionData={state.viewingProduct.kraSubmissionData}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setState(prev => ({ ...prev, showViewDialog: false, viewingProduct: null }))}
                        >
                            Close
                        </Button>
                        {state.viewingProduct && (
                            <Button onClick={() => navigate(`/products/${state.viewingProduct.id}/edit`)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Product
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Product Dialog */}
            <Dialog open={state.showDeleteDialog} onOpenChange={(open) =>
                setState(prev => ({ ...prev, showDeleteDialog: open, deletingProduct: open ? prev.deletingProduct : null }))
            }>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Product</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{state.deletingProduct?.name}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setState(prev => ({ ...prev, showDeleteDialog: false, deletingProduct: null }))}
                        >
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteProduct}>
                            Delete Product
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Single Stock Adjustment Dialog */}
            <Dialog open={state.showAdjustmentDialog} onOpenChange={(open) =>
                setState(prev => ({ ...prev, showAdjustmentDialog: open }))
            }>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Adjust Stock</DialogTitle>
                        <DialogDescription>
                            Adjust stock level for {state.adjustmentItems[0]?.productName}
                        </DialogDescription>
                    </DialogHeader>
                    {state.adjustmentItems.length > 0 && (
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="adjustmentType">Adjustment Type</Label>
                                <Select
                                    value={state.adjustmentItems[0].adjustmentType}
                                    onValueChange={(value) => updateAdjustmentItem(0, 'adjustmentType', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.values(StockAdjustmentType).map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {adjustmentTypeLabels[type]}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="quantity">
                                    {state.adjustmentItems[0].adjustmentType === StockAdjustmentType.SET_QUANTITY
                                        ? 'New Quantity'
                                        : 'Adjustment Quantity'}
                                </Label>
                                <Input
                                    id="quantity"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={state.adjustmentItems[0].quantity}
                                    onChange={(e) => updateAdjustmentItem(0, 'quantity', parseFloat(e.target.value) || 0)}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Current quantity: {state.adjustmentItems[0].currentQuantity}
                                </p>
                            </div>

                            <div>
                                <Label htmlFor="reason">Reason</Label>
                                <Select
                                    value={state.adjustmentItems[0].reason}
                                    onValueChange={(value) => updateAdjustmentItem(0, 'reason', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a reason" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {state.stockAdjustmentReasons.map((reason) => (
                                            <SelectItem key={reason.id} value={reason.id}>
                                                {reason.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="notes">Notes (Optional)</Label>
                                <Textarea
                                    id="notes"
                                    placeholder="Additional notes for this adjustment..."
                                    value={state.adjustmentItems[0].notes || ''}
                                    onChange={(e) => updateAdjustmentItem(0, 'notes', e.target.value)}
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setState(prev => ({ ...prev, showAdjustmentDialog: false }))}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleSubmitAdjustment}>
                            Apply Adjustment
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Bulk Stock Adjustment Dialog */}
            <Dialog open={state.showBulkAdjustmentDialog} onOpenChange={(open) =>
                setState(prev => ({ ...prev, showBulkAdjustmentDialog: open }))
            }>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Bulk Stock Adjustment</DialogTitle>
                        <DialogDescription>
                            Adjust stock levels for {state.adjustmentItems.length} products
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="adjustmentReference">Reference Number (Optional)</Label>
                                <Input
                                    id="adjustmentReference"
                                    placeholder="e.g., ADJ-2024-001"
                                    value={state.adjustmentReference}
                                    onChange={(e) => setState(prev => ({ ...prev, adjustmentReference: e.target.value }))}
                                />
                            </div>
                            <div>
                                <Label htmlFor="adjustmentNotes">General Notes (Optional)</Label>
                                <Input
                                    id="adjustmentNotes"
                                    placeholder="Notes for all adjustments..."
                                    value={state.adjustmentNotes}
                                    onChange={(e) => setState(prev => ({ ...prev, adjustmentNotes: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="border rounded-lg overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Current Qty</TableHead>
                                        <TableHead>Adjustment Type</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>Reason</TableHead>
                                        <TableHead>Notes</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {state.adjustmentItems.map((item, index) => (
                                        <TableRow key={item.productId}>
                                            <TableCell>
                                                <div className="font-medium">{item.productName}</div>
                                            </TableCell>
                                            <TableCell>
                                                {item.currentQuantity}
                                            </TableCell>
                                            <TableCell>
                                                <Select
                                                    value={item.adjustmentType}
                                                    onValueChange={(value) => updateAdjustmentItem(index, 'adjustmentType', value)}
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Object.values(StockAdjustmentType).map((type) => (
                                                            <SelectItem key={type} value={type}>
                                                                {adjustmentTypeLabels[type]}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={item.quantity}
                                                    onChange={(e) => updateAdjustmentItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                                                    className="w-24"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Select
                                                    value={item.reason}
                                                    onValueChange={(value) => updateAdjustmentItem(index, 'reason', value)}
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select reason" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {state.stockAdjustmentReasons.map((reason) => (
                                                            <SelectItem key={reason.id} value={reason.id}>
                                                                {reason.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    placeholder="Notes..."
                                                    value={item.notes || ''}
                                                    onChange={(e) => updateAdjustmentItem(index, 'notes', e.target.value)}
                                                    className="w-32"
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setState(prev => ({ ...prev, showBulkAdjustmentDialog: false }))}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleSubmitAdjustment}>
                            Apply Adjustments
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* KRA Bulk Submit Dialog */}
            {merchantSettings.country === 'KE' && (
                <Dialog open={state.showKraBulkSubmitDialog} onOpenChange={(open) =>
                    setState(prev => ({ ...prev, showKraBulkSubmitDialog: open }))
                }>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Submit Products to KRA</DialogTitle>
                            <DialogDescription>
                                Submit {state.kraSelectedItems.size} selected products to KRA VSCU for registration.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="rounded-lg border p-4">
                                <h4 className="font-medium mb-2">Selected Products:</h4>
                                <div className="space-y-1 max-h-32 overflow-y-auto">
                                    {Array.from(state.kraSelectedItems).map(productId => {
                                        const product = state.products.find(p => p.id === productId);
                                        return product ? (
                                            <div key={productId} className="text-sm text-gray-600">
                                                • {product.name} ({product.code})
                                            </div>
                                        ) : null;
                                    })}
                                </div>
                            </div>
                            <div className="text-sm text-gray-600">
                                <p>This will submit the selected products to KRA VSCU for registration. Products that are already submitted will be re-submitted with updated information.</p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setState(prev => ({ ...prev, showKraBulkSubmitDialog: false }))}
                            >
                                Cancel
                            </Button>
                            <Button onClick={handleBulkKraSubmission} disabled={state.kraLoading}>
                                {state.kraLoading ? 'Submitting...' : 'Submit to KRA'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
} 