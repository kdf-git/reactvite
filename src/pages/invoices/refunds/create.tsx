import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useMerchantSettings, formatCurrency } from '@/hooks/useMerchantSettings';
import { extractErrorMessage } from '@/lib/error-utils';
import { invoicesService, branchesService, customersService } from '@/services/sdk';
import type {
    InvoiceResponseDto,
    CreateInvoiceRefundDto,
    BranchResponseDto,
    CustomerResponseDto
} from '@/lib/sdk';

interface CreateRefundState {
    originalInvoice: InvoiceResponseDto | null;
    branches: BranchResponseDto[];
    customers: CustomerResponseDto[];
    loading: boolean;
    saving: boolean;
    error: string | null;
    formData: {
        refundAmount: number;
        reason: string;
        notes: string;
        isFullRefund: boolean;
    };
}

const REFUND_REASONS = [
    'Customer request',
    'Product defect',
    'Product return',
    'Service issue',
    'Billing error',
    'Cancelled order',
    'Other'
];

export default function CreateRefundPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user } = useAuth();
    const merchantSettings = useMerchantSettings();

    const invoiceId = searchParams.get('invoiceId');

    const [state, setState] = useState<CreateRefundState>({
        originalInvoice: null,
        branches: [],
        customers: [],
        loading: true,
        saving: false,
        error: null,
        formData: {
            refundAmount: 0,
            reason: '',
            notes: '',
            isFullRefund: false
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
                customersService.customerControllerFindAll(merchantId, '', '')
            ]);

            // Check if invoice is fully paid
            const isFullyPaid = invoice.paymentStatus === 'PAID';
            const maxRefundAmount = invoice.amountPaid;

            setState(prev => ({
                ...prev,
                originalInvoice: invoice,
                branches: branches || [],
                customers: customers || [],
                formData: {
                    ...prev.formData,
                    refundAmount: maxRefundAmount,
                    isFullRefund: isFullyPaid
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

    // Handle full refund toggle
    const handleFullRefundToggle = () => {
        setState(prev => {
            const isFullRefund = !prev.formData.isFullRefund;
            const refundAmount = isFullRefund && prev.originalInvoice
                ? prev.originalInvoice.amountPaid
                : 0;

            return {
                ...prev,
                formData: {
                    ...prev.formData,
                    isFullRefund,
                    refundAmount
                }
            };
        });
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (!state.originalInvoice) return;

        // Validation
        if (!state.formData.reason) {
            toast.error('Please select a reason for the refund');
            return;
        }

        if (state.formData.refundAmount <= 0) {
            toast.error('Refund amount must be greater than 0');
            return;
        }

        if (state.formData.refundAmount > state.originalInvoice.amountPaid) {
            toast.error('Refund amount cannot exceed amount paid');
            return;
        }

        try {
            setState(prev => ({ ...prev, saving: true }));

            // Check if this is a full refund
            if (state.formData.isFullRefund || state.formData.refundAmount === state.originalInvoice.amountPaid) {
                // Use the full refund endpoint
                await invoicesService.invoiceControllerProcessFullRefund(
                    state.originalInvoice.id,
                    {
                        reason: state.formData.reason,
                        notes: state.formData.notes
                    }
                );
            } else {
                // Use the partial refund endpoint
                const refundData: CreateInvoiceRefundDto = {
                    amount: state.formData.refundAmount,
                    reason: state.formData.reason,
                    notes: state.formData.notes
                };

                await invoicesService.invoiceControllerCreateRefund(state.originalInvoice.id, refundData);
            }

            toast.success('Refund created successfully');
            navigate(`/invoices/refunds`);
        } catch (error: any) {
            console.error('Failed to create refund:', error);
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

    // Check if invoice can be refunded
    const canRefund = state.originalInvoice.paymentStatus === 'PAID' || state.originalInvoice.amountPaid > 0;
    const maxRefundAmount = state.originalInvoice.amountPaid;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={() => navigate('/invoices/refunds')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Refunds
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Create Refund</h1>
                        <p className="text-muted-foreground">
                            For Invoice: {state.originalInvoice.invoiceNumber}
                        </p>
                    </div>
                </div>
                <Button onClick={handleSubmit} disabled={state.saving || !canRefund}>
                    <Save className="mr-2 h-4 w-4" />
                    {state.saving ? 'Creating...' : 'Create Refund'}
                </Button>
            </div>

            {/* Warning for unpaid or partially paid invoices */}
            {!canRefund && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Cannot Create Refund</AlertTitle>
                    <AlertDescription>
                        This invoice has not been paid yet or has no payment amount to refund.
                        Only paid invoices or invoices with payments can be refunded.
                    </AlertDescription>
                </Alert>
            )}

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
                        <Label className="text-sm font-medium text-muted-foreground">Total Amount</Label>
                        <p className="text-sm font-medium">
                            {formatCurrency(state.originalInvoice.totalAmount, merchantSettings)}
                        </p>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-muted-foreground">Amount Paid</Label>
                        <p className="text-sm font-medium text-green-600">
                            {formatCurrency(state.originalInvoice.amountPaid, merchantSettings)}
                        </p>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-muted-foreground">Payment Status</Label>
                        <p className="text-sm">{state.originalInvoice.paymentStatus}</p>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-muted-foreground">Invoice Date</Label>
                        <p className="text-sm">
                            {new Date(state.originalInvoice.invoiceDate).toLocaleDateString()}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Refund Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Refund Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="reason">Reason for Refund</Label>
                            <Select
                                value={state.formData.reason}
                                onValueChange={(value) => updateFormField('reason', value)}
                                disabled={!canRefund}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a reason" />
                                </SelectTrigger>
                                <SelectContent>
                                    {REFUND_REASONS.map((reason) => (
                                        <SelectItem key={reason} value={reason}>
                                            {reason}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="refundAmount">Refund Amount</Label>
                            <div className="space-y-2">
                                <Input
                                    id="refundAmount"
                                    type="number"
                                    value={state.formData.refundAmount}
                                    onChange={(e) => updateFormField('refundAmount', parseFloat(e.target.value) || 0)}
                                    min="0"
                                    max={maxRefundAmount}
                                    step="0.01"
                                    disabled={!canRefund || state.formData.isFullRefund}
                                />
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="fullRefund"
                                        checked={state.formData.isFullRefund}
                                        onChange={handleFullRefundToggle}
                                        disabled={!canRefund}
                                        className="h-4 w-4"
                                    />
                                    <Label htmlFor="fullRefund" className="text-sm">
                                        Full refund ({formatCurrency(maxRefundAmount, merchantSettings)})
                                    </Label>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Maximum refundable amount: {formatCurrency(maxRefundAmount, merchantSettings)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Textarea
                            id="notes"
                            placeholder="Additional notes about this refund..."
                            value={state.formData.notes}
                            onChange={(e) => updateFormField('notes', e.target.value)}
                            disabled={!canRefund}
                        />
                    </div>

                    {/* Refund Summary */}
                    {canRefund && state.formData.refundAmount > 0 && (
                        <div className="mt-6 p-4 bg-muted rounded-lg">
                            <h4 className="font-medium mb-2">Refund Summary</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Refund Type:</span>
                                    <span className="ml-2 font-medium">
                                        {state.formData.isFullRefund || state.formData.refundAmount === maxRefundAmount
                                            ? 'Full Refund'
                                            : 'Partial Refund'
                                        }
                                    </span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Refund Amount:</span>
                                    <span className="ml-2 font-medium text-green-600">
                                        {formatCurrency(state.formData.refundAmount, merchantSettings)}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Remaining Balance:</span>
                                    <span className="ml-2 font-medium">
                                        {formatCurrency(maxRefundAmount - state.formData.refundAmount, merchantSettings)}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Status:</span>
                                    <span className="ml-2 font-medium text-yellow-600">
                                        Pending Approval
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
} 