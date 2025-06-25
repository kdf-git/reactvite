import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Printer, FileText, Calendar, User, Building, Phone, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import type { CreditNoteResponseDto } from '@/lib/sdk';

interface CreditNoteViewState {
    creditNote: CreditNoteResponseDto | null;
    loading: boolean;
    error: string | null;
}

// Credit note reason codes mapping
const CREDIT_NOTE_REASONS = {
    '01': 'Missing Quantity',
    '02': 'Missing Item',
    '03': 'Damaged',
    '04': 'Wasted',
    '05': 'Raw Material Shortage',
    '06': 'Refund',
    '07': 'Wrong Customer PIN',
    '08': 'Wrong Customer name',
    '09': 'Wrong Amount/price',
    '10': 'Wrong Quantity',
    '11': 'Wrong Item(s)',
    '12': 'Wrong tax type',
    '13': 'Other reason'
};

export default function CreditNoteViewPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const merchantSettings = useMerchantSettings();
    const printRef = useRef<HTMLDivElement>(null);

    const [state, setState] = useState<CreditNoteViewState>({
        creditNote: null,
        loading: true,
        error: null,
    });

    // Load credit note data
    const loadCreditNote = async () => {
        if (!id) {
            setState(prev => ({ ...prev, error: 'Credit Note ID not provided', loading: false }));
            return;
        }

        try {
            setState(prev => ({ ...prev, loading: true, error: null }));
            const creditNote = await invoicesService.invoiceControllerGetCreditNote(id);
            setState(prev => ({ ...prev, creditNote, loading: false }));
        } catch (error: any) {
            console.error('Failed to load credit note:', error);
            const errorMessage = extractErrorMessage(error);
            setState(prev => ({ ...prev, error: errorMessage, loading: false }));
            toast.error(errorMessage);
        }
    };

    useEffect(() => {
        loadCreditNote();
    }, [id]);

    // Handle print
    const handlePrint = () => {
        window.print();
    };

    // Handle download as PDF
    const handleDownload = () => {
        if (!printRef.current) {
            toast.error('Content not ready for printing');
            return;
        }

        try {
            // Get the printable content
            const printContent = printRef.current.innerHTML;

            // Create a new window for printing
            const printWindow = window.open('', '_blank', 'width=800,height=600');

            if (!printWindow) {
                toast.error('Please allow popups for PDF download');
                return;
            }

            // Write the content to the new window
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Credit-Note-${state.creditNote?.creditNoteNumber || 'Unknown'}</title>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style>
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        body {
                            font-family: system-ui, -apple-system, sans-serif;
                            line-height: 1.5;
                            color: #1f2937;
                            background: white;
                            padding: 1rem;
                        }
                        .print\\:hidden {
                            display: none !important;
                        }
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            margin: 1rem 0;
                        }
                        th, td {
                            border: 1px solid #d1d5db;
                            padding: 0.5rem;
                            text-align: left;
                        }
                        th {
                            background-color: #f9fafb;
                            font-weight: 600;
                        }
                        .text-right {
                            text-align: right;
                        }
                        .text-center {
                            text-align: center;
                        }
                        .font-bold {
                            font-weight: 700;
                        }
                        .font-semibold {
                            font-weight: 600;
                        }
                        .text-lg {
                            font-size: 1.125rem;
                        }
                        .text-xl {
                            font-size: 1.25rem;
                        }
                        .text-2xl {
                            font-size: 1.5rem;
                        }
                        .text-3xl {
                            font-size: 1.875rem;
                        }
                        .mb-2 { margin-bottom: 0.5rem; }
                        .mb-3 { margin-bottom: 0.75rem; }
                        .mb-4 { margin-bottom: 1rem; }
                        .mb-6 { margin-bottom: 1.5rem; }
                        .mb-8 { margin-bottom: 2rem; }
                        .mt-1 { margin-top: 0.25rem; }
                        .mt-2 { margin-top: 0.5rem; }
                        .mt-4 { margin-top: 1rem; }
                        .p-4 { padding: 1rem; }
                        .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
                        .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
                        .space-y-1 > * + * { margin-top: 0.25rem; }
                        .space-y-2 > * + * { margin-top: 0.5rem; }
                        .space-y-3 > * + * { margin-top: 0.75rem; }
                        .grid {
                            display: grid;
                        }
                        .grid-cols-1 {
                            grid-template-columns: repeat(1, minmax(0, 1fr));
                        }
                        .grid-cols-2 {
                            grid-template-columns: repeat(2, minmax(0, 1fr));
                        }
                        .gap-4 {
                            gap: 1rem;
                        }
                        .gap-6 {
                            gap: 1.5rem;
                        }
                        .gap-8 {
                            gap: 2rem;
                        }
                        .flex {
                            display: flex;
                        }
                        .items-center {
                            align-items: center;
                        }
                        .items-start {
                            align-items: flex-start;
                        }
                        .justify-between {
                            justify-content: space-between;
                        }
                        .justify-center {
                            justify-content: center;
                        }
                        .justify-end {
                            justify-content: flex-end;
                        }
                        .text-gray-900 {
                            color: #111827;
                        }
                        .text-gray-700 {
                            color: #374151;
                        }
                        .text-gray-600 {
                            color: #4b5563;
                        }
                        .text-gray-500 {
                            color: #6b7280;
                        }
                        .text-gray-400 {
                            color: #9ca3af;
                        }
                        .text-green-600 {
                            color: #059669;
                        }
                        .bg-gray-50 {
                            background-color: #f9fafb;
                        }
                        .bg-gray-100 {
                            background-color: #f3f4f6;
                        }
                        .rounded-lg {
                            border-radius: 0.5rem;
                        }
                        .border {
                            border-width: 1px;
                        }
                        .border-gray-200 {
                            border-color: #e5e7eb;
                        }
                        .border-gray-300 {
                            border-color: #d1d5db;
                        }
                        .border-dashed {
                            border-style: dashed;
                        }
                        .border-2 {
                            border-width: 2px;
                        }
                        .w-32 {
                            width: 8rem;
                        }
                        .h-32 {
                            width: 8rem;
                        }
                        .h-16 {
                            height: 4rem;
                        }
                        .w-16 {
                            width: 4rem;
                        }
                        .w-full {
                            width: 100%;
                        }
                        .h-full {
                            height: 100%;
                        }
                        .max-w-sm {
                            max-width: 24rem;
                        }
                        .object-contain {
                            object-fit: contain;
                        }
                        .break-all {
                            word-break: break-all;
                        }
                        .text-xs {
                            font-size: 0.75rem;
                        }
                        .text-sm {
                            font-size: 0.875rem;
                        }
                        .font-mono {
                            font-family: ui-monospace, SFMono-Regular, monospace;
                        }
                        .font-medium {
                            font-weight: 500;
                        }
                        .separator {
                            height: 1px;
                            background-color: #e5e7eb;
                            margin: 1rem 0;
                        }
                        .badge {
                            display: inline-flex;
                            align-items: center;
                            border-radius: 0.375rem;
                            padding: 0.25rem 0.75rem;
                            font-size: 0.75rem;
                            font-weight: 500;
                            background-color: #dbeafe;
                            color: #1e40af;
                        }
                        .badge.success {
                            background-color: #dcfce7;
                            color: #166534;
                        }
                        .badge.warning {
                            background-color: #fef3c7;
                            color: #92400e;
                        }
                        .badge.error {
                            background-color: #fee2e2;
                            color: #991b1b;
                        }
                        @media print {
                            body {
                                padding: 0;
                            }
                        }
                    </style>
                </head>
                <body>
                    ${printContent}
                </body>
                </html>
            `);

            printWindow.document.close();

            // Wait for content to load, then print
            printWindow.onload = () => {
                setTimeout(() => {
                    printWindow.focus();
                    printWindow.print();

                    // Close window after printing
                    setTimeout(() => {
                        printWindow.close();
                    }, 100);
                }, 250);
            };

            toast.success('Opening PDF download dialog...');

        } catch (error) {
            console.error('Print error:', error);
            toast.error('Failed to generate PDF. Please try again.');
        }
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
            case 'CREDIT_NOTE': return 'bg-green-100 text-green-800';
            case 'VOID': return 'bg-red-100 text-red-800';
            case 'CANCELLED': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Get reason description from code
    const getReasonDescription = (reasonCode: string) => {
        return CREDIT_NOTE_REASONS[reasonCode as keyof typeof CREDIT_NOTE_REASONS] || reasonCode;
    };

    // Show loading or error if user is not available
    if (!user) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-muted-foreground">Please log in to view credit note</p>
                </div>
            </div>
        );
    }

    if (state.loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-muted-foreground">Loading credit note...</p>
                </div>
            </div>
        );
    }

    if (state.error || !state.creditNote) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-destructive">{state.error || 'Credit note not found'}</p>
                    <Button variant="outline" onClick={() => navigate('/invoices/credit-notes')} className="mt-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Credit Notes
                    </Button>
                </div>
            </div>
        );
    }

    const creditNote = state.creditNote;

    return (

        <div className="min-h-screen bg-gray-50">
            {/* Header - Hidden in print */}
            <div className="print:hidden bg-white border-b px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" onClick={() => navigate('/invoices/credit-notes')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Credit Notes
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Credit Note {creditNote.creditNoteNumber}</h1>
                            <p className="text-muted-foreground">
                                {(creditNote.customer as any)?.name || 'Walk-in Customer'}
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
                    </div>
                </div>
            </div>

            {/* Credit Note Content */}
            <div className="max-w-4xl mx-auto p-6 print:p-0 print:max-w-none">
                <Card className="print:shadow-none print:border-none" ref={printRef}>
                    <CardContent className="p-8 print:p-6">
                        {/* Company Header */}
                        <div className="flex justify-between items-start mb-8">
                            <div className="flex items-center gap-4">
                                {(creditNote.merchant as any)?.logo && (
                                    <img
                                        src={(creditNote.merchant as any).logo}
                                        alt="Company Logo"
                                        className="h-16 w-16 object-contain"
                                    />
                                )}
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">
                                        {(creditNote.merchant as any)?.name || 'Company Name'}
                                    </h1>
                                    {(creditNote.merchant as any)?.address && (
                                        <p className="text-gray-600 text-sm mt-0.5">
                                            {(creditNote.merchant as any).address}
                                        </p>
                                    )}
                                    {(creditNote.merchant as any)?.contactPhone && (
                                        <p className="text-gray-600 text-sm mt-0.5">
                                            {(creditNote.merchant as any).contactPhone}
                                        </p>
                                    )}
                                    {(creditNote.merchant as any)?.contactEmail && (
                                        <p className="text-gray-600 text-sm mt-0.5">
                                            {(creditNote.merchant as any).contactEmail}
                                        </p>
                                    )}
                                    {(creditNote.merchant as any)?.taxIdentifier && (
                                        <p className="text-gray-600 text-sm mt-0.5">
                                            TIN: {(creditNote.merchant as any).taxIdentifier}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="text-right">
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">CREDIT NOTE</h2>
                                <div className="space-y-2">
                                    <div>
                                        <p className="text-sm text-gray-600">Credit Note Number</p>
                                        <p className="text-lg font-mono font-semibold">{creditNote.creditNoteNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Original Invoice</p>
                                        <p className="text-md font-mono font-medium">{(creditNote.originalInvoice as any)?.invoiceNumber || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex gap-2 mb-6">
                            <Badge className={getStatusColor(creditNote.status)}>
                                {creditNote.status === 'CREDIT_NOTE' ? 'Credit Note' : creditNote.status}
                            </Badge>
                        </div>

                        {/* Credit Note Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            {/* Bill To */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                    Credit To
                                </h3>
                                <div className="space-y-1">
                                    <p className="font-semibold text-gray-900">
                                        {(creditNote.customer as any)?.name || 'Walk-in Customer'}
                                    </p>
                                    {(creditNote.customer as any)?.contactPerson && (
                                        <p className="text-gray-600 text-sm">
                                            Attn: {(creditNote.customer as any).contactPerson}
                                        </p>
                                    )}
                                    {(creditNote.customer as any)?.address && (
                                        <p className="text-gray-600 text-sm">
                                            {(creditNote.customer as any).address}
                                        </p>
                                    )}
                                    {(creditNote.customer as any)?.phone && (
                                        <p className="text-gray-600 text-sm">
                                            {(creditNote.customer as any).phone}
                                        </p>
                                    )}
                                    {(creditNote.customer as any)?.email && (
                                        <p className="text-gray-600 text-sm">
                                            {(creditNote.customer as any).email}
                                        </p>
                                    )}
                                    {((creditNote.customer as any)?.taxIdentifier || (creditNote.customer as any)?.kraPin) && (
                                        <p className="text-gray-600 text-sm">
                                            TIN: {(creditNote.customer as any)?.kraPin || (creditNote.customer as any)?.taxIdentifier}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Credit Note Info */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                    Credit Note Details
                                </h3>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Credit Note Date:</span>
                                        <span className="font-medium">{formatDate(creditNote.creditNoteDate)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Original Invoice:</span>
                                        <span className="font-medium">{(creditNote.originalInvoice as any)?.invoiceNumber || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Branch:</span>
                                        <span className="font-medium">{(creditNote.branch as any)?.name || 'Main Branch'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Currency:</span>
                                        <span className="font-medium">{creditNote.currencyCode || merchantSettings.currency}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator className="my-8" />

                        {/* Reason for Credit Note */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Credit Note Information</h3>
                            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                                <div>
                                    <span className="font-medium text-gray-700">Original Invoice Number: </span>
                                    <span className="font-mono font-semibold text-gray-900">
                                        {(creditNote.originalInvoice as any)?.invoiceNumber || 'N/A'}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Reason: </span>
                                    <span className="text-gray-900">
                                        {getReasonDescription(creditNote.reason)}
                                        {creditNote.reason !== getReasonDescription(creditNote.reason) && (
                                            <span className="text-gray-500 text-sm ml-2">({creditNote.reason})</span>
                                        )}
                                    </span>
                                </div>
                            </div>
                            {creditNote.notes && (
                                <div className="mt-4">
                                    <h4 className="text-md font-semibold text-gray-900 mb-2">Additional Notes</h4>
                                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{creditNote.notes}</p>
                                </div>
                            )}
                        </div>

                        {/* Credit Note Items */}
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
                                    {(creditNote.items as any[])?.map((item: any) => (
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
                                                    (creditNote.items as any[])?.forEach(item => {
                                                        const taxCode = item.product?.kraTaxType?.code || 'A';
                                                        if (vatBreakdown[taxCode]) {
                                                            vatBreakdown[taxCode].taxableAmount += (item.totalAmount - item.taxAmount);
                                                            vatBreakdown[taxCode].vatAmount += item.taxAmount;
                                                        }
                                                    });

                                                    return Object.entries(vatBreakdown).map(([code, data]) => (
                                                        <tr key={code} className="border-gray-200">
                                                            <td className="border border-gray-200 px-2 py-1">{data.name}</td>
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
                                                    <td className="border border-gray-200 px-2 py-1 text-right">
                                                        {(creditNote.totalAmount - creditNote.taxAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </td>
                                                    <td className="border border-gray-200 px-2 py-1 text-right">
                                                        {creditNote.taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Summary Totals */}
                                <div className="flex justify-end">
                                    <div className="w-full max-w-sm space-y-3">
                                        <div className="grid grid-cols-2 gap-8">
                                            <h4 className="font-semibold text-gray-900 text-sm">Credit Note</h4>
                                            <div className="flex justify-end">
                                                <h4 className="font-semibold text-gray-900 text-sm">Items: {(creditNote.items as any[])?.length || 0}</h4>
                                            </div>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between text-gray-600">
                                            <span>Total Amount (Without Tax):</span>
                                            <span>{formatCurrency(creditNote.totalAmount - creditNote.taxAmount, merchantSettings)}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600">
                                            <span>Total Tax:</span>
                                            <span>{formatCurrency(creditNote.taxAmount, merchantSettings)}</span>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between text-lg font-bold text-green-600">
                                            <span>Total Credit Amount:</span>
                                            <span>{formatCurrency(creditNote.totalAmount, merchantSettings)}</span>
                                        </div>
                                        <Separator />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SCU INFORMATION */}
                        {creditNote.kraSubmitted && (
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
                                                        const kraData = creditNote.kraSubmissionData as any;
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
                                                        return creditNote.kraSubmittedAt ? new Date(creditNote.kraSubmittedAt).toLocaleString() : '-';
                                                    })()}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">Serial number:</span>
                                                <p className="text-gray-600">
                                                    {(() => {
                                                        const kraData = creditNote.kraSubmissionData as any;
                                                        return kraData?.data?.sdcId || creditNote.kraSdcId || '-';
                                                    })()}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">Receipt number:</span>
                                                <p className="text-gray-600">
                                                    {(() => {
                                                        const kraData = creditNote.kraSubmissionData as any;
                                                        return kraData?.data?.rcptNo || creditNote.kraReceiptNumber || '-';
                                                    })()}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">Internal data:</span>
                                                <p className="text-gray-600">
                                                    {(() => {
                                                        const kraData = creditNote.kraSubmissionData as any;
                                                        const intrlData = kraData?.data?.intrlData || creditNote.kraReceiptSignature || '-';
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
                                                    const kraData = creditNote.kraSubmissionData as any;
                                                    const rcptSign = kraData?.data?.rcptSign || creditNote.kraReceiptSignature || '-';
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
                                                        const kraPin = (creditNote.merchant as any)?.taxIdentifier || '';
                                                        const bhfId = (creditNote.branch as any)?.kraVscuBhfId || '00'; // KRA branch ID
                                                        const kraData = creditNote.kraSubmissionData as any;
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
                            <p>This is a computer-generated credit note and is valid without signature.</p>
                            <p className="mt-2">Thank you for your business!</p>
                            {(creditNote.branch as any)?.address && (
                                <p className="mt-2">{(creditNote.branch as any).address}</p>
                            )}
                            {((creditNote.branch as any)?.phone || (creditNote.branch as any)?.email) && (
                                <p className="mt-1">
                                    {(creditNote.branch as any).phone && `Tel: ${(creditNote.branch as any).phone}`}
                                    {(creditNote.branch as any).phone && (creditNote.branch as any).email && ' | '}
                                    {(creditNote.branch as any).email && `Email: ${(creditNote.branch as any).email}`}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 