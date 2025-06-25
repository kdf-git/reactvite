import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Printer, CreditCard, FileText, Calendar, User, Building, Phone, Mail, MapPin, MinusCircle, PlusCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
import { extractErrorMessage } from '@/lib/error-utils';
import { invoicesService } from '@/services/sdk';
import type { InvoiceResponseDto, CreditNoteResponseDto } from '@/lib/sdk';

interface InvoiceViewState {
    invoice: InvoiceResponseDto | null;
    creditNotes: CreditNoteResponseDto[];
    loading: boolean;
    loadingCreditNotes: boolean;
    error: string | null;
}

export default function InvoiceViewPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const merchantSettings = useMerchantSettings();

    // Check if merchant is Kenyan (only credit notes supported for Kenya)
    const isKenyanMerchant = user?.merchant?.country === 'KE';

    const [state, setState] = useState<InvoiceViewState>({
        invoice: null,
        creditNotes: [],
        loading: true,
        loadingCreditNotes: false,
        error: null,
    });

    // Load invoice data
    const loadInvoice = async () => {
        if (!id) {
            setState(prev => ({ ...prev, error: 'Invoice ID not provided', loading: false }));
            return;
        }

        try {
            setState(prev => ({ ...prev, loading: true, error: null }));
            const invoice = await invoicesService.invoiceControllerGetInvoice(id);
            setState(prev => ({ ...prev, invoice, loading: false }));

            // Load credit notes for this invoice
            loadCreditNotes(id);
        } catch (error: any) {
            console.error('Failed to load invoice:', error);
            const errorMessage = extractErrorMessage(error);
            setState(prev => ({ ...prev, error: errorMessage, loading: false }));
            toast.error(errorMessage);
        }
    };

    // Load credit notes for the invoice
    const loadCreditNotes = async (invoiceId: string) => {
        try {
            setState(prev => ({ ...prev, loadingCreditNotes: true }));
            const creditNotes = await invoicesService.invoiceControllerGetCreditNotes(undefined, undefined, undefined, undefined, undefined, invoiceId);
            setState(prev => ({ ...prev, creditNotes, loadingCreditNotes: false }));
        } catch (error: any) {
            console.error('Failed to load credit notes:', error);
            setState(prev => ({ ...prev, creditNotes: [], loadingCreditNotes: false }));
            // Don't show error toast for credit notes as they might not exist
        }
    };

    useEffect(() => {
        loadInvoice();
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

    // Get status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DRAFT': return 'bg-gray-100 text-gray-800';
            case 'ISSUED': return 'bg-blue-100 text-blue-800';
            case 'PAID': return 'bg-green-100 text-green-800';
            case 'PARTIAL': return 'bg-yellow-100 text-yellow-800';
            case 'OVERDUE': return 'bg-red-100 text-red-800';
            case 'VOID': return 'bg-red-100 text-red-800';
            case 'CANCELLED': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Get payment status color
    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case 'UNPAID': return 'bg-red-100 text-red-800';
            case 'PARTIAL': return 'bg-yellow-100 text-yellow-800';
            case 'PAID': return 'bg-green-100 text-green-800';
            case 'OVERPAID': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Check if invoice is overdue
    const isOverdue = (invoice: InvoiceResponseDto) => {
        if (!invoice.dueDate || invoice.paymentStatus === 'PAID') return false;
        return new Date(invoice.dueDate) < new Date() && invoice.paymentStatus !== 'PAID';
    };

    // Show loading or error if user is not available
    if (!user) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-muted-foreground">Please log in to view invoice</p>
                </div>
            </div>
        );
    }

    if (state.loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-muted-foreground">Loading invoice...</p>
                </div>
            </div>
        );
    }

    if (state.error || !state.invoice) {
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

    const invoice = state.invoice;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header - Hidden in print */}
            <div className="print:hidden bg-white border-b px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" onClick={() => navigate('/invoices')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Invoices
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Invoice {invoice.invoiceNumber}</h1>
                            <p className="text-muted-foreground">
                                {invoice.customer?.name || 'Walk-in Customer'}
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
                        {invoice.paymentStatus !== 'PAID' && (
                            <Button onClick={() => navigate(`/invoices?recordPayment=${invoice.id}`)}>
                                <CreditCard className="mr-2 h-4 w-4" />
                                Record Payment
                            </Button>
                        )}

                        {/* Credit Note, Debit Note, and Refund Actions */}
                        {(invoice.status === 'ISSUED' || invoice.status === 'PAID' || invoice.paymentStatus === 'PAID') && (
                            <>
                                {/* Credit notes now available for both customer sales and quick sales */}
                                <Button
                                    variant="outline"
                                    onClick={() => navigate(`/invoices/credit-notes/create?invoiceId=${invoice.id}`)}
                                >
                                    <MinusCircle className="mr-2 h-4 w-4" />
                                    Credit Note
                                </Button>
                                {/* Hide debit notes and refunds for Kenyan merchants */}
                                {!isKenyanMerchant && (
                                    <>
                                        <Button
                                            variant="outline"
                                            onClick={() => navigate(`/invoices/debit-notes/create?invoiceId=${invoice.id}`)}
                                        >
                                            <PlusCircle className="mr-2 h-4 w-4" />
                                            Debit Note
                                        </Button>
                                        {invoice.paymentStatus === 'PAID' && (
                                            <Button
                                                variant="outline"
                                                onClick={() => navigate(`/invoices/refunds/create?invoiceId=${invoice.id}`)}
                                            >
                                                <RotateCcw className="mr-2 h-4 w-4" />
                                                Refund
                                            </Button>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Invoice Content */}
            <div className="max-w-4xl mx-auto p-6 print:p-0 print:max-w-none">
                <Card className="print:shadow-none print:border-none">
                    <CardContent className="p-8 print:p-6">
                        {/* Company Header */}
                        <div className="flex justify-between items-start mb-8">
                            <div className="flex items-center gap-4">
                                {invoice.merchant?.logo && (
                                    <img
                                        src={invoice.merchant.logo}
                                        alt="Company Logo"
                                        className="h-16 w-16 object-contain"
                                    />
                                )}
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">
                                        {invoice.merchant?.name || 'Company Name'}
                                    </h1>
                                    {invoice.merchant?.address && (
                                        <p className="text-gray-600 text-sm mt-0.5">
                                            {invoice.merchant.address}
                                        </p>
                                    )}
                                    {invoice.merchant?.contactPhone && (
                                        <p className="text-gray-600 text-sm mt-0.5">
                                            {invoice.merchant.contactPhone}
                                        </p>
                                    )}
                                    {invoice.merchant?.contactEmail && (
                                        <p className="text-gray-600 text-sm mt-0.5">
                                            {invoice.merchant.contactEmail}
                                        </p>
                                    )}
                                    {invoice.merchant?.taxIdentifier && (
                                        <p className="text-gray-600 text-sm mt-0.5">
                                            TIN: {invoice.merchant.taxIdentifier}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="text-right">
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h2>
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-600">Invoice Number</p>
                                    <p className="text-lg font-mono font-semibold">{invoice.invoiceNumber}</p>
                                </div>
                            </div>
                        </div>

                        {/* Status Badges */}
                        <div className="flex gap-2 mb-6">
                            <Badge className={getStatusColor(invoice.status)}>
                                {invoice.status}
                            </Badge>
                            <Badge className={getPaymentStatusColor(invoice.paymentStatus)}>
                                {invoice.paymentStatus}
                            </Badge>
                            {isOverdue(invoice) && (
                                <Badge className="bg-red-100 text-red-800">
                                    OVERDUE
                                </Badge>
                            )}
                        </div>

                        {/* Invoice Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            {/* Bill To */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                    Bill To
                                </h3>
                                <div className="space-y-1">
                                    <p className="font-semibold text-gray-900">
                                        {invoice.customer?.name || 'Walk-in Customer'}
                                    </p>
                                    {invoice.customer?.contactPerson && (
                                        <p className="text-gray-600 text-sm">
                                            Attn: {invoice.customer.contactPerson}
                                        </p>
                                    )}
                                    {invoice.customer?.address && (
                                        <p className="text-gray-600 text-sm">
                                            {invoice.customer.address}
                                        </p>
                                    )}
                                    {invoice.customer?.phone && (
                                        <p className="text-gray-600 text-sm">
                                            {invoice.customer.phone}
                                        </p>
                                    )}
                                    {invoice.customer?.email && (
                                        <p className="text-gray-600 text-sm">
                                            {invoice.customer.email}
                                        </p>
                                    )}
                                    {(invoice.customer?.taxIdentifier || invoice.customer?.kraPin) && (
                                        <p className="text-gray-600 text-sm">
                                            TIN: {invoice.customer.kraPin || invoice.customer.taxIdentifier}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Invoice Info */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                    Invoice Details
                                </h3>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Invoice Date:</span>
                                        <span className="font-medium">{formatDate(invoice.invoiceDate)}</span>
                                    </div>
                                    {invoice.dueDate && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Due Date:</span>
                                            <span className={`font-medium ${isOverdue(invoice) ? 'text-red-600' : ''}`}>
                                                {formatDate(invoice.dueDate)}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Branch:</span>
                                        <span className="font-medium">{invoice.branch?.name || 'Main Branch'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Currency:</span>
                                        <span className="font-medium">{invoice.currencyCode || merchantSettings.currency}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator className="my-8" />

                        {/* Invoice Items */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Items</h3>
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-gray-200">
                                        <TableHead className="text-left font-semibold text-gray-900">Description</TableHead>
                                        <TableHead className="text-center font-semibold text-gray-900">Qty</TableHead>
                                        <TableHead className="text-right font-semibold text-gray-900">Unit Price</TableHead>
                                        <TableHead className="text-right font-semibold text-gray-900">Discount</TableHead>
                                        <TableHead className="text-right font-semibold text-gray-900">Tax</TableHead>
                                        <TableHead className="text-right font-semibold text-gray-900">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {invoice.items?.map((item) => (
                                        <TableRow key={item.id} className="border-gray-200">
                                            <TableCell className="py-4">
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {item.product?.kraTaxType?.code && (
                                                            <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-xs mr-2">
                                                                {item.product.kraTaxType.code}
                                                            </span>
                                                        )}
                                                        {item.product?.name || item.description || 'Unknown Item'}
                                                    </p>
                                                    {item.product?.code && (
                                                        <p className="text-sm text-gray-500">
                                                            Code: {item.product.code}
                                                        </p>
                                                    )}
                                                    {item.description && item.product?.name && (
                                                        <p className="text-sm text-gray-500">
                                                            {item.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center py-4">
                                                {item.quantity}
                                            </TableCell>
                                            <TableCell className="text-right py-4">
                                                {item.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell className="text-right py-4">
                                                {item.discountAmount > 0 ? (
                                                    <span className="text-green-600">
                                                        -{item.discountAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right py-4">
                                                {item.taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell className="text-right py-4 font-medium">
                                                {item.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Totals Section */}
                        <div className="mb-8 space-y-6">
                            {/* Summary Totals and VAT Analysis */}
                            <div className="grid grid-cols-2 gap-8">
                                {/* VAT Breakdown Table */}
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">VAT Analysis</h4>
                                    <div className="text-xs">
                                        <table className="w-full border-collapse border border-gray-200">
                                            <thead>
                                                <tr className="bg-gray-50">
                                                    <th className="border border-gray-200 px-2 py-1 text-left font-semibold">Tax Type</th>
                                                    <th className="border border-gray-200 px-2 py-1 text-center font-semibold">Code</th>
                                                    <th className="border border-gray-200 px-2 py-1 text-center font-semibold">Rate</th>
                                                    <th className="border border-gray-200 px-2 py-1 text-right font-semibold">Taxable Amt</th>
                                                    <th className="border border-gray-200 px-2 py-1 text-right font-semibold">VAT</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(() => {
                                                    // Calculate VAT breakdown
                                                    const vatBreakdown = {
                                                        'A': { name: 'Exempted', rate: 0, taxableAmount: 0, vatAmount: 0 },
                                                        'B': { name: 'VAT 16%', rate: 16, taxableAmount: 0, vatAmount: 0 },
                                                        'C': { name: 'Zero Rated', rate: 0, taxableAmount: 0, vatAmount: 0 },
                                                        'D': { name: 'Non Vatable', rate: 0, taxableAmount: 0, vatAmount: 0 },
                                                        'E': { name: 'VAT 8%', rate: 8, taxableAmount: 0, vatAmount: 0 }
                                                    };

                                                    // Calculate amounts for each tax type
                                                    invoice.items?.forEach(item => {
                                                        const taxCode = item.product?.kraTaxType?.code || 'A';
                                                        if (vatBreakdown[taxCode]) {
                                                            vatBreakdown[taxCode].taxableAmount += (item.totalAmount - item.taxAmount);
                                                            vatBreakdown[taxCode].vatAmount += item.taxAmount;
                                                        }
                                                    });

                                                    return Object.entries(vatBreakdown).map(([code, data]) => (
                                                        <tr key={code} className="border-gray-200">
                                                            <td className="border border-gray-200 px-2 py-1">{data.name}</td>
                                                            <td className="border border-gray-200 px-2 py-1 text-center font-mono">{code}</td>
                                                            <td className="border border-gray-200 px-2 py-1 text-center">{data.rate}%</td>
                                                            <td className="border border-gray-200 px-2 py-1 text-right">
                                                                {data.taxableAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                            </td>
                                                            <td className="border border-gray-200 px-2 py-1 text-right">
                                                                {data.vatAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                            </td>
                                                        </tr>
                                                    ));
                                                })()}
                                                <tr className="bg-gray-100 font-semibold">
                                                    <td className="border border-gray-200 px-2 py-1">Total</td>
                                                    <td className="border border-gray-200 px-2 py-1 text-center">-</td>
                                                    <td className="border border-gray-200 px-2 py-1 text-center">-</td>
                                                    <td className="border border-gray-200 px-2 py-1 text-right">
                                                        {(invoice.totalAmount - invoice.taxAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </td>
                                                    <td className="border border-gray-200 px-2 py-1 text-right">
                                                        {invoice.taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Summary Totals */}
                                <div className="flex justify-end">
                                    <div className="w-full max-w-sm space-y-2">
                                        <div className="grid grid-cols-2 gap-8">
                                            <h4 className="font-semibold text-gray-900 text-xs">PayMethod: {invoice.payments?.[0]?.paymentMethod || 'Pending'}</h4>
                                            <div className="flex justify-end">
                                                <h4 className="font-semibold text-gray-900 text-xs">Items: {(invoice.items as any[])?.length || 0}</h4>
                                            </div>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between text-gray-600 text-xs">
                                            <span>Total Amount (Before Discount):</span>
                                            <span>{formatCurrency(invoice.totalAmount - invoice.taxAmount + invoice.discountAmount, merchantSettings)}</span>
                                        </div>
                                        {invoice.discountAmount > 0 && (
                                            <div className="flex justify-between text-green-600 text-xs">
                                                <span>Total Discount:</span>
                                                <span>-{formatCurrency(invoice.discountAmount, merchantSettings)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-gray-600 text-xs">
                                            <span>Total Amount (Without Tax):</span>
                                            <span>{formatCurrency(invoice.totalAmount - invoice.taxAmount, merchantSettings)}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600 text-xs">
                                            <span>Total Tax to be Paid:</span>
                                            <span>{formatCurrency(invoice.taxAmount, merchantSettings)}</span>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between text-sm font-bold text-gray-900">
                                            <span>Total Price to be Paid:</span>
                                            <span>{formatCurrency(invoice.totalAmount, merchantSettings)}</span>
                                        </div>
                                        {invoice.amountPaid > 0 && (
                                            <>
                                                <div className="flex justify-between text-green-600 text-xs">
                                                    <span>Amount Paid:</span>
                                                    <span>{formatCurrency(invoice.amountPaid, merchantSettings)}</span>
                                                </div>
                                                <div className="flex justify-between text-sm font-bold text-orange-600">
                                                    <span>Amount Due:</span>
                                                    <span>{formatCurrency(invoice.totalAmount - invoice.amountPaid, merchantSettings)}</span>
                                                </div>
                                            </>
                                        )}
                                        <Separator />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        {invoice.notes && (
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes</h3>
                                <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">
                                    {invoice.notes}
                                </p>
                            </div>
                        )}

                        {/* SCU INFORMATION */}
                        {invoice.kraSubmitted && (
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">SCU INFORMATION</h3>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* SCU Details */}
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="font-medium text-gray-700">Date Time:</span>
                                                <p className="text-gray-600">
                                                    {(() => {
                                                        // Try to get date from kraSubmissionData first, then fallback to kraSubmittedAt
                                                        const kraData = invoice.kraSubmissionData as any;
                                                        if (kraData?.data?.vsdcRcptPbctDate) {
                                                            // Parse KRA date format: "20250611145049" (YYYYMMDDHHMMSS)
                                                            const dateStr = kraData.data.vsdcRcptPbctDate;
                                                            const year = dateStr.substring(0, 4);
                                                            const month = dateStr.substring(4, 6);
                                                            const day = dateStr.substring(6, 8);
                                                            const hour = dateStr.substring(8, 10);
                                                            const minute = dateStr.substring(10, 12);
                                                            const second = dateStr.substring(12, 14);
                                                            const kraDate = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
                                                            return kraDate.toLocaleString();
                                                        }
                                                        // Fallback to submission date
                                                        return invoice.kraSubmittedAt ? new Date(invoice.kraSubmittedAt).toLocaleString() : '-';
                                                    })()}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">Serial number:</span>
                                                <p className="text-gray-600">
                                                    {(() => {
                                                        const kraData = invoice.kraSubmissionData as any;
                                                        return kraData?.data?.sdcId || invoice.kraSdcId || '-';
                                                    })()}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">Receipt number:</span>
                                                <p className="text-gray-600">
                                                    {(() => {
                                                        const kraData = invoice.kraSubmissionData as any;
                                                        return kraData?.data?.rcptNo || invoice.kraReceiptNumber || '-';
                                                    })()}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">Internal data:</span>
                                                <p className="text-gray-600">
                                                    {(() => {
                                                        const kraData = invoice.kraSubmissionData as any;
                                                        const intrlData = kraData?.data?.intrlData || invoice.kraReceiptSignature || '-';
                                                        // split by dash every 4 characters
                                                        const intrlDataArray = intrlData.match(/.{1,4}/g);
                                                        return intrlDataArray?.join('-') || '-';
                                                    })()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="pt-2">
                                            <span className="font-medium text-gray-700">Receipt signature:</span>
                                            <p className="text-gray-600 break-all">
                                                {(() => {
                                                    const kraData = invoice.kraSubmissionData as any;
                                                    const rcptSign = kraData?.data?.rcptSign || invoice.kraReceiptSignature || '-';
                                                    // split by dash every 4 characters
                                                    const rcptSignArray = rcptSign.match(/.{1,4}/g);
                                                    return rcptSignArray?.join('-') || '-';
                                                })()}
                                            </p>
                                        </div>
                                    </div>

                                    {/* QR Code */}
                                    <div className="flex justify-center items-center">
                                        <div className="text-center">
                                            <div className="w-32 h-32 bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center mb-2">
                                                {(() => {
                                                    try {
                                                        const kraPin = invoice.merchant?.taxIdentifier || '';
                                                        const bhfId = invoice.branch?.kraVscuBhfId || '00'; // KRA branch ID
                                                        const kraData = invoice.kraSubmissionData as any;
                                                        const rcptSignature = kraData?.data?.rcptSign;

                                                        if (kraPin && rcptSignature) {
                                                            const qrData = `https://etims.kra.go.ke/common/link/etims/receipt/indexEtimsReceptData?${kraPin}${bhfId}${rcptSignature}`;

                                                            console.log(qrData);

                                                            return (
                                                                <img
                                                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=128x128&data=${encodeURIComponent(qrData)}`}
                                                                    alt="KRA QR Code"
                                                                    className="w-full h-full"
                                                                />
                                                            );
                                                        }

                                                        return <span className="text-gray-400 text-xs">No QR Data</span>;
                                                    } catch (error) {
                                                        return <span className="text-gray-400 text-xs">QR Error</span>;
                                                    }
                                                })()}
                                            </div>
                                            <p className="text-xs text-gray-500">QR Code</p>
                                            <p className="text-xs text-gray-400 mt-1">Scan for KRA verification</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Footer */}
                        <Separator className="my-8" />
                        <div className="text-center text-gray-500 text-sm">
                            <p>This is a computer-generated invoice and is valid without signature.</p>
                            <p className="mt-2">Thank you for your business!</p>
                            {invoice.branch?.address && (
                                <p className="mt-2">{invoice.branch.address}</p>
                            )}
                            {(invoice.branch?.phone || invoice.branch?.email) && (
                                <p className="mt-1">
                                    {invoice.branch.phone && `Tel: ${invoice.branch.phone}`}
                                    {invoice.branch.phone && invoice.branch.email && ' | '}
                                    {invoice.branch.email && `Email: ${invoice.branch.email}`}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Additional Information Card */}
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Additional Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Payment Information */}
                        {invoice.payments && invoice.payments.length > 0 && (
                            <div className="mb-4">
                                <h3 className="text-base font-semibold text-gray-900 mb-2">Payment History</h3>
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-gray-200">
                                            <TableHead className="py-2 text-xs font-semibold text-gray-900">Date</TableHead>
                                            <TableHead className="py-2 text-xs font-semibold text-gray-900">Method</TableHead>
                                            <TableHead className="py-2 text-xs text-right font-semibold text-gray-900">Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {invoice.payments.map((payment) => (
                                            <TableRow key={payment.id} className="border-gray-200">
                                                <TableCell className="py-2 text-sm">{formatDate(payment.paymentDate)}</TableCell>
                                                <TableCell className="py-2 text-sm">{payment.paymentMethod}</TableCell>
                                                <TableCell className="py-2 text-sm text-right font-medium">
                                                    {formatCurrency(payment.amount, merchantSettings)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}

                        {/* Credit Notes Section */}
                        {state.creditNotes.length > 0 && (
                            <div className="mb-4">
                                <h3 className="text-base font-semibold text-gray-900 mb-2">Credit Notes</h3>
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-gray-200">
                                            <TableHead className="py-2 text-xs font-semibold text-gray-900">Credit Note #</TableHead>
                                            <TableHead className="py-2 text-xs font-semibold text-gray-900">Date</TableHead>
                                            <TableHead className="py-2 text-xs text-right font-semibold text-gray-900">Amount</TableHead>
                                            <TableHead className="py-2 text-xs text-center font-semibold text-gray-900">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {state.creditNotes.map((creditNote) => (
                                            <TableRow key={creditNote.id} className="border-gray-200">
                                                <TableCell className="py-2 text-sm font-medium">
                                                    {creditNote.creditNoteNumber}
                                                </TableCell>
                                                <TableCell className="py-2 text-sm">
                                                    {formatDate(creditNote.creditNoteDate)}
                                                </TableCell>
                                                <TableCell className="py-2 text-sm text-right font-medium">
                                                    {formatCurrency(creditNote.totalAmount, merchantSettings)}
                                                </TableCell>
                                                <TableCell className="py-2 text-sm text-center">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-7 px-2"
                                                        onClick={() => navigate(`/invoices/credit-notes/view/${creditNote.id}`)}
                                                    >
                                                        View
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                {state.loadingCreditNotes && (
                                    <div className="text-center py-2">
                                        <p className="text-xs text-muted-foreground">Loading credit notes...</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 