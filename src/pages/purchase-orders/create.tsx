import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useMerchantSettings, formatCurrency } from '@/hooks/useMerchantSettings';
import { purchaseOrdersService, branchesService } from '@/services/sdk';
import { VendorSearch } from '@/components/ui/vendor-search';
import { StockItemSearch } from '@/components/ui/stock-item-search';
import type {
    CreatePurchaseOrderDto,
    CreatePurchaseOrderItemDto,
    BranchResponseDto,
    StockItemResponseDto
} from '@/lib/sdk';

interface PurchaseOrderItemFormData {
    stockItemId: string;
    stockItemName: string;
    description: string;
    quantity: number;
    unitCost: number;
    totalAmount: number;
    taxRate: number;
    taxAmount: number;
    discountRate: number;
    discountAmount: number;
    notes: string;
}

interface PurchaseOrderFormData {
    branchId: string;
    vendorId: string;
    poNumber: string;
    referenceNumber: string;
    orderDate: string;
    expectedDate: string;
    status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'SENT_TO_VENDOR' | 'PARTIALLY_RECEIVED' | 'FULLY_RECEIVED' | 'CANCELLED' | 'CLOSED';
    paymentTerms: string;
    paymentMethod: string;
    subtotalAmount: number;
    taxAmount: number;
    discountAmount: number;
    shippingAmount: number;
    totalAmount: number;
    notes: string;
    terms: string;
    deliveryAddress: string;
    contactPerson: string;
    contactPhone: string;
    items: PurchaseOrderItemFormData[];

    // Import fields (for Kenya merchants)
    isImportPurchase: boolean;
    importDeclarationNo: string;
    importEntryDate: string;
    importCustomsAgent: string;
}

const initialFormData: PurchaseOrderFormData = {
    branchId: '',
    vendorId: '',
    poNumber: '',
    referenceNumber: '',
    orderDate: new Date().toISOString().split('T')[0],
    expectedDate: '',
    status: 'APPROVED',
    paymentTerms: '',
    paymentMethod: '',
    subtotalAmount: 0,
    taxAmount: 0,
    discountAmount: 0,
    shippingAmount: 0,
    totalAmount: 0,
    notes: '',
    terms: '',
    deliveryAddress: '',
    contactPerson: '',
    contactPhone: '',
    items: [],
    isImportPurchase: false,
    importDeclarationNo: '',
    importEntryDate: '',
    importCustomsAgent: '',
};

const initialItemData: PurchaseOrderItemFormData = {
    stockItemId: '',
    stockItemName: '',
    description: '',
    quantity: 1,
    unitCost: 0,
    totalAmount: 0,
    taxRate: 0,
    taxAmount: 0,
    discountRate: 0,
    discountAmount: 0,
    notes: '',
};

export default function CreatePurchaseOrderPage() {
    const { user } = useAuth();
    const merchantSettings = useMerchantSettings();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = Boolean(id);
    const [loading, setLoading] = useState(false);
    const [branches, setBranches] = useState<BranchResponseDto[]>([]);
    const [formData, setFormData] = useState<PurchaseOrderFormData>(initialFormData);

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

    // Check if merchant is from Kenya and should show import fields
    const isKenyaMerchant = merchantSettings.country === 'KE';

    // Load data on component mount
    useEffect(() => {
        const loadData = async () => {
            try {
                const merchantId = getMerchantId();
                if (!merchantId) return;

                // Load branches and PO data (if editing)
                const branchesData = await branchesService.branchControllerFindAll(merchantId);
                setBranches(branchesData);

                // Generate PO number if creating new
                if (!isEditMode) {
                    const poNumberResponse = await purchaseOrdersService.purchaseOrderControllerGeneratePoNumber();
                    setFormData(prev => ({ ...prev, poNumber: poNumberResponse.poNumber || '' }));
                }

                // Load purchase order data if editing
                if (isEditMode && id) {
                    const purchaseOrder = await purchaseOrdersService.purchaseOrderControllerFindOne(id);
                    setFormData({
                        branchId: purchaseOrder.branchId,
                        vendorId: purchaseOrder.vendorId,
                        poNumber: purchaseOrder.poNumber,
                        referenceNumber: purchaseOrder.referenceNumber || '',
                        orderDate: purchaseOrder.orderDate.split('T')[0],
                        expectedDate: purchaseOrder.expectedDate ? purchaseOrder.expectedDate.split('T')[0] : '',
                        status: purchaseOrder.status as 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'SENT_TO_VENDOR' | 'PARTIALLY_RECEIVED' | 'FULLY_RECEIVED' | 'CANCELLED' | 'CLOSED',
                        paymentTerms: purchaseOrder.paymentTerms || '',
                        paymentMethod: purchaseOrder.paymentMethod || '',
                        subtotalAmount: purchaseOrder.subtotalAmount || 0,
                        taxAmount: purchaseOrder.taxAmount || 0,
                        discountAmount: purchaseOrder.discountAmount || 0,
                        shippingAmount: purchaseOrder.shippingAmount || 0,
                        totalAmount: purchaseOrder.totalAmount || 0,
                        notes: purchaseOrder.notes || '',
                        terms: purchaseOrder.terms || '',
                        deliveryAddress: purchaseOrder.deliveryAddress || '',
                        contactPerson: purchaseOrder.contactPerson || '',
                        contactPhone: purchaseOrder.contactPhone || '',
                        items: purchaseOrder.items?.map(item => ({
                            stockItemId: item.stockItemId,
                            stockItemName: item.stockItem?.name || '',
                            description: item.description || '',
                            quantity: item.quantity,
                            unitCost: item.unitCost || 0,
                            totalAmount: item.totalAmount || 0,
                            taxRate: item.taxRate || 0,
                            taxAmount: item.taxAmount || 0,
                            discountRate: item.discountRate || 0,
                            discountAmount: item.discountAmount || 0,
                            notes: item.notes || '',
                        })) || [],
                        // Import fields (with defaults for backward compatibility)
                        isImportPurchase: (purchaseOrder as any).isImportPurchase || false,
                        importDeclarationNo: (purchaseOrder as any).importDeclarationNo || '',
                        importEntryDate: (purchaseOrder as any).importEntryDate ? (purchaseOrder as any).importEntryDate.split('T')[0] : '',
                        importCustomsAgent: (purchaseOrder as any).importCustomsAgent || '',
                    });
                }
            } catch (error: any) {
                console.error('Failed to load data:', error);
                toast.error('Failed to load data');
            }
        };

        if (user) {
            loadData();
        }
    }, [user, isEditMode, id]);

    const handleFormChange = (field: keyof PurchaseOrderFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { ...initialItemData }]
        }));
    };

    const removeItem = (index: number) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
        calculateTotals();
    };

    const updateItem = (index: number, field: keyof PurchaseOrderItemFormData, value: any) => {
        setFormData(prev => {
            const newItems = [...prev.items];
            newItems[index] = { ...newItems[index], [field]: value };

            // Auto-calculate item totals when quantity or unit cost changes
            if (field === 'quantity' || field === 'unitCost') {
                const item = newItems[index];
                const subtotal = item.quantity * item.unitCost;
                const discountAmount = (subtotal * item.discountRate) / 100;
                const taxableAmount = subtotal - discountAmount;
                const taxAmount = (taxableAmount * item.taxRate) / 100;
                const totalAmount = taxableAmount + taxAmount;

                newItems[index] = {
                    ...item,
                    discountAmount,
                    taxAmount,
                    totalAmount,
                };
            }

            // Auto-calculate when discount or tax rates change
            if (field === 'discountRate' || field === 'taxRate') {
                const item = newItems[index];
                const subtotal = item.quantity * item.unitCost;
                const discountAmount = (subtotal * item.discountRate) / 100;
                const taxableAmount = subtotal - discountAmount;
                const taxAmount = (taxableAmount * item.taxRate) / 100;
                const totalAmount = taxableAmount + taxAmount;

                newItems[index] = {
                    ...item,
                    discountAmount,
                    taxAmount,
                    totalAmount,
                };
            }

            // Update stock item name when stock item changes
            if (field === 'stockItemId') {
                // Stock item details are handled by handleStockItemSelect callback
                // No need to lookup here since the search component provides the full object
            }

            return { ...prev, items: newItems };
        });

        // Recalculate totals after item update
        setTimeout(calculateTotals, 0);
    };

    const calculateTotals = () => {
        setFormData(prev => {
            const subtotalAmount = prev.items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);
            const discountAmount = prev.items.reduce((sum, item) => sum + (item.discountAmount || 0), 0);
            const taxAmount = prev.items.reduce((sum, item) => sum + (item.taxAmount || 0), 0);
            const totalAmount = subtotalAmount - discountAmount + taxAmount + (prev.shippingAmount || 0);

            return {
                ...prev,
                subtotalAmount,
                discountAmount,
                taxAmount,
                totalAmount,
            };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            toast.error('Please log in to create purchase orders');
            return;
        }

        const merchantId = getMerchantId();
        if (!merchantId) {
            toast.error('Merchant ID not found');
            return;
        }

        // Validation
        if (!formData.branchId) {
            toast.error('Please select a branch');
            return;
        }

        if (!formData.vendorId) {
            toast.error('Please select a vendor');
            return;
        }

        if (formData.items.length === 0) {
            toast.error('Please add at least one item');
            return;
        }

        // Validate all items have required fields
        for (let i = 0; i < formData.items.length; i++) {
            const item = formData.items[i];
            if (!item.stockItemId) {
                toast.error(`Please select a stock item for item ${i + 1}`);
                return;
            }
            if (item.quantity <= 0) {
                toast.error(`Please enter a valid quantity for item ${i + 1}`);
                return;
            }
            if (item.unitCost < 0) {
                toast.error(`Please enter a valid unit cost for item ${i + 1}`);
                return;
            }
        }

        setLoading(true);

        try {
            if (isEditMode && id) {
                // Update existing purchase order
                const updateData = {
                    branchId: formData.branchId,
                    vendorId: formData.vendorId,
                    referenceNumber: formData.referenceNumber || undefined,
                    orderDate: formData.orderDate,
                    expectedDate: formData.expectedDate || undefined,
                    paymentTerms: formData.paymentTerms || undefined,
                    paymentMethod: formData.paymentMethod || undefined,
                    subtotalAmount: formData.subtotalAmount,
                    taxAmount: formData.taxAmount || undefined,
                    discountAmount: formData.discountAmount || undefined,
                    shippingAmount: formData.shippingAmount || undefined,
                    totalAmount: formData.totalAmount,
                    notes: formData.notes || undefined,
                    terms: formData.terms || undefined,
                    deliveryAddress: formData.deliveryAddress || undefined,
                    contactPerson: formData.contactPerson || undefined,
                    contactPhone: formData.contactPhone || undefined,
                    items: formData.items.map(item => ({
                        stockItemId: item.stockItemId,
                        description: item.description || undefined,
                        quantity: item.quantity,
                        unitCost: item.unitCost,
                        totalAmount: item.totalAmount,
                        taxRate: item.taxRate || undefined,
                        taxAmount: item.taxAmount || undefined,
                        discountRate: item.discountRate || undefined,
                        discountAmount: item.discountAmount || undefined,
                        notes: item.notes || undefined,
                    })),
                };

                await purchaseOrdersService.purchaseOrderControllerUpdate(id, updateData);
                toast.success('Purchase order updated successfully');
            } else {
                // Create new purchase order
                const baseCreateData = {
                    branchId: formData.branchId,
                    vendorId: formData.vendorId,
                    poNumber: formData.poNumber,
                    referenceNumber: formData.referenceNumber || undefined,
                    orderDate: formData.orderDate,
                    expectedDate: formData.expectedDate || undefined,
                    status: formData.status,
                    paymentTerms: formData.paymentTerms || undefined,
                    paymentMethod: formData.paymentMethod || undefined,
                    subtotalAmount: formData.subtotalAmount,
                    taxAmount: formData.taxAmount || undefined,
                    discountAmount: formData.discountAmount || undefined,
                    shippingAmount: formData.shippingAmount || undefined,
                    totalAmount: formData.totalAmount,
                    notes: formData.notes || undefined,
                    terms: formData.terms || undefined,
                    deliveryAddress: formData.deliveryAddress || undefined,
                    contactPerson: formData.contactPerson || undefined,
                    contactPhone: formData.contactPhone || undefined,
                    items: formData.items.map(item => ({
                        stockItemId: item.stockItemId,
                        description: item.description || undefined,
                        quantity: item.quantity,
                        unitCost: item.unitCost,
                        totalAmount: item.totalAmount,
                        taxRate: item.taxRate || undefined,
                        taxAmount: item.taxAmount || undefined,
                        discountRate: item.discountRate || undefined,
                        discountAmount: item.discountAmount || undefined,
                        notes: item.notes || undefined,
                    })),
                };

                // Use the appropriate endpoint based on whether it's an import purchase
                if (formData.isImportPurchase && isKenyaMerchant) {
                    const importCreateData = {
                        ...baseCreateData,
                        importDeclarationNo: formData.importDeclarationNo,
                        importEntryDate: formData.importEntryDate,
                        importCustomsAgent: formData.importCustomsAgent || undefined,
                    };

                    // Use the import purchase order endpoint via SDK
                    await purchaseOrdersService.purchaseOrderControllerCreateImportPurchaseOrder(importCreateData);
                    toast.success('Import purchase order created successfully');
                } else {
                    // Use regular purchase order endpoint
                    await purchaseOrdersService.purchaseOrderControllerCreate(baseCreateData as CreatePurchaseOrderDto);
                    toast.success('Purchase order created successfully');
                }
            }

            navigate('/purchase-orders');
        } catch (error: any) {
            console.error('Failed to save purchase order:', error);
            toast.error(error.message || 'Failed to save purchase order');
        } finally {
            setLoading(false);
        }
    };

    // Handle stock item selection
    const handleStockItemSelect = (index: number, stockItem: StockItemResponseDto) => {
        // Validate for import purchase orders
        if (formData.isImportPurchase && !(stockItem as any).isImported) {
            toast.error('Only imported items can be added to import purchase orders. Please select an imported item or change the purchase order type.');
            return;
        }

        updateItem(index, 'stockItemId', stockItem.id);
        updateItem(index, 'stockItemName', stockItem.name);
        updateItem(index, 'unitCost', stockItem.costPrice || 0);
        updateItem(index, 'description', stockItem.description || '');

        // Auto-populate tax rate from stock item's KRA tax type
        const kraTaxRate = (stockItem as any).kraTaxType?.taxRate || 0;
        updateItem(index, 'taxRate', kraTaxRate);
    };

    // Show loading or error if user is not available
    if (!user) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-muted-foreground">Please log in to create purchase orders</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => navigate('/purchase-orders')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {isEditMode ? 'Edit Purchase Order' : 'Create Purchase Order'}
                    </h1>
                    <p className="text-muted-foreground">
                        {isEditMode ? 'Update purchase order details' : 'Create a new purchase order for your vendor'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="poNumber">PO Number *</Label>
                                <Input
                                    id="poNumber"
                                    value={formData.poNumber}
                                    onChange={(e) => handleFormChange('poNumber', e.target.value)}
                                    placeholder="Auto-generated"
                                    disabled={isEditMode}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="referenceNumber">Reference Number</Label>
                                <Input
                                    id="referenceNumber"
                                    value={formData.referenceNumber}
                                    onChange={(e) => handleFormChange('referenceNumber', e.target.value)}
                                    placeholder="External reference"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="branchId">Branch *</Label>
                                <Select
                                    value={formData.branchId}
                                    onValueChange={(value) => handleFormChange('branchId', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select branch" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {branches.map((branch) => (
                                            <SelectItem key={branch.id} value={branch.id}>
                                                {branch.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="vendorId">Vendor *</Label>
                                <VendorSearch
                                    value={formData.vendorId}
                                    onValueChange={(value) => handleFormChange('vendorId', value || '')}
                                    placeholder="Search and select vendor"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="orderDate">Order Date *</Label>
                                <Input
                                    id="orderDate"
                                    type="date"
                                    value={formData.orderDate}
                                    onChange={(e) => handleFormChange('orderDate', e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="expectedDate">Expected Date</Label>
                                <Input
                                    id="expectedDate"
                                    type="date"
                                    value={formData.expectedDate}
                                    onChange={(e) => handleFormChange('expectedDate', e.target.value)}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Import Information (Kenya only) */}
                {isKenyaMerchant && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Import Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="isImportPurchase"
                                    checked={formData.isImportPurchase}
                                    onCheckedChange={(checked) => {
                                        handleFormChange('isImportPurchase', checked);
                                        // Clear import fields if not an import purchase
                                        if (!checked) {
                                            handleFormChange('importDeclarationNo', '');
                                            handleFormChange('importEntryDate', '');
                                            handleFormChange('importCustomsAgent', '');
                                        }
                                    }}
                                />
                                <Label htmlFor="isImportPurchase">This is an import purchase order</Label>
                            </div>

                            {formData.isImportPurchase && (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="importDeclarationNo">Import Declaration Number *</Label>
                                            <Input
                                                id="importDeclarationNo"
                                                value={formData.importDeclarationNo}
                                                onChange={(e) => handleFormChange('importDeclarationNo', e.target.value)}
                                                placeholder="Enter import declaration number"
                                                required={formData.isImportPurchase}
                                            />
                                            <p className="text-sm text-muted-foreground">
                                                Official import declaration number from customs
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="importEntryDate">Import Entry Date *</Label>
                                            <Input
                                                id="importEntryDate"
                                                type="date"
                                                value={formData.importEntryDate}
                                                onChange={(e) => handleFormChange('importEntryDate', e.target.value)}
                                                required={formData.isImportPurchase}
                                            />
                                            <p className="text-sm text-muted-foreground">
                                                Date when goods entered the country
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="importCustomsAgent">Customs Agent</Label>
                                        <Input
                                            id="importCustomsAgent"
                                            value={formData.importCustomsAgent}
                                            onChange={(e) => handleFormChange('importCustomsAgent', e.target.value)}
                                            placeholder="Name of customs clearing agent"
                                        />
                                        <p className="text-sm text-muted-foreground">
                                            Name of the customs clearing agent (optional)
                                        </p>
                                    </div>

                                    <div className="p-4 bg-amber-50 border-l-4 border-amber-400 rounded">
                                        <div className="flex">
                                            <div className="ml-3">
                                                <p className="text-sm text-amber-800">
                                                    <strong>Import Purchase Order:</strong> Only imported stock items can be added to this purchase order. Make sure all items are properly marked as imported with valid HS codes and origin countries before adding them.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Items */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Items</CardTitle>
                            <Button type="button" onClick={addItem} size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Item
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {formData.items.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                No items added yet. Click "Add Item" to get started.
                            </div>
                        ) : (
                            formData.items.map((item, index) => (
                                <Card key={index} className="p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-medium">Item {index + 1}</h4>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => removeItem(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label>Stock Item *</Label>
                                            <StockItemSearch
                                                value={item.stockItemId}
                                                onValueChange={(value) => updateItem(index, 'stockItemId', value || '')}
                                                onStockItemSelect={(stockItem) => handleStockItemSelect(index, stockItem)}
                                                placeholder={formData.isImportPurchase ? "Search imported items only..." : "Search and select stock item"}
                                                importedOnly={formData.isImportPurchase}
                                            />
                                            {formData.isImportPurchase && (
                                                <p className="text-xs text-amber-600">
                                                    Only imported items can be added to import purchase orders
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Quantity *</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                                                placeholder="0"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Unit Cost *</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={item.unitCost}
                                                onChange={(e) => updateItem(index, 'unitCost', parseFloat(e.target.value) || 0)}
                                                placeholder="0.00"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Tax Rate (%)</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                max="100"
                                                step="0.01"
                                                value={item.taxRate}
                                                onChange={(e) => updateItem(index, 'taxRate', parseFloat(e.target.value) || 0)}
                                                placeholder="0"
                                                disabled={!!item.stockItemId}
                                                className={!!item.stockItemId ? "bg-muted" : ""}
                                            />
                                            {!!item.stockItemId && (
                                                <p className="text-xs text-muted-foreground">
                                                    Auto-populated from stock item's KRA tax type
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Discount Rate (%)</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                max="100"
                                                step="0.01"
                                                value={item.discountRate}
                                                onChange={(e) => updateItem(index, 'discountRate', parseFloat(e.target.value) || 0)}
                                                placeholder="0"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Total Amount</Label>
                                            <Input
                                                value={formatCurrency(item.totalAmount, merchantSettings)}
                                                disabled
                                                className="bg-muted"
                                            />
                                        </div>

                                        <div className="space-y-2 md:col-span-2 lg:col-span-3">
                                            <Label>Description</Label>
                                            <Input
                                                value={item.description}
                                                onChange={(e) => updateItem(index, 'description', e.target.value)}
                                                placeholder="Item description"
                                            />
                                        </div>

                                        <div className="space-y-2 md:col-span-2 lg:col-span-3">
                                            <Label>Notes</Label>
                                            <Textarea
                                                value={item.notes}
                                                onChange={(e) => updateItem(index, 'notes', e.target.value)}
                                                placeholder="Item notes"
                                                rows={2}
                                            />
                                        </div>
                                    </div>
                                </Card>
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* Totals */}
                {formData.items.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calculator className="h-5 w-5" />
                                Totals
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Subtotal</Label>
                                    <Input
                                        value={formatCurrency(formData.subtotalAmount, merchantSettings)}
                                        disabled
                                        className="bg-muted"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Shipping Amount</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.shippingAmount}
                                        onChange={(e) => {
                                            handleFormChange('shippingAmount', parseFloat(e.target.value) || 0);
                                            setTimeout(calculateTotals, 0);
                                        }}
                                        placeholder="0.00"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Total Discount</Label>
                                    <Input
                                        value={formatCurrency(formData.discountAmount, merchantSettings)}
                                        disabled
                                        className="bg-muted"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Total Tax</Label>
                                    <Input
                                        value={formatCurrency(formData.taxAmount, merchantSettings)}
                                        disabled
                                        className="bg-muted"
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label className="text-lg font-semibold">Total Amount</Label>
                                    <Input
                                        value={formatCurrency(formData.totalAmount, merchantSettings)}
                                        disabled
                                        className="bg-muted text-lg font-semibold"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Additional Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Additional Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="paymentTerms">Payment Terms</Label>
                                <Input
                                    id="paymentTerms"
                                    value={formData.paymentTerms}
                                    onChange={(e) => handleFormChange('paymentTerms', e.target.value)}
                                    placeholder="e.g., Net 30 days"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="paymentMethod">Payment Method</Label>
                                <Input
                                    id="paymentMethod"
                                    value={formData.paymentMethod}
                                    onChange={(e) => handleFormChange('paymentMethod', e.target.value)}
                                    placeholder="e.g., Bank Transfer"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="contactPerson">Contact Person</Label>
                                <Input
                                    id="contactPerson"
                                    value={formData.contactPerson}
                                    onChange={(e) => handleFormChange('contactPerson', e.target.value)}
                                    placeholder="Contact person for this PO"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="contactPhone">Contact Phone</Label>
                                <Input
                                    id="contactPhone"
                                    value={formData.contactPhone}
                                    onChange={(e) => handleFormChange('contactPhone', e.target.value)}
                                    placeholder="Contact phone number"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="deliveryAddress">Delivery Address</Label>
                            <Textarea
                                id="deliveryAddress"
                                value={formData.deliveryAddress}
                                onChange={(e) => handleFormChange('deliveryAddress', e.target.value)}
                                placeholder="Delivery address if different from branch"
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => handleFormChange('notes', e.target.value)}
                                placeholder="Purchase order notes"
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="terms">Terms and Conditions</Label>
                            <Textarea
                                id="terms"
                                value={formData.terms}
                                onChange={(e) => handleFormChange('terms', e.target.value)}
                                placeholder="Terms and conditions"
                                rows={3}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex items-center justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/purchase-orders')}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Saving...' : isEditMode ? 'Update Purchase Order' : 'Create Purchase Order'}
                    </Button>
                </div>
            </form>
        </div>
    );
} 