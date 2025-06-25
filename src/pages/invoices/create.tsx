import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Calculator, Save, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useMerchantSettings, formatCurrency } from '@/hooks/useMerchantSettings';
import { invoicesService, branchesService, customersService, productsService } from '@/services/sdk';
import { extractErrorMessage } from '@/lib/error-utils';
import type {
    CreateInvoiceDto,
    CreateInvoiceItemDto,
    BranchResponseDto,
    CustomerResponseDto,
    ProductResponseDto,
    InvoiceResponseDto
} from '@/lib/sdk';

interface InvoiceFormData {
    branchId: string;
    customerId: string;
    invoiceDate: string;
    dueDate: string;
    notes: string;
}

interface InvoiceItemFormData {
    id: string; // Temporary ID for form management
    productId: string;
    productName: string;
    productCode: string;
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    discountAmount: number;
    totalAmount: number;
}

const initialFormData: InvoiceFormData = {
    branchId: '',
    customerId: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    notes: '',
};

export default function CreateInvoicePage() {
    const { user } = useAuth();
    const merchantSettings = useMerchantSettings();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [branches, setBranches] = useState<BranchResponseDto[]>([]);
    const [customers, setCustomers] = useState<CustomerResponseDto[]>([]);
    const [products, setProducts] = useState<ProductResponseDto[]>([]);

    const [formData, setFormData] = useState<InvoiceFormData>(initialFormData);
    const [invoiceItems, setInvoiceItems] = useState<InvoiceItemFormData[]>([]);
    const [selectedProductId, setSelectedProductId] = useState<string>('');

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

    // Load initial data
    useEffect(() => {
        const loadData = async () => {
            try {
                const merchantId = getMerchantId();
                if (!merchantId) return;

                // Load branches, customers, and products
                const [branchesData, customersData, productsData] = await Promise.all([
                    branchesService.branchControllerFindAll(merchantId),
                    customersService.customerControllerFindAll(merchantId, '', ''),
                    productsService.productControllerFindAll(merchantId, '', '')
                ]);

                setBranches(branchesData || []);
                setCustomers(customersData || []);
                setProducts(productsData || []);

                // Set default branch if only one exists
                if (branchesData && branchesData.length === 1) {
                    setFormData(prev => ({ ...prev, branchId: branchesData[0].id }));
                }

                // Load invoice data if editing
                if (isEditMode && id) {
                    const invoice = await invoicesService.invoiceControllerGetInvoice(id);
                    setFormData({
                        branchId: invoice.branchId,
                        customerId: invoice.customerId || '',
                        invoiceDate: new Date(invoice.invoiceDate).toISOString().split('T')[0],
                        dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : '',
                        notes: invoice.notes || '',
                    });

                    // Load invoice items
                    if (invoice.items) {
                        const items: InvoiceItemFormData[] = invoice.items.map((item, index) => ({
                            id: `item-${index}`,
                            productId: item.productId,
                            productName: item.product?.name || 'Unknown Product',
                            productCode: item.product?.code || '',
                            description: item.description || '',
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            taxRate: item.taxRate || 0,
                            discountAmount: item.discountAmount || 0,
                            totalAmount: item.totalAmount,
                        }));
                        setInvoiceItems(items);
                    }
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

    const handleFormChange = (field: keyof InvoiceFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const addInvoiceItem = () => {
        if (!selectedProductId) {
            toast.error('Please select a product');
            return;
        }

        const selectedProduct = products.find(p => p.id === selectedProductId);
        if (!selectedProduct) {
            toast.error('Selected product not found');
            return;
        }

        // Check if product is already added
        if (invoiceItems.some(item => item.productId === selectedProductId)) {
            toast.error('Product already added to invoice');
            return;
        }

        // Get tax rate from KRA tax type if available, otherwise use product's basic tax rate
        const taxRate = (selectedProduct as any).kraTaxType?.taxRate || selectedProduct.taxRate || 0;

        const newItem: InvoiceItemFormData = {
            id: `item-${Date.now()}`,
            productId: selectedProduct.id,
            productName: selectedProduct.name,
            productCode: selectedProduct.code,
            description: '',
            quantity: 1,
            unitPrice: selectedProduct.sellingPrice,
            taxRate: taxRate,
            discountAmount: 0,
            totalAmount: selectedProduct.sellingPrice,
        };

        setInvoiceItems(prev => [...prev, newItem]);
        setSelectedProductId('');
    };

    const updateInvoiceItem = (itemId: string, field: keyof InvoiceItemFormData, value: any) => {
        setInvoiceItems(prev => prev.map(item => {
            if (item.id === itemId) {
                const updatedItem = { ...item, [field]: value };

                // Recalculate total when quantity, unit price, tax rate, or discount changes
                if (['quantity', 'unitPrice', 'taxRate', 'discountAmount'].includes(field)) {
                    const subtotal = updatedItem.quantity * updatedItem.unitPrice;
                    const discountedAmount = subtotal - updatedItem.discountAmount;
                    const taxAmount = (discountedAmount * updatedItem.taxRate) / 100;
                    updatedItem.totalAmount = discountedAmount + taxAmount;
                }

                return updatedItem;
            }
            return item;
        }));
    };

    const removeInvoiceItem = (itemId: string) => {
        setInvoiceItems(prev => prev.filter(item => item.id !== itemId));
    };

    // Calculate invoice totals
    const calculateTotals = () => {
        const subtotal = invoiceItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        const totalDiscount = invoiceItems.reduce((sum, item) => sum + item.discountAmount, 0);
        const discountedSubtotal = subtotal - totalDiscount;
        const totalTax = invoiceItems.reduce((sum, item) => {
            const itemSubtotal = (item.quantity * item.unitPrice) - item.discountAmount;
            return sum + ((itemSubtotal * item.taxRate) / 100);
        }, 0);
        const total = discountedSubtotal + totalTax;

        return {
            subtotal,
            totalDiscount,
            totalTax,
            total,
        };
    };

    const totals = calculateTotals();

    const handleSubmit = async (issueImmediately: boolean = false) => {
        if (!user) {
            toast.error('Please log in to create invoices');
            return;
        }

        const merchantId = getMerchantId();
        if (!merchantId) {
            toast.error('Merchant ID not found');
            return;
        }

        if (!formData.branchId) {
            toast.error('Please select a branch');
            return;
        }

        if (invoiceItems.length === 0) {
            toast.error('Please add at least one item to the invoice');
            return;
        }

        setLoading(true);

        try {
            const invoiceData: CreateInvoiceDto = {
                branchId: formData.branchId,
                customerId: formData.customerId || undefined,
                invoiceDate: formData.invoiceDate,
                dueDate: formData.dueDate || undefined,
                notes: formData.notes || undefined,
                items: invoiceItems.map(item => ({
                    productId: item.productId,
                    description: item.description || undefined,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    taxRate: item.taxRate || undefined,
                    discountAmount: item.discountAmount || undefined,
                })),
            };

            let invoice: InvoiceResponseDto;

            if (isEditMode && id) {
                // Update existing invoice
                await invoicesService.invoiceControllerUpdateInvoice(id, {
                    branchId: invoiceData.branchId,
                    customerId: invoiceData.customerId,
                    invoiceDate: invoiceData.invoiceDate,
                    dueDate: invoiceData.dueDate,
                    notes: invoiceData.notes,
                });

                // Note: Updating items would require additional API calls
                // For now, we'll just update the basic invoice data
                invoice = await invoicesService.invoiceControllerGetInvoice(id);
            } else {
                // Create new invoice
                invoice = await invoicesService.invoiceControllerCreateInvoice(invoiceData);
            }

            // Issue the invoice immediately if requested
            if (issueImmediately && invoice.status === 'DRAFT') {
                await invoicesService.invoiceControllerIssueInvoice(invoice.id);
            }

            toast.success(
                isEditMode
                    ? 'Invoice updated successfully'
                    : issueImmediately
                        ? 'Invoice created and issued successfully'
                        : 'Invoice created successfully'
            );

            navigate('/invoices');
        } catch (error: any) {
            console.error('Failed to save invoice:', error);
            const errorMessage = extractErrorMessage(error);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Show loading or error if user is not available
    if (!user) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-muted-foreground">Please log in to create invoices</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => navigate('/invoices')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {isEditMode ? 'Edit Invoice' : 'Create Invoice'}
                    </h1>
                    <p className="text-muted-foreground">
                        {isEditMode ? 'Update invoice details and items' : 'Create a new invoice for your customer'}
                    </p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Invoice Form */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Invoice Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
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
                                    <Label htmlFor="customerId">Customer</Label>
                                    <Select
                                        value={formData.customerId || "walk-in"}
                                        onValueChange={(value) => handleFormChange('customerId', value === "walk-in" ? "" : value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select customer (optional)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="walk-in">Walk-in Customer</SelectItem>
                                            {customers.map((customer) => (
                                                <SelectItem key={customer.id} value={customer.id}>
                                                    {customer.name} {customer.phone && `(${customer.phone})`}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="invoiceDate">Invoice Date *</Label>
                                    <Input
                                        id="invoiceDate"
                                        type="date"
                                        value={formData.invoiceDate}
                                        onChange={(e) => handleFormChange('invoiceDate', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="dueDate">Due Date</Label>
                                    <Input
                                        id="dueDate"
                                        type="date"
                                        value={formData.dueDate}
                                        onChange={(e) => handleFormChange('dueDate', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={formData.notes}
                                    onChange={(e) => handleFormChange('notes', e.target.value)}
                                    placeholder="Invoice notes or terms"
                                    rows={3}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Invoice Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Invoice Items</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Add Item Section */}
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <Select
                                        value={selectedProductId}
                                        onValueChange={setSelectedProductId}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a product to add" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {products
                                                .filter(product => !invoiceItems.some(item => item.productId === product.id))
                                                .map((product) => (
                                                    <SelectItem key={product.id} value={product.id}>
                                                        {product.name} ({product.code}) - {formatCurrency(product.sellingPrice, merchantSettings)}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button onClick={addInvoiceItem} disabled={!selectedProductId}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Item
                                </Button>
                            </div>

                            {/* Items Table */}
                            {invoiceItems.length > 0 && (
                                <div className="border rounded-lg">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Product</TableHead>
                                                <TableHead>Qty</TableHead>
                                                <TableHead>Unit Price</TableHead>
                                                <TableHead>Tax %</TableHead>
                                                <TableHead>Discount</TableHead>
                                                <TableHead>Total</TableHead>
                                                <TableHead className="w-12"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {invoiceItems.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-medium">{item.productName}</div>
                                                            <div className="text-sm text-muted-foreground">{item.productCode}</div>
                                                            <Input
                                                                placeholder="Description override"
                                                                value={item.description}
                                                                onChange={(e) => updateInvoiceItem(item.id, 'description', e.target.value)}
                                                                className="mt-1 text-sm"
                                                            />
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            type="number"
                                                            min="0.01"
                                                            step="0.01"
                                                            value={item.quantity}
                                                            onChange={(e) => updateInvoiceItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                                                            className="w-20"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={item.unitPrice}
                                                            onChange={(e) => updateInvoiceItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                                                            className="w-24"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                max="100"
                                                                step="0.01"
                                                                value={item.taxRate}
                                                                onChange={(e) => updateInvoiceItem(item.id, 'taxRate', parseFloat(e.target.value) || 0)}
                                                                className={`w-20 ${item.productId ? "bg-muted" : ""}`}
                                                                disabled={!!item.productId}
                                                            />
                                                            {!!item.productId && (
                                                                <p className="text-xs text-muted-foreground">
                                                                    Auto-populated from product's KRA tax type
                                                                </p>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={item.discountAmount}
                                                            onChange={(e) => updateInvoiceItem(item.id, 'discountAmount', parseFloat(e.target.value) || 0)}
                                                            className="w-24"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-medium">
                                                            {formatCurrency(item.totalAmount, merchantSettings)}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => removeInvoiceItem(item.id)}
                                                            className="h-8 w-8 text-destructive hover:text-destructive"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}

                            {invoiceItems.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    No items added yet. Select a product above to add it to the invoice.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Invoice Summary */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calculator className="h-5 w-5" />
                                Invoice Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span>Subtotal:</span>
                                    <span>{formatCurrency(totals.subtotal, merchantSettings)}</span>
                                </div>
                                {totals.totalDiscount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Discount:</span>
                                        <span>-{formatCurrency(totals.totalDiscount, merchantSettings)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span>Tax:</span>
                                    <span>{formatCurrency(totals.totalTax, merchantSettings)}</span>
                                </div>
                                <hr />
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total:</span>
                                    <span>{formatCurrency(totals.total, merchantSettings)}</span>
                                </div>
                            </div>

                            <div className="space-y-2 pt-4">
                                <Button
                                    onClick={() => handleSubmit(false)}
                                    disabled={loading || invoiceItems.length === 0}
                                    className="w-full"
                                    variant="outline"
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    {loading ? 'Saving...' : 'Save as Draft'}
                                </Button>

                                <Button
                                    onClick={() => handleSubmit(true)}
                                    disabled={loading || invoiceItems.length === 0}
                                    className="w-full"
                                >
                                    <Send className="h-4 w-4 mr-2" />
                                    {loading ? 'Creating...' : 'Create & Issue Invoice'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Invoice Items Summary */}
                    {invoiceItems.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Items ({invoiceItems.length})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {invoiceItems.map((item) => (
                                        <div key={item.id} className="flex justify-between text-sm">
                                            <span className="truncate">{item.productName}</span>
                                            <span>{item.quantity} × {formatCurrency(item.unitPrice, merchantSettings)}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
} 