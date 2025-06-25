import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { invoicesService, paymentModesService } from '@/services/sdk';
import type { InvoicePaymentResponseDto, PaymentModeResponseDto, UpdateInvoicePaymentDto } from '@/lib/sdk';

interface EditPaymentState {
    payment: InvoicePaymentResponseDto | null;
    paymentModes: PaymentModeResponseDto[];
    loading: boolean;
    saving: boolean;
    error: string | null;
    form: {
        amount: number;
        paymentModeId: string;
        paymentDate: string;
        referenceNumber: string;
        notes: string;
    };
}

export default function EditPaymentPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const merchantSettings = useMerchantSettings();

    const [state, setState] = useState<EditPaymentState>({
        payment: null,
        paymentModes: [],
        loading: true,
        saving: false,
        error: null,
        form: {
            amount: 0,
            paymentModeId: '',
            paymentDate: new Date().toISOString().split('T')[0],
            referenceNumber: '',
            notes: '',
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

    // Load payment data
    const loadPayment = async () => {
        if (!id) {
            setState(prev => ({ ...prev, error: 'Payment ID not provided', loading: false }));
            return;
        }

        try {
            setState(prev => ({ ...prev, loading: true, error: null }));

            const merchantId = getMerchantId();
            if (!merchantId) {
                throw new Error('Merchant ID not found');
            }

            // Load payment and payment modes in parallel
            const [payment, paymentModes] = await Promise.all([
                invoicesService.invoiceControllerGetPayment(id),
                paymentModesService.paymentModeControllerFindAll(merchantId)
            ]);

            // Initialize form with payment data
            const paymentDate = new Date(payment.paymentDate);
            const formattedDate = paymentDate.toISOString().split('T')[0];

            setState(prev => ({
                ...prev,
                payment,
                paymentModes,
                loading: false,
                form: {
                    amount: payment.amount,
                    paymentModeId: payment.paymentModeId || '',
                    paymentDate: formattedDate,
                    referenceNumber: payment.referenceNumber || '',
                    notes: payment.notes || '',
                }
            }));
        } catch (error: any) {
            console.error('Failed to load payment:', error);
            const errorMessage = extractErrorMessage(error);
            setState(prev => ({ ...prev, error: errorMessage, loading: false }));
            toast.error(errorMessage);
        }
    };

    useEffect(() => {
        loadPayment();
    }, [id]);

    // Handle form field changes
    const handleFormChange = (field: string, value: any) => {
        setState(prev => ({
            ...prev,
            form: { ...prev.form, [field]: value }
        }));
    };

    // Handle save payment
    const handleSavePayment = async () => {
        if (!state.payment) return;

        try {
            setState(prev => ({ ...prev, saving: true }));

            const updateData: UpdateInvoicePaymentDto = {
                amount: state.form.amount,
                paymentModeId: state.form.paymentModeId,
                paymentDate: new Date(state.form.paymentDate),
                referenceNumber: state.form.referenceNumber || undefined,
                notes: state.form.notes || undefined,
            };

            await invoicesService.invoiceControllerUpdatePayment(state.payment.id, updateData);
            toast.success('Payment updated successfully');
            navigate(`/payments/receipt/${state.payment.id}`);
        } catch (error: any) {
            console.error('Failed to update payment:', error);
            const errorMessage = extractErrorMessage(error);
            toast.error(errorMessage);
            setState(prev => ({ ...prev, saving: false }));
        }
    };

    // Validate form
    const isFormValid = () => {
        return (
            state.form.amount > 0 &&
            state.form.paymentModeId &&
            state.form.paymentDate
        );
    };

    // Show loading or error if user is not available
    if (!user) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-muted-foreground">Please log in to edit payment</p>
                </div>
            </div>
        );
    }

    if (state.loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-muted-foreground">Loading payment...</p>
                </div>
            </div>
        );
    }

    if (state.error || !state.payment) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-destructive">{state.error || 'Payment not found'}</p>
                    <Button variant="outline" onClick={() => navigate('/payments')} className="mt-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Payments
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
                    <Button variant="outline" onClick={() => navigate('/payments')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Payments
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Edit Payment</h1>
                        <p className="text-muted-foreground">
                            Invoice: {state.payment.invoice?.invoiceNumber} | Customer: {state.payment.invoice?.customer?.name || 'Walk-in Customer'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => navigate(`/payments/receipt/${state.payment?.id}`)}
                    >
                        View Receipt
                    </Button>
                    <Button
                        onClick={handleSavePayment}
                        disabled={!isFormValid() || state.saving}
                    >
                        <Save className="mr-2 h-4 w-4" />
                        {state.saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>

            {/* Payment Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <CreditCard className="mr-2 h-5 w-5" />
                        Payment Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Amount */}
                        <div className="space-y-2">
                            <Label htmlFor="amount">Payment Amount *</Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                min="0"
                                value={state.form.amount}
                                onChange={(e) => handleFormChange('amount', parseFloat(e.target.value) || 0)}
                                placeholder="Enter payment amount"
                            />
                        </div>

                        {/* Payment Mode */}
                        <div className="space-y-2">
                            <Label htmlFor="paymentMode">Payment Method *</Label>
                            <Select
                                value={state.form.paymentModeId}
                                onValueChange={(value) => handleFormChange('paymentModeId', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select payment method" />
                                </SelectTrigger>
                                <SelectContent>
                                    {state.paymentModes.map((mode) => (
                                        <SelectItem key={mode.id} value={mode.id}>
                                            {mode.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Payment Date */}
                        <div className="space-y-2">
                            <Label htmlFor="paymentDate">Payment Date *</Label>
                            <Input
                                id="paymentDate"
                                type="date"
                                value={state.form.paymentDate}
                                onChange={(e) => handleFormChange('paymentDate', e.target.value)}
                            />
                        </div>

                        {/* Reference Number */}
                        <div className="space-y-2">
                            <Label htmlFor="referenceNumber">Reference Number</Label>
                            <Input
                                id="referenceNumber"
                                value={state.form.referenceNumber}
                                onChange={(e) => handleFormChange('referenceNumber', e.target.value)}
                                placeholder="Enter reference number (optional)"
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            value={state.form.notes}
                            onChange={(e) => handleFormChange('notes', e.target.value)}
                            placeholder="Enter any additional notes (optional)"
                            rows={3}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Invoice Information */}
            {state.payment.invoice && (
                <Card>
                    <CardHeader>
                        <CardTitle>Related Invoice</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Invoice Number</Label>
                                <p className="font-semibold">{state.payment.invoice.invoiceNumber}</p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Invoice Total</Label>
                                <p className="font-medium">{formatCurrency(state.payment.invoice.totalAmount, merchantSettings)}</p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Amount Paid</Label>
                                <p className="font-medium text-green-600">{formatCurrency(state.payment.invoice.amountPaid, merchantSettings)}</p>
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/invoices/view/${state.payment.invoice?.id}`)}
                            >
                                View Invoice
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
} 