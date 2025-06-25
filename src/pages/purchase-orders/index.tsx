import { useState, useEffect } from 'react';
import { Plus, Search, MoreHorizontal, Edit, Trash2, FileText, Eye, Package, CheckCircle, XCircle, Clock, Send, Truck } from 'lucide-react';
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
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useMerchantSettings, formatCurrency } from '@/hooks/useMerchantSettings';
import { CardAmount } from '@/components/ui/amount-display';
import { purchaseOrdersService, branchesService, vendorsService } from '@/services/sdk';
import type {
    PurchaseOrderResponseDto,
    BranchResponseDto,
    VendorResponseDto,
    ReceivePurchaseOrderDto,
    ReceiveItemDto
} from '@/lib/sdk';

// Update interfaces to match the API DTOs
interface PurchaseOrder extends PurchaseOrderResponseDto { }

interface PurchaseOrdersPageState {
    purchaseOrders: PurchaseOrder[];
    branches: BranchResponseDto[];
    vendors: VendorResponseDto[];
    loading: boolean;
    error: string | null;
    filters: {
        search: string;
        branchId?: string;
        vendorId?: string;
        status?: string;
        dateFrom?: string;
        dateTo?: string;
    };
    showDeleteDialog: boolean;
    showReceiveDialog: boolean;
    deletingPurchaseOrder: PurchaseOrder | null;
    receivingPurchaseOrder: PurchaseOrder | null;
    receivingItems: Array<{ itemId: string; receivedQuantity: number; maxQuantity: number; itemName: string }>;
}

const statusLabels = {
    DRAFT: 'Draft',
    PENDING_APPROVAL: 'Pending Approval',
    APPROVED: 'Approved',
    SENT_TO_VENDOR: 'Sent to Vendor',
    PARTIALLY_RECEIVED: 'Partially Received',
    FULLY_RECEIVED: 'Fully Received',
    CANCELLED: 'Cancelled',
    CLOSED: 'Closed',
};

const statusColors = {
    DRAFT: 'bg-gray-100 text-gray-800',
    PENDING_APPROVAL: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-blue-100 text-blue-800',
    SENT_TO_VENDOR: 'bg-purple-100 text-purple-800',
    PARTIALLY_RECEIVED: 'bg-orange-100 text-orange-800',
    FULLY_RECEIVED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    CLOSED: 'bg-gray-100 text-gray-800',
};

export default function PurchaseOrdersPage() {
    const { user } = useAuth();
    const merchantSettings = useMerchantSettings();
    const [state, setState] = useState<PurchaseOrdersPageState>({
        purchaseOrders: [],
        branches: [],
        vendors: [],
        loading: true,
        error: null,
        filters: {
            search: '',
        },
        showDeleteDialog: false,
        showReceiveDialog: false,
        deletingPurchaseOrder: null,
        receivingPurchaseOrder: null,
        receivingItems: [],
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

    // Load purchase orders and related data from API
    const loadPurchaseOrders = async () => {
        try {
            setState(prev => ({ ...prev, loading: true, error: null }));

            const merchantId = getMerchantId();
            if (!merchantId) {
                throw new Error('Merchant ID not found. Please ensure you are logged in.');
            }

            // Load purchase orders, branches, and vendors
            const [purchaseOrders, branches, vendors] = await Promise.all([
                purchaseOrdersService.purchaseOrderControllerFindAll(
                    state.filters.branchId,
                    state.filters.vendorId,
                    state.filters.status as any,
                    state.filters.search,
                    state.filters.dateFrom,
                    state.filters.dateTo
                ),
                branchesService.branchControllerFindAll(merchantId),
                vendorsService.vendorControllerFindByMerchant(merchantId)
            ]);

            setState(prev => ({
                ...prev,
                purchaseOrders,
                branches,
                vendors,
                loading: false,
            }));
        } catch (error: any) {
            console.error('Failed to load purchase orders:', error);
            setState(prev => ({
                ...prev,
                error: error.message || 'Failed to load purchase orders',
                loading: false,
            }));
            toast.error(error.message || 'Failed to load purchase orders');
        }
    };

    useEffect(() => {
        if (user) {
            loadPurchaseOrders();
        }
    }, [user, state.filters]);

    // Handle delete purchase order
    const handleDeletePurchaseOrder = async () => {
        if (!state.deletingPurchaseOrder) return;

        try {
            await purchaseOrdersService.purchaseOrderControllerRemove(state.deletingPurchaseOrder.id);
            toast.success('Purchase order deleted successfully');
            setState(prev => ({ ...prev, showDeleteDialog: false, deletingPurchaseOrder: null }));
            loadPurchaseOrders();
        } catch (error: any) {
            console.error('Failed to delete purchase order:', error);
            toast.error(error.message || 'Failed to delete purchase order');
        }
    };

    // Handle receive purchase order
    const handleReceivePurchaseOrder = async () => {
        if (!state.receivingPurchaseOrder || state.receivingItems.length === 0) return;

        try {
            const receivedItems: ReceiveItemDto[] = state.receivingItems
                .filter(item => item.receivedQuantity > 0)
                .map(item => ({
                    itemId: item.itemId,
                    receivedQuantity: item.receivedQuantity,
                }));

            if (receivedItems.length === 0) {
                toast.error('Please enter received quantities for at least one item');
                return;
            }

            const receiveData: ReceivePurchaseOrderDto = {
                receivedItems,
                createStockMovements: true,
            };

            await purchaseOrdersService.purchaseOrderControllerReceivePurchaseOrder(
                state.receivingPurchaseOrder.id,
                receiveData
            );

            toast.success('Purchase order items received successfully');
            setState(prev => ({
                ...prev,
                showReceiveDialog: false,
                receivingPurchaseOrder: null,
                receivingItems: [],
            }));
            loadPurchaseOrders();
        } catch (error: any) {
            console.error('Failed to receive purchase order:', error);
            toast.error(error.message || 'Failed to receive purchase order');
        }
    };

    // Handle start receiving process
    const handleStartReceiving = (purchaseOrder: PurchaseOrder) => {
        const receivingItems = purchaseOrder.items?.map(item => ({
            itemId: item.id,
            receivedQuantity: 0,
            maxQuantity: item.quantity - (item.receivedQuantity || 0),
            itemName: item.stockItem?.name || item.description || 'Unknown Item',
        })) || [];

        setState(prev => ({
            ...prev,
            showReceiveDialog: true,
            receivingPurchaseOrder: purchaseOrder,
            receivingItems,
        }));
    };

    // Update received quantity for an item
    const updateReceivedQuantity = (itemId: string, quantity: number) => {
        setState(prev => ({
            ...prev,
            receivingItems: prev.receivingItems.map(item =>
                item.itemId === itemId
                    ? { ...item, receivedQuantity: Math.max(0, Math.min(quantity, item.maxQuantity)) }
                    : item
            ),
        }));
    };

    // Handle search
    const handleSearch = (value: string) => {
        setState(prev => ({
            ...prev,
            filters: { ...prev.filters, search: value },
        }));
    };

    // Handle filter change
    const handleFilterChange = (key: string, value: any) => {
        setState(prev => ({
            ...prev,
            filters: { ...prev.filters, [key]: value },
        }));
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-KE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    // Show loading or error if user is not available
    if (!user) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-muted-foreground">Please log in to view purchase orders</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
                    <p className="text-muted-foreground">
                        Create and manage purchase orders to vendors
                    </p>
                </div>
                <Button onClick={() => window.location.href = '/purchase-orders/create'}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Purchase Order
                </Button>
            </div>

            {/* Purchase Order Overview Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Purchase Orders</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{state.purchaseOrders.length}</div>
                        <p className="text-xs text-muted-foreground">
                            {state.purchaseOrders.filter(po => po.status !== 'CANCELLED' && po.status !== 'CLOSED').length} active orders
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">
                            {state.purchaseOrders.filter(po => po.status === 'PENDING_APPROVAL').length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Orders awaiting approval
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Awaiting Delivery</CardTitle>
                        <Send className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            {state.purchaseOrders.filter(po => po.status === 'SENT_TO_VENDOR' || po.status === 'APPROVED').length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Orders sent to vendors
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <CardAmount
                            amount={state.purchaseOrders.reduce((total, po) => total + (po.totalAmount || 0), 0)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Total purchase value
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters and Search */}
            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-4 md:flex-row md:items-end">
                        <div className="flex-1">
                            <Label htmlFor="search">Search</Label>
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="search"
                                    placeholder="Search by PO number, reference, or vendor..."
                                    value={state.filters.search}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
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

                            <div>
                                <Label>Vendor</Label>
                                <Select
                                    value={state.filters.vendorId || 'all'}
                                    onValueChange={(value) =>
                                        handleFilterChange('vendorId', value === 'all' ? undefined : value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Vendors</SelectItem>
                                        {state.vendors.map((vendor) => (
                                            <SelectItem key={vendor.id} value={vendor.id}>
                                                {vendor.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Status</Label>
                                <Select
                                    value={state.filters.status || 'all'}
                                    onValueChange={(value) =>
                                        handleFilterChange('status', value === 'all' ? undefined : value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        {Object.entries(statusLabels).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-end">
                                <Button variant="outline" onClick={loadPurchaseOrders}>
                                    <Search className="mr-2 h-4 w-4" />
                                    Refresh
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Error Display */}
            {state.error && (
                <Card className="border-destructive">
                    <CardContent className="pt-6">
                        <p className="text-destructive">{state.error}</p>
                    </CardContent>
                </Card>
            )}

            {/* Purchase Orders Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Purchase Orders ({state.purchaseOrders.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>PO Number</TableHead>
                                <TableHead>Vendor</TableHead>
                                <TableHead>Branch</TableHead>
                                <TableHead>Order Date</TableHead>
                                <TableHead>Total Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-12"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {state.loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8">
                                        Loading purchase orders...
                                    </TableCell>
                                </TableRow>
                            ) : state.purchaseOrders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8">
                                        No purchase orders found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                state.purchaseOrders.map((purchaseOrder) => (
                                    <TableRow key={purchaseOrder.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                                    <FileText className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="font-medium">{purchaseOrder.poNumber}</div>
                                                        {(purchaseOrder as any).isImportPurchase && (
                                                            <Badge className="text-xs bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900 dark:text-amber-100 dark:border-amber-800">
                                                                Import
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {purchaseOrder.referenceNumber && (
                                                        <div className="text-sm text-muted-foreground">
                                                            Ref: {purchaseOrder.referenceNumber}
                                                        </div>
                                                    )}
                                                    {(purchaseOrder as any).importDeclarationNo && (
                                                        <div className="text-sm text-muted-foreground">
                                                            Import Declaration: {(purchaseOrder as any).importDeclarationNo}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{purchaseOrder.vendor?.name || 'Unknown Vendor'}</div>
                                                {purchaseOrder.vendor?.contactEmail && (
                                                    <div className="text-sm text-muted-foreground">
                                                        {purchaseOrder.vendor.contactEmail}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{purchaseOrder.branch?.name || 'Unknown Branch'}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{formatDate(purchaseOrder.orderDate)}</div>
                                                {purchaseOrder.expectedDate && (
                                                    <div className="text-sm text-muted-foreground">
                                                        Expected: {formatDate(purchaseOrder.expectedDate)}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{formatCurrency(purchaseOrder.totalAmount || 0, merchantSettings)}</div>
                                                {purchaseOrder.items && purchaseOrder.items.length > 0 && (
                                                    <div className="text-sm text-muted-foreground">
                                                        {purchaseOrder.items.length} item{purchaseOrder.items.length !== 1 ? 's' : ''}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={statusColors[purchaseOrder.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}
                                            >
                                                {statusLabels[purchaseOrder.status as keyof typeof statusLabels] || purchaseOrder.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            window.location.href = `/purchase-orders/view/${purchaseOrder.id}`;
                                                        }}
                                                    >
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            window.location.href = `/purchase-orders/edit/${purchaseOrder.id}`;
                                                        }}
                                                        disabled={purchaseOrder.status === 'CLOSED' || purchaseOrder.status === 'CANCELLED'}
                                                    >
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    {(purchaseOrder.status === 'APPROVED' || purchaseOrder.status === 'SENT_TO_VENDOR' || purchaseOrder.status === 'PARTIALLY_RECEIVED') && (
                                                        <DropdownMenuItem
                                                            onClick={() => handleStartReceiving(purchaseOrder)}
                                                        >
                                                            <Truck className="mr-2 h-4 w-4" />
                                                            Receive Items
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => setState(prev => ({ ...prev, showDeleteDialog: true, deletingPurchaseOrder: purchaseOrder }))}
                                                        className="text-destructive"
                                                        disabled={purchaseOrder.status !== 'DRAFT' && purchaseOrder.status !== 'CANCELLED'}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Delete Purchase Order Dialog */}
            <Dialog open={state.showDeleteDialog} onOpenChange={(open) => setState(prev => ({ ...prev, showDeleteDialog: open }))}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Purchase Order</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete purchase order "{state.deletingPurchaseOrder?.poNumber}"?
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setState(prev => ({ ...prev, showDeleteDialog: false }))}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeletePurchaseOrder}>
                            Delete Purchase Order
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Receive Purchase Order Dialog */}
            <Dialog open={state.showReceiveDialog} onOpenChange={(open) => setState(prev => ({ ...prev, showReceiveDialog: open }))}>
                <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Receive Purchase Order Items</DialogTitle>
                        <DialogDescription>
                            Enter the quantities received for each item. Stock movements will be created automatically.
                        </DialogDescription>
                    </DialogHeader>
                    {state.receivingPurchaseOrder && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">PO Number</Label>
                                    <p className="text-sm font-mono">{state.receivingPurchaseOrder.poNumber}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Vendor</Label>
                                    <p className="text-sm">{state.receivingPurchaseOrder.vendor?.name || 'Unknown Vendor'}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label className="text-sm font-medium">Items to Receive</Label>
                                {state.receivingItems.map((item, index) => (
                                    <Card key={item.itemId}>
                                        <CardContent className="pt-4">
                                            <div className="grid gap-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h4 className="font-medium">{item.itemName}</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            Available to receive: {item.maxQuantity}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="grid gap-2">
                                                        <Label htmlFor={`quantity-${item.itemId}`}>Received Quantity</Label>
                                                        <Input
                                                            id={`quantity-${item.itemId}`}
                                                            type="number"
                                                            min="0"
                                                            max={item.maxQuantity}
                                                            value={item.receivedQuantity}
                                                            onChange={(e) =>
                                                                updateReceivedQuantity(item.itemId, parseFloat(e.target.value) || 0)
                                                            }
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                    <div className="grid gap-2">
                                                        <Label>Quick Actions</Label>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => updateReceivedQuantity(item.itemId, item.maxQuantity)}
                                                            >
                                                                Receive All
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => updateReceivedQuantity(item.itemId, 0)}
                                                            >
                                                                Clear
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            <div className="bg-muted p-4 rounded-lg">
                                <h4 className="font-medium mb-2">Summary</h4>
                                <p className="text-sm text-muted-foreground">
                                    Items to receive: {state.receivingItems.filter(item => item.receivedQuantity > 0).length} of {state.receivingItems.length}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Total quantity: {state.receivingItems.reduce((sum, item) => sum + item.receivedQuantity, 0)}
                                </p>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setState(prev => ({ ...prev, showReceiveDialog: false }))}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleReceivePurchaseOrder}
                            disabled={state.receivingItems.filter(item => item.receivedQuantity > 0).length === 0}
                        >
                            <Truck className="mr-2 h-4 w-4" />
                            Receive Items
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
} 