import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
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
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useMerchantSettings, formatCurrency } from '@/hooks/useMerchantSettings';
import { extractErrorMessage } from '@/lib/error-utils';
import { invoicesService, branchesService, customersService } from '@/services/sdk';
import type {
    InvoiceResponseDto,
    CreateCreditNoteDto,
    CreateCreditNoteItemDto,
    BranchResponseDto,
    CustomerResponseDto
} from '@/lib/sdk';

interface CreditNoteItem {
    productId?: string;
    productName?: string;
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    totalAmount: number;
}

interface CreateCreditNoteState {
    originalInvoice: InvoiceResponseDto | null;
    branches: BranchResponseDto[];
    customers: CustomerResponseDto[];
    loading: boolean;
    saving: boolean;
    error: string | null;
    formData: {
        originalInvoiceId: string;
        branchId: string;
        customerId?: string;
        creditNoteDate: string;
        reason: string;
        notes: string;
        items: CreditNoteItem[];
    };
}

const CREDIT_NOTE_REASONS = [
    { code: '01', name: 'Missing Quantity', description: 'Missing Quantity' },
    { code: '02', name: 'Missing Item', description: 'Missing Item' },
    { code: '03', name: 'Damaged', description: 'Damaged' },
    { code: '04', name: 'Wasted', description: 'Wasted' },
    { code: '05', name: 'Raw Material Shortage', description: 'Raw Material Shortage' },
    { code: '06', name: 'Refund', description: 'Refund' },
    { code: '07', name: 'Wrong Customer PIN', description: 'Wrong Customer PIN' },
    { code: '08', name: 'Wrong Customer name', description: 'Wrong Customer name' },
    { code: '09', name: 'Wrong Amount/price', description: 'Wrong Amount/price' },
    { code: '10', name: 'Wrong Quantity', description: 'Wrong Quantity' },
    { code: '11', name: 'Wrong Item(s)', description: 'Wrong Item(s)' },
    { code: '12', name: 'Wrong tax type', description: 'Wrong tax type' },
    { code: '13', name: 'Other reason', description: 'Other reason' }
];

export default function CreateCreditNotePage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user } = useAuth();
    const merchantSettings = useMerchantSettings();

    const invoiceId = searchParams.get('invoiceId');

    const [state, setState] = useState<CreateCreditNoteState>({
        originalInvoice: null,
        branches: [],
        customers: [],
        loading: true,
        saving: false,
        error: null,
        formData: {
            originalInvoiceId: invoiceId || '',
            branchId: '',
            customerId: '',
            creditNoteDate: new Date().toISOString().split('T')[0],
            reason: '',
            notes: '',
            items: []
        }
    });

    // Get merchantId from user context
    const getMerchantId = (): string | null => {
        if (user?.merchantId) return user.merchantId;
        if (user?.merchant?.id) return user.merchant.id;
        return null;
    };

    // Load initial data
    const loadData = async () => {
        if (!invoiceId) {
            setState(prev => ({ ...prev, error: 'Invoice ID is required', loading: false }));
            return;
        }

        try {
            setState(prev => ({ ...prev, loading: true, error: null }));

            const merchantId = getMerchantId();
            if (!merchantId) {
                throw new Error('Merchant ID not found. Please ensure you are logged in.');
            }

            // Load invoice, branches, and customers
            const [invoice, branches, customers] = await Promise.all([
                invoicesService.invoiceControllerGetInvoice(invoiceId),
                branchesService.branchControllerFindAll(merchantId),
                customersService.customerControllerFindAll(merchantId)
            ]);

            // Initialize form with invoice data and create items from invoice items
            const creditNoteItems: CreditNoteItem[] = invoice.items?.map(item => ({
                productId: item.productId || undefined,
                productName: (item.product as any)?.name || 'Unknown Item',
                description: item.description || '', // Keep original description separate
                quantity: 0, // User will set the quantity to credit
                unitPrice: item.unitPrice || 0,
                taxRate: 0, // Calculate from item if available
                totalAmount: 0
            })) || [];

            setState(prev => ({
                ...prev,
                originalInvoice: invoice,
                branches: branches || [],
                customers: customers || [],
                formData: {
                    ...prev.formData,
                    originalInvoiceId: invoice.id,
                    branchId: invoice.branchId || '',
                    customerId: invoice.customerId || '',
                    creditNoteDate: new Date().toISOString().split('T')[0], // Default to today's date
                    items: creditNoteItems
                },
                loading: false
            }));
        } catch (error: any) {
            console.error('Failed to load data:', error);
            const errorMessage = extractErrorMessage(error);
            setState(prev => ({ ...prev, error: errorMessage, loading: false }));
            toast.error(errorMessage);
        }
    };

    useEffect(() => {
        loadData();
    }, [invoiceId]);

    // Update form field
    const updateFormField = (field: string, value: any) => {
        setState(prev => ({
            ...prev,
            formData: { ...prev.formData, [field]: value }
        }));
    };

    // Update item field
    const updateItemField = (index: number, field: string, value: any) => {
        setState(prev => {
            const newItems = [...prev.formData.items];
            newItems[index] = { ...newItems[index], [field]: value };

            // Recalculate total amount for this item
            if (field === 'quantity' || field === 'unitPrice') {
                const item = newItems[index];
                item.totalAmount = item.quantity * item.unitPrice;
            }

            return {
                ...prev,
                formData: { ...prev.formData, items: newItems }
            };
        });
    };

    // Remove item
    const removeItem = (index: number) => {
        setState(prev => ({
            ...prev,
            formData: {
                ...prev.formData,
                items: prev.formData.items.filter((_, i) => i !== index)
            }
        }));
    };

    // Add new item
    const addItem = () => {
        setState(prev => ({
            ...prev,
            formData: {
                ...prev.formData,
                items: [...prev.formData.items, {
                    productName: '',
                    description: '',
                    quantity: 1,
                    unitPrice: 0,
                    taxRate: 0,
                    totalAmount: 0
                }]
            }
        }));
    };

    // Calculate totals
    const getTotalAmount = () => {
        return state.formData.items.reduce((sum, item) => sum + item.totalAmount, 0);
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (!state.originalInvoice) return;

        // Validation
        if (!state.formData.reason) {
            toast.error('Please select a reason for the credit note');
            return;
        }

        if (state.formData.items.length === 0) {
            toast.error('Please add at least one item to the credit note');
            return;
        }

        if (state.formData.items.some(item => item.quantity <= 0)) {
            toast.error('All items must have a quantity greater than 0');
            return;
        }

        try {
            setState(prev => ({ ...prev, saving: true }));

            const creditNoteData: CreateCreditNoteDto = {
                originalInvoiceId: state.formData.originalInvoiceId,
                creditNoteDate: state.formData.creditNoteDate,
                reason: state.formData.reason,
                notes: state.formData.notes,
                items: state.formData.items.map(item => ({
                    productId: item.productId,
                    description: item.description || item.productName || 'Unknown Item',
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    totalAmount: item.totalAmount
                } as CreateCreditNoteItemDto))
            };

            const creditNote = await invoicesService.invoiceControllerCreateCreditNote(creditNoteData);

            toast.success('Credit note created successfully');
            navigate(`/invoices/credit-notes`);
        } catch (error: any) {
            console.error('Failed to create credit note:', error);
            const errorMessage = extractErrorMessage(error);
            toast.error(errorMessage);
        } finally {
            setState(prev => ({ ...prev, saving: false }));
        }
    };

    if (state.loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (state.error || !state.originalInvoice) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-destructive">{state.error || 'Invoice not found'}</p>
                    <Button variant="outline" onClick={() => navigate('/invoices')} className="mt-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Invoices
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={() => navigate('/invoices/credit-notes')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Credit Notes
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Create Credit Note</h1>
                        <p className="text-muted-foreground">
                            For Invoice: {state.originalInvoice.invoiceNumber}
                        </p>
                    </div>
                </div>
                <Button onClick={handleSubmit} disabled={state.saving}>
                    <Save className="mr-2 h-4 w-4" />
                    {state.saving ? 'Creating...' : 'Create Credit Note'}
                </Button>
            </div>

            {/* Original Invoice Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Original Invoice Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <Label className="text-sm font-medium text-muted-foreground">Invoice Number</Label>
                        <p className="text-sm font-mono">{state.originalInvoice.invoiceNumber}</p>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-muted-foreground">Customer</Label>
                        <p className="text-sm">{state.originalInvoice.customer?.name || 'Walk-in Customer'}</p>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-muted-foreground">Amount</Label>
                        <p className="text-sm font-medium">
                            {formatCurrency(state.originalInvoice.totalAmount, merchantSettings)}
                        </p>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-muted-foreground">Date</Label>
                        <p className="text-sm">
                            {new Date(state.originalInvoice.invoiceDate).toLocaleDateString()}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Credit Note Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Credit Note Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="creditNoteDate">Credit Note Date</Label>
                            <Input
                                id="creditNoteDate"
                                type="date"
                                value={state.formData.creditNoteDate}
                                onChange={(e) => updateFormField('creditNoteDate', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="reason">Reason for Credit Note</Label>
                            <Select
                                value={state.formData.reason}
                                onValueChange={(value) => updateFormField('reason', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a reason" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CREDIT_NOTE_REASONS.map((reason) => (
                                        <SelectItem key={reason.code} value={reason.code}>
                                            {reason.code} - {reason.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Textarea
                            id="notes"
                            placeholder="Additional notes about this credit note..."
                            value={state.formData.notes}
                            onChange={(e) => updateFormField('notes', e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Items */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Items to Credit</CardTitle>
                        <Button variant="outline" onClick={addItem}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Item
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {state.formData.items.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No items added yet. Click "Add Item" to add items to credit.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product Name</TableHead>
                                    <TableHead>Notes</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Unit Price</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {state.formData.items.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            {item.productName ? (
                                                <div className="font-medium text-gray-900">
                                                    {item.productName}
                                                </div>
                                            ) : (
                                                <Input
                                                    value={item.productName || ''}
                                                    onChange={(e) => updateItemField(index, 'productName', e.target.value)}
                                                    placeholder="Product name"
                                                />
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                value={item.description}
                                                onChange={(e) => updateItemField(index, 'description', e.target.value)}
                                                placeholder="Additional notes (optional)"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => updateItemField(index, 'quantity', parseFloat(e.target.value) || 0)}
                                                min="0"
                                                step="1"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                value={item.unitPrice}
                                                onChange={(e) => updateItemField(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                                min="0"
                                                step="0.01"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">
                                                {formatCurrency(item.totalAmount, merchantSettings)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => removeItem(index)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}

                    {/* Total */}
                    {state.formData.items.length > 0 && (
                        <div className="flex justify-end mt-4 pt-4 border-t">
                            <div className="text-right">
                                <div className="text-sm text-muted-foreground">Total Credit Amount</div>
                                <div className="text-lg font-bold">
                                    {formatCurrency(getTotalAmount(), merchantSettings)}
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
} 