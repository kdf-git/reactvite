import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Printer, Receipt, Calendar, User, Building, Phone, Mail, MapPin, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useMerchantSettings, formatCurrency } from '@/hooks/useMerchantSettings';
import { extractErrorMessage } from '@/lib/error-utils';
import { invoicesService, paymentModesService } from '@/services/sdk';
import type { InvoicePaymentResponseDto, PaymentModeResponseDto } from '@/lib/sdk';

interface PaymentReceiptState {
    payment: InvoicePaymentResponseDto | null;
    paymentModes: PaymentModeResponseDto[];
    loading: boolean;
    error: string | null;
}

export default function PaymentReceiptPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const merchantSettings = useMerchantSettings();

    const [state, setState] = useState<PaymentReceiptState>({
        payment: null,
        paymentModes: [],
        loading: true,
        error: null,
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

            setState(prev => ({
                ...prev,
                payment,
                paymentModes,
                loading: false
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

    // Handle print
    const handlePrint = () => {
        window.print();
    };

    // Handle download (placeholder for PDF generation)
    const handleDownload = () => {
        toast.info('PDF download feature coming soon');
    };

    // Format date
    const formatDate = (date: Date | string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    // Format time
    const formatTime = (date: Date | string) => {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    // Get payment mode name
    const getPaymentModeName = (paymentModeId?: string) => {
        if (!paymentModeId) return 'Unknown';
        const paymentMode = state.paymentModes.find(pm => pm.id === paymentModeId);
        return paymentMode?.name || 'Unknown';
    };

    // Show loading or error if user is not available
    if (!user) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-muted-foreground">Please log in to view payment receipt</p>
                </div>
            </div>
        );
    }

    if (state.loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-muted-foreground">Loading payment receipt...</p>
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

    const payment = state.payment;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header - Hidden in print */}
            <div className="print:hidden bg-white border-b px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" onClick={() => navigate('/payments')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Payments
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Payment Receipt</h1>
                            <p className="text-muted-foreground">
                                {payment.invoice?.customer?.name || 'Walk-in Customer'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={handleDownload}>
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                        </Button>
                        <Button variant="outline" onClick={handlePrint}>
                            <Printer className="mr-2 h-4 w-4" />
                            Print
                        </Button>
                        <Button onClick={() => navigate(`/payments/edit/${payment.id}`)}>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Edit Payment
                        </Button>
                    </div>
                </div>
            </div>

            {/* Receipt Content */}
            <div className="max-w-4xl mx-auto p-6 print:p-0 print:max-w-none">
                <Card className="print:shadow-none print:border-none">
                    <CardContent className="p-8 print:p-6">
                        {/* Company Header */}
                        <div className="flex justify-between items-start mb-8">
                            <div className="flex items-center gap-4">
                                {payment.invoice?.merchant?.logo && (
                                    <img
                                        src={payment.invoice.merchant.logo}
                                        alt="Company Logo"
                                        className="h-16 w-16 object-contain"
                                    />
                                )}
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">
                                        {payment.invoice?.merchant?.name || 'Company Name'}
                                    </h1>
                                    <p className="text-gray-600">Fuel Station & Services</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">PAYMENT RECEIPT</h2>
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-600">Receipt Number</p>
                                    <p className="text-lg font-mono font-semibold">PAY-{payment.id.slice(-8).toUpperCase()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Payment Status Badge */}
                        <div className="flex gap-2 mb-6">
                            <Badge className="bg-green-100 text-green-800">
                                PAYMENT RECEIVED
                            </Badge>
                        </div>

                        {/* Payment Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            {/* Customer Information */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                    <User className="mr-2 h-5 w-5" />
                                    Customer Information
                                </h3>
                                <div className="space-y-2">
                                    <p className="font-semibold text-gray-900">
                                        {payment.invoice?.customer?.name || 'Walk-in Customer'}
                                    </p>
                                    {payment.invoice?.customer?.contactPerson && (
                                        <p className="text-gray-600">
                                            Attn: {payment.invoice.customer.contactPerson}
                                        </p>
                                    )}
                                    {payment.invoice?.customer?.address && (
                                        <p className="text-gray-600 flex items-start">
                                            <MapPin className="mr-1 h-4 w-4 mt-0.5 flex-shrink-0" />
                                            {payment.invoice.customer.address}
                                        </p>
                                    )}
                                    {payment.invoice?.customer?.phone && (
                                        <p className="text-gray-600 flex items-center">
                                            <Phone className="mr-1 h-4 w-4" />
                                            {payment.invoice.customer.phone}
                                        </p>
                                    )}
                                    {payment.invoice?.customer?.email && (
                                        <p className="text-gray-600 flex items-center">
                                            <Mail className="mr-1 h-4 w-4" />
                                            {payment.invoice.customer.email}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Payment Details */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                    <Receipt className="mr-2 h-5 w-5" />
                                    Payment Details
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Payment Date:</span>
                                        <span className="font-medium">{formatDate(payment.paymentDate)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Payment Time:</span>
                                        <span className="font-medium">{formatTime(payment.paymentDate)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Payment Method:</span>
                                        <span className="font-medium">{getPaymentModeName(payment.paymentModeId)}</span>
                                    </div>
                                    {payment.referenceNumber && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Reference Number:</span>
                                            <span className="font-medium font-mono">{payment.referenceNumber}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Currency:</span>
                                        <span className="font-medium">{payment.invoice?.currencyCode || merchantSettings.currency}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator className="my-8" />

                        {/* Invoice Information */}
                        {payment.invoice && (
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Invoice</h3>
                                <div className="bg-gray-50 p-6 rounded-lg">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-600">Invoice Number</p>
                                            <p className="font-semibold text-gray-900">{payment.invoice.invoiceNumber}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Invoice Date</p>
                                            <p className="font-medium text-gray-900">{formatDate(payment.invoice.invoiceDate)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Invoice Total</p>
                                            <p className="font-medium text-gray-900">{formatCurrency(payment.invoice.totalAmount, merchantSettings)}</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex justify-end">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => navigate(`/invoices/view/${payment.invoice?.id}`)}
                                        >
                                            View Invoice
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Payment Amount Section */}
                        <div className="mb-8">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                                <div className="text-center">
                                    <p className="text-sm text-green-600 mb-2">Amount Received</p>
                                    <p className="text-4xl font-bold text-green-800">
                                        {formatCurrency(payment.amount, merchantSettings)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        {payment.notes && (
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes</h3>
                                <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">
                                    {payment.notes}
                                </p>
                            </div>
                        )}

                        {/* Footer */}
                        <Separator className="my-8" />
                        <div className="text-center text-gray-500 text-sm">
                            <p>Thank you for your payment!</p>
                            {payment.invoice?.branch?.address && (
                                <p className="mt-2">{payment.invoice.branch.address}</p>
                            )}
                            {(payment.invoice?.branch?.phone || payment.invoice?.branch?.email) && (
                                <p className="mt-1">
                                    {payment.invoice.branch.phone && `Tel: ${payment.invoice.branch.phone}`}
                                    {payment.invoice.branch.phone && payment.invoice.branch.email && ' | '}
                                    {payment.invoice.branch.email && `Email: ${payment.invoice.branch.email}`}
                                </p>
                            )}
                            <p className="mt-4 text-xs">
                                Receipt generated on {formatDate(new Date())} at {formatTime(new Date())}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 