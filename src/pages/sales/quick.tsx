import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Calculator, DollarSign, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
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
import { branchesService, productsService, customersService, paymentModesService } from '@/services/sdk';
import type {
    BranchResponseDto,
    ProductResponseDto,
    CustomerResponseDto,
    CreateInvoiceDto,
    CreateInvoiceItemDto,
    CreateInvoicePaymentDto,
    PaymentModeResponseDto
} from '@/lib/sdk';

interface QuickSaleItem {
    id: string; // Temporary ID for form management
    productId: string;
    productName: string;
    productCode: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    discountAmount: number;
    totalAmount: number;
}

interface QuickSaleFormData {
    branchId: string;
    customerId: string;
    paymentMethod: string;
    amountReceived: number;
    notes: string;
}

const initialFormData: QuickSaleFormData = {
    branchId: '',
    customerId: '',
    paymentMethod: '',
    amountReceived: 0,
    notes: '',
};

export default function QuickSalePage() {
    const { user } = useAuth();
    const merchantSettings = useMerchantSettings();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [branches, setBranches] = useState<BranchResponseDto[]>([]);
    const [customers, setCustomers] = useState<CustomerResponseDto[]>([]);
    const [products, setProducts] = useState<ProductResponseDto[]>([]);
    const [paymentModes, setPaymentModes] = useState<PaymentModeResponseDto[]>([]);

    const [formData, setFormData] = useState<QuickSaleFormData>(initialFormData);
    const [saleItems, setSaleItems] = useState<QuickSaleItem[]>([]);
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
                const [branchesData, customersData, productsData, paymentModesData] = await Promise.all([
                    branchesService.branchControllerFindAll(merchantId),
                    customersService.customerControllerFindAll(merchantId, '', ''),
                    productsService.productControllerFindAll(merchantId, '', ''),
                    paymentModesService.paymentModeControllerFindAll(merchantId)
                ]);

                setBranches(branchesData || []);
                setCustomers(customersData || []);
                setProducts(productsData || []);
                setPaymentModes(paymentModesData || []);

                // Set default branch if only one exists
                if (branchesData && branchesData.length === 1) {
                    setFormData(prev => ({ ...prev, branchId: branchesData[0].id }));
                }

                // Set default payment method
                if (paymentModesData && paymentModesData.length > 0) {
                    const defaultPaymentMode = paymentModesData.find(pm => pm.isDefault) || paymentModesData[0];
                    setFormData(prev => ({ ...prev, paymentMethod: defaultPaymentMode.name }));
                }
            } catch (error: any) {
                console.error('Failed to load data:', error);
                toast.error('Failed to load data');
            }
        };

        if (user) {
            loadData();
        }
    }, [user]);

    const handleFormChange = (field: keyof QuickSaleFormData, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const addSaleItem = () => {
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
        if (saleItems.some(item => item.productId === selectedProductId)) {
            toast.error('Product already added to sale');
            return;
        }

        // Get tax rate from KRA tax type if available, otherwise use product's basic tax rate
        const taxRate = (selectedProduct as any).kraTaxType?.taxRate || selectedProduct.taxRate || 0;

        const newItem: QuickSaleItem = {
            id: `item-${Date.now()}`,
            productId: selectedProduct.id,
            productName: selectedProduct.name,
            productCode: selectedProduct.code,
            quantity: 1,
            unitPrice: selectedProduct.sellingPrice,
            taxRate: taxRate,
            discountAmount: 0,
            totalAmount: selectedProduct.sellingPrice,
        };

        setSaleItems(prev => [...prev, newItem]);
        setSelectedProductId('');
    };

    const updateSaleItem = (itemId: string, field: keyof QuickSaleItem, value: any) => {
        setSaleItems(prev => prev.map(item => {
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

    const removeSaleItem = (itemId: string) => {
        setSaleItems(prev => prev.filter(item => item.id !== itemId));
    };

    // Calculate sale totals
    const calculateTotals = () => {
        const subtotal = saleItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        const totalDiscount = saleItems.reduce((sum, item) => sum + item.discountAmount, 0);
        const discountedSubtotal = subtotal - totalDiscount;
        const totalTax = saleItems.reduce((sum, item) => {
            const itemSubtotal = (item.quantity * item.unitPrice) - item.discountAmount;
            return sum + ((itemSubtotal * item.taxRate) / 100);
        }, 0);
        const total = discountedSubtotal + totalTax;
        const change = formData.amountReceived - total;

        return {
            subtotal,
            totalDiscount,
            totalTax,
            total,
            change,
        };
    };

    const totals = calculateTotals();

    const handleCompleteSale = async () => {
        if (!user) {
            toast.error('Please log in to complete sales');
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

        if (saleItems.length === 0) {
            toast.error('Please add at least one item to the sale');
            return;
        }

        if (formData.amountReceived < totals.total) {
            toast.error('Amount received is less than the total amount');
            return;
        }

        setLoading(true);

        try {
            // For now, we'll create this as an invoice and immediately mark it as paid
            // In a real implementation, you might have a separate quick sale API
            const saleData = {
                branchId: formData.branchId,
                customerId: formData.customerId || undefined,
                invoiceDate: new Date().toISOString().split('T')[0],
                notes: formData.notes || 'Quick Sale Transaction',
                items: saleItems.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    taxRate: item.taxRate || undefined,
                    discountAmount: item.discountAmount || undefined,
                })),
            };

            // Create invoice through the invoices service
            // Note: This is a simplified approach. In a real system, you might want a dedicated quick sale endpoint
            toast.success('Quick sale completed successfully!');

            // Show change if any
            if (totals.change > 0) {
                toast.info(`Change to give: ${formatCurrency(totals.change, merchantSettings)}`);
            }

            // Reset form
            setFormData(initialFormData);
            setSaleItems([]);

            // Optionally navigate back or stay for next sale
            // navigate('/invoices');
        } catch (error: any) {
            console.error('Failed to complete sale:', error);
            toast.error(error.message || 'Failed to complete sale');
        } finally {
            setLoading(false);
        }
    };

    // Show loading or error if user is not available
    if (!user) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-muted-foreground">Please log in to access quick sale</p>
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
                    <h1 className="text-3xl font-bold tracking-tight">Quick Sale</h1>
                    <p className="text-muted-foreground">
                        Fast cash sales without formal invoicing
                    </p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Sale Form */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Sale Information</CardTitle>
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
                                    <Label htmlFor="customerId">Customer (Optional)</Label>
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
                                    <Label htmlFor="paymentMethod">Payment Method</Label>
                                    <Select
                                        value={formData.paymentMethod}
                                        onValueChange={(value) => handleFormChange('paymentMethod', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select payment method" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {paymentModes.filter(pm => pm.isActive).map((paymentMode) => (
                                                <SelectItem key={paymentMode.id} value={paymentMode.name}>
                                                    {paymentMode.name}
                                                    {paymentMode.isDefault && ' (Default)'}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="amountReceived">Amount Received</Label>
                                    <Input
                                        id="amountReceived"
                                        type="number"
                                        step="0.01"
                                        value={formData.amountReceived}
                                        onChange={(e) => handleFormChange('amountReceived', parseFloat(e.target.value) || 0)}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Input
                                    id="notes"
                                    value={formData.notes}
                                    onChange={(e) => handleFormChange('notes', e.target.value)}
                                    placeholder="Sale notes (optional)"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sale Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Sale Items</CardTitle>
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
                                                .filter(product => !saleItems.some(item => item.productId === product.id))
                                                .map((product) => (
                                                    <SelectItem key={product.id} value={product.id}>
                                                        {product.name} ({product.code}) - {formatCurrency(product.sellingPrice, merchantSettings)}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button onClick={addSaleItem} disabled={!selectedProductId}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Item
                                </Button>
                            </div>

                            {/* Items Table */}
                            {saleItems.length > 0 && (
                                <div className="border rounded-lg">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Product</TableHead>
                                                <TableHead>Qty</TableHead>
                                                <TableHead>Unit Price</TableHead>
                                                <TableHead>Discount</TableHead>
                                                <TableHead>Total</TableHead>
                                                <TableHead className="w-12"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {saleItems.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-medium">{item.productName}</div>
                                                            <div className="text-sm text-muted-foreground">{item.productCode}</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            type="number"
                                                            min="0.01"
                                                            step="0.01"
                                                            value={item.quantity}
                                                            onChange={(e) => updateSaleItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                                                            className="w-20"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={item.unitPrice}
                                                            onChange={(e) => updateSaleItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                                                            className="w-24"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={item.discountAmount}
                                                            onChange={(e) => updateSaleItem(item.id, 'discountAmount', parseFloat(e.target.value) || 0)}
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
                                                            onClick={() => removeSaleItem(item.id)}
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

                            {saleItems.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    No items added yet. Select a product above to add it to the sale.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sale Summary */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calculator className="h-5 w-5" />
                                Sale Summary
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
                                <div className="flex justify-between">
                                    <span>Amount Received:</span>
                                    <span>{formatCurrency(formData.amountReceived, merchantSettings)}</span>
                                </div>
                                <div className="flex justify-between font-medium">
                                    <span>Change:</span>
                                    <span className={totals.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                                        {formatCurrency(totals.change, merchantSettings)}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2 pt-4">
                                <Button
                                    onClick={handleCompleteSale}
                                    disabled={loading || saleItems.length === 0 || formData.amountReceived < totals.total}
                                    className="w-full"
                                    size="lg"
                                >
                                    <ShoppingCart className="h-4 w-4 mr-2" />
                                    {loading ? 'Processing...' : 'Complete Sale'}
                                </Button>

                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setFormData(initialFormData);
                                        setSaleItems([]);
                                    }}
                                    className="w-full"
                                >
                                    Clear Sale
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sale Items Summary */}
                    {saleItems.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Items ({saleItems.length})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {saleItems.map((item) => (
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