import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, FileText, CreditCard, DollarSign, AlertCircle, Calendar, MinusCircle, PlusCircle, RotateCcw } from 'lucide-react';
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
import { extractErrorMessage } from '@/lib/error-utils';
import { invoicesService, branchesService, customersService, paymentModesService } from '@/services/sdk';
import type {
    InvoiceResponseDto,
    InvoiceItemResponseDto,
    InvoicePaymentResponseDto,
    BranchResponseDto,
    CustomerResponseDto,
    CreateInvoicePaymentDto,
    PaymentModeResponseDto
} from '@/lib/sdk';

// Use the actual API DTOs
interface Invoice extends InvoiceResponseDto { }
interface InvoiceItem extends InvoiceItemResponseDto { }
interface InvoicePayment extends InvoicePaymentResponseDto { }

interface InvoicesPageState {
    invoices: Invoice[];
    branches: BranchResponseDto[];
    customers: CustomerResponseDto[];
    paymentModes: PaymentModeResponseDto[];
    loading: boolean;
    error: string | null;
    filters: {
        search: string;
        branchId?: string;
        customerId?: string;
        status?: string;
        paymentStatus?: string;
        startDate?: string;
        endDate?: string;
    };
    showViewDialog: boolean;
    showRecordPaymentDialog: boolean;
    viewingInvoice: Invoice | null;
    recordingPaymentInvoice: Invoice | null;
    paymentAmount: number;
    paymentModeId: string;
    paymentDate: string;
    paymentReference: string;
    paymentNotes: string;
}

const invoiceStatusLabels = {
    DRAFT: 'Draft',
    ISSUED: 'Issued',
    PAID: 'Paid',
    OVERDUE: 'Overdue',
    CANCELLED: 'Cancelled',
    VOID: 'Void',
};

const paymentStatusLabels = {
    UNPAID: 'Unpaid',
    PARTIAL: 'Partial',
    PAID: 'Paid',
    OVERPAID: 'Overpaid',
};

const invoiceStatusColors = {
    DRAFT: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
    ISSUED: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    PAID: 'bg-green-100 text-green-800 hover:bg-green-200',
    OVERDUE: 'bg-red-100 text-red-800 hover:bg-red-200',
    CANCELLED: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
    VOID: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
};

const paymentStatusColors = {
    UNPAID: 'bg-red-100 text-red-800 hover:bg-red-200',
    PARTIAL: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    PAID: 'bg-green-100 text-green-800 hover:bg-green-200',
    OVERPAID: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
};

export default function InvoicesPage() {
    const { user } = useAuth();
    const merchantSettings = useMerchantSettings();

    // Check if merchant is Kenyan (only credit notes supported for Kenya)
    const isKenyanMerchant = user?.merchant?.country === 'KE';
    const [state, setState] = useState<InvoicesPageState>({
        invoices: [],
        branches: [],
        customers: [],
        paymentModes: [],
        loading: true,
        error: null,
        filters: {
            search: '',
        },
        showViewDialog: false,
        showRecordPaymentDialog: false,
        viewingInvoice: null,
        recordingPaymentInvoice: null,
        paymentAmount: 0,
        paymentModeId: '',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentReference: '',
        paymentNotes: '',
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

    // Load invoices and related data from API
    const loadInvoices = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, loading: true, error: null }));

            const merchantId = getMerchantId();
            if (!merchantId) {
                throw new Error('Merchant ID not found. Please ensure you are logged in.');
            }

            // Load invoices, branches, customers, and payment modes
            const [invoicesData, branchesData, customersData, paymentModesData] = await Promise.all([
                invoicesService.invoiceControllerGetInvoices(
                    state.filters.branchId,
                    state.filters.customerId,
                    state.filters.status as 'DRAFT' | 'ISSUED' | 'VOID' | 'CANCELLED' | undefined,
                    state.filters.paymentStatus as 'UNPAID' | 'PARTIAL' | 'PAID' | 'OVERPAID' | undefined,
                    state.filters.startDate,
                    state.filters.endDate
                ),
                branchesService.branchControllerFindAll(merchantId),
                customersService.customerControllerFindAll(merchantId, '', ''),
                paymentModesService.paymentModeControllerFindAll(merchantId, true) // Only active payment modes
            ]);

            // Apply client-side search filter
            let filteredInvoices = [...(invoicesData || [])];
            if (state.filters.search) {
                filteredInvoices = filteredInvoices.filter(invoice =>
                    invoice.invoiceNumber?.toLowerCase().includes(state.filters.search.toLowerCase()) ||
                    invoice.customer?.name?.toLowerCase().includes(state.filters.search.toLowerCase()) ||
                    invoice.notes?.toLowerCase().includes(state.filters.search.toLowerCase())
                );
            }

            setState(prev => ({
                ...prev,
                invoices: filteredInvoices,
                branches: branchesData || [],
                customers: customersData || [],
                paymentModes: paymentModesData || [],
                loading: false,
            }));
        } catch (error: any) {
            console.error('Failed to load invoices:', error);
            const errorMessage = extractErrorMessage(error);
            setState(prev => ({
                ...prev,
                error: errorMessage,
                loading: false,
            }));
            toast.error(errorMessage);
        }
    }, [state.filters]);

    useEffect(() => {
        if (user) {
            loadInvoices();
        }
    }, [user, loadInvoices]);

    // Handle record payment
    const handleRecordPayment = async () => {
        if (!state.recordingPaymentInvoice) return;

        try {
            const paymentData: CreateInvoicePaymentDto = {
                amount: state.paymentAmount,
                paymentModeId: state.paymentModeId,
                paymentDate: state.paymentDate,
                referenceNumber: state.paymentReference || undefined,
                notes: state.paymentNotes || undefined,
            };

            await invoicesService.invoiceControllerRecordPayment(
                state.recordingPaymentInvoice.id,
                paymentData
            );
            toast.success('Payment recorded successfully');
            setState(prev => ({
                ...prev,
                showRecordPaymentDialog: false,
                recordingPaymentInvoice: null,
                paymentAmount: 0,
                paymentModeId: '',
                paymentDate: new Date().toISOString().split('T')[0],
                paymentReference: '',
                paymentNotes: '',
            }));
            loadInvoices();
        } catch (error: any) {
            console.error('Failed to record payment:', error);
            const errorMessage = extractErrorMessage(error);
            toast.error(errorMessage);
        }
    };

    // Handle invoice actions
    const handleIssueInvoice = async (invoice: Invoice) => {
        try {
            await invoicesService.invoiceControllerIssueInvoice(invoice.id);
            toast.success('Invoice issued successfully');
            loadInvoices();
        } catch (error: any) {
            console.error('Failed to issue invoice:', error);
            toast.error(error.message || 'Failed to issue invoice');
        }
    };

    const handleVoidInvoice = async (invoice: Invoice) => {
        try {
            await invoicesService.invoiceControllerVoidInvoice(invoice.id);
            toast.success('Invoice voided successfully');
            loadInvoices();
        } catch (error: any) {
            console.error('Failed to void invoice:', error);
            toast.error(error.message || 'Failed to void invoice');
        }
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
            filters: { ...prev.filters, [key]: value === 'all' ? undefined : value },
        }));
    };

    // Utility functions
    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DRAFT': return 'bg-gray-100 text-gray-800';
            case 'ISSUED': return 'bg-blue-100 text-blue-800';
            case 'VOID': return 'bg-gray-100 text-gray-800';
            case 'CANCELLED': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case 'UNPAID': return 'bg-red-100 text-red-800';
            case 'PARTIAL': return 'bg-yellow-100 text-yellow-800';
            case 'PAID': return 'bg-green-100 text-green-800';
            case 'OVERPAID': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const isOverdue = (invoice: Invoice) => {
        return invoice.dueDate && new Date(invoice.dueDate) < new Date() && invoice.paymentStatus !== 'PAID';
    };

    const getDisplayStatus = (invoice: Invoice) => {
        if (isOverdue(invoice)) {
            return 'OVERDUE';
        }
        if (invoice.paymentStatus === 'PAID') {
            return 'PAID';
        }
        return invoice.status;
    };

    const getDisplayStatusColor = (invoice: Invoice) => {
        const displayStatus = getDisplayStatus(invoice);
        switch (displayStatus) {
            case 'OVERDUE': return 'bg-red-100 text-red-800';
            case 'PAID': return 'bg-green-100 text-green-800';
            default: return getStatusColor(invoice.status);
        }
    };

    // Calculate dashboard metrics
    const totalInvoices = state.invoices.length;
    const draftInvoices = state.invoices.filter(inv => inv.status === 'DRAFT').length;
    const totalInvoicedAmount = state.invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalPaidAmount = state.invoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
    const totalOutstandingAmount = totalInvoicedAmount - totalPaidAmount;
    const overdueInvoices = state.invoices.filter(isOverdue).length;

    // Show loading or error if user is not available
    if (!user) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-muted-foreground">Please log in to view invoices</p>
                </div>
            </div>
        );
    }

    // Handle opening payment dialog
    const handleOpenPaymentDialog = (invoice: Invoice) => {
        // Find the default payment mode or use the first active one
        const defaultPaymentMode = state.paymentModes.find(pm => pm.isDefault) || state.paymentModes[0];

        setState(prev => ({
            ...prev,
            showRecordPaymentDialog: true,
            recordingPaymentInvoice: invoice,
            paymentAmount: invoice.totalAmount - invoice.amountPaid, // Default to remaining amount
            paymentModeId: defaultPaymentMode?.id || '',
        }));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
                    <p className="text-muted-foreground">
                        Manage customer invoices and track payments
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => window.location.href = '/sales/quick'}>
                        <DollarSign className="mr-2 h-4 w-4" />
                        Quick Sale
                    </Button>
                    <Button onClick={() => window.location.href = '/invoices/create'}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Invoice
                    </Button>
                </div>
            </div>

            {/* Invoice Management Navigation */}
            <Card>
                <CardContent className="pt-6">
                    <div className={`grid grid-cols-1 gap-4 ${isKenyanMerchant ? 'md:grid-cols-1' : 'md:grid-cols-3'}`}>
                        <Button
                            variant="outline"
                            className="h-20 flex flex-col items-center justify-center space-y-2"
                            onClick={() => window.location.href = '/invoices/credit-notes'}
                        >
                            <FileText className="h-6 w-6 text-green-600" />
                            <div className="text-center">
                                <p className="font-medium">Credit Notes</p>
                                <p className="text-xs text-muted-foreground">Customer returns & credits</p>
                            </div>
                        </Button>

                        {/* Hide debit notes and refunds for Kenyan merchants */}
                        {!isKenyanMerchant && (
                            <>
                                <Button
                                    variant="outline"
                                    className="h-20 flex flex-col items-center justify-center space-y-2"
                                    onClick={() => window.location.href = '/invoices/debit-notes'}
                                >
                                    <FileText className="h-6 w-6 text-blue-600" />
                                    <div className="text-center">
                                        <p className="font-medium">Debit Notes</p>
                                        <p className="text-xs text-muted-foreground">Additional charges</p>
                                    </div>
                                </Button>

                                <Button
                                    variant="outline"
                                    className="h-20 flex flex-col items-center justify-center space-y-2"
                                    onClick={() => window.location.href = '/invoices/refunds'}
                                >
                                    <DollarSign className="h-6 w-6 text-orange-600" />
                                    <div className="text-center">
                                        <p className="font-medium">Refunds</p>
                                        <p className="text-xs text-muted-foreground">Process customer refunds</p>
                                    </div>
                                </Button>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Dashboard Overview Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalInvoices}</div>
                        <p className="text-xs text-muted-foreground">
                            {draftInvoices} draft{draftInvoices !== 1 ? 's' : ''}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Invoiced</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <CardAmount
                            amount={totalInvoicedAmount}
                            label="Total invoice amount"
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Amount Paid</CardTitle>
                        <CreditCard className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <CardAmount
                            amount={totalPaidAmount}
                            variant="green"
                            label="Collected payments"
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <CardAmount
                            amount={totalOutstandingAmount}
                            variant="orange"
                            label="Pending payments"
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                        <Calendar className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{overdueInvoices}</div>
                        <p className="text-xs text-muted-foreground">
                            Past due date
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
                                    placeholder="Search by invoice number, customer, or notes..."
                                    value={state.filters.search}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
                            <div>
                                <Label>Branch</Label>
                                <Select
                                    value={state.filters.branchId || 'all'}
                                    onValueChange={(value) => handleFilterChange('branchId', value)}
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
                                <Label>Customer</Label>
                                <Select
                                    value={state.filters.customerId || 'all'}
                                    onValueChange={(value) => handleFilterChange('customerId', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Customers</SelectItem>
                                        {state.customers.map((customer) => (
                                            <SelectItem key={customer.id} value={customer.id}>
                                                {customer.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Status</Label>
                                <Select
                                    value={state.filters.status || 'all'}
                                    onValueChange={(value) => handleFilterChange('status', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="DRAFT">Draft</SelectItem>
                                        <SelectItem value="ISSUED">Issued</SelectItem>
                                        <SelectItem value="VOID">Void</SelectItem>
                                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Payment Status</Label>
                                <Select
                                    value={state.filters.paymentStatus || 'all'}
                                    onValueChange={(value) => handleFilterChange('paymentStatus', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Payment Status</SelectItem>
                                        <SelectItem value="UNPAID">Unpaid</SelectItem>
                                        <SelectItem value="PARTIAL">Partial</SelectItem>
                                        <SelectItem value="PAID">Paid</SelectItem>
                                        <SelectItem value="OVERPAID">Overpaid</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Start Date</Label>
                                <Input
                                    type="date"
                                    value={state.filters.startDate || ''}
                                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                />
                            </div>

                            <div>
                                <Label>End Date</Label>
                                <Input
                                    type="date"
                                    value={state.filters.endDate || ''}
                                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                />
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

            {/* Invoices Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Invoices ({state.invoices.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Invoice</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Branch</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Paid</TableHead>
                                <TableHead>Due</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Payment</TableHead>
                                <TableHead className="w-12"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {state.loading ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center py-8">
                                        Loading invoices...
                                    </TableCell>
                                </TableRow>
                            ) : state.invoices.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center py-8">
                                        No invoices found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                state.invoices.map((invoice) => (
                                    <TableRow key={invoice.id} className={isOverdue(invoice) ? 'bg-red-50' : ''}>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{invoice.invoiceNumber}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {formatDate(invoice.invoiceDate)}
                                                    {invoice.dueDate && (
                                                        <span className={isOverdue(invoice) ? 'text-red-600 font-medium' : ''}>
                                                            {' • Due: '}{formatDate(invoice.dueDate)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">
                                                    {invoice.customer?.name || 'Walk-in Customer'}
                                                </div>
                                                {invoice.customer?.phone && (
                                                    <div className="text-sm text-muted-foreground">
                                                        {invoice.customer.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {invoice.branch?.name || 'Unknown Branch'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">
                                                    {formatCurrency(invoice.totalAmount, merchantSettings)}
                                                </div>
                                                {invoice.taxAmount > 0 && (
                                                    <div className="text-sm text-muted-foreground">
                                                        Tax: {formatCurrency(invoice.taxAmount, merchantSettings)}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium text-green-600">
                                                {formatCurrency(invoice.amountPaid, merchantSettings)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className={`font-medium ${(invoice.totalAmount - invoice.amountPaid) > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                                                {formatCurrency(invoice.totalAmount - invoice.amountPaid, merchantSettings)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getDisplayStatusColor(invoice)}>
                                                {getDisplayStatus(invoice)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getPaymentStatusColor(invoice.paymentStatus)}>
                                                {invoice.paymentStatus}
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
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem
                                                        onClick={() => window.location.href = `/invoices/view/${invoice.id}`}
                                                    >
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                    {invoice.status === 'DRAFT' && (
                                                        <DropdownMenuItem
                                                            onClick={() => window.location.href = `/invoices/edit/${invoice.id}`}
                                                        >
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                    )}
                                                    {invoice.paymentStatus !== 'PAID' && (
                                                        <DropdownMenuItem
                                                            onClick={() => handleOpenPaymentDialog(invoice)}
                                                        >
                                                            <CreditCard className="mr-2 h-4 w-4" />
                                                            Record Payment
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                    {invoice.status === 'DRAFT' && (
                                                        <DropdownMenuItem
                                                            onClick={() => handleIssueInvoice(invoice)}
                                                        >
                                                            <FileText className="mr-2 h-4 w-4" />
                                                            Issue Invoice
                                                        </DropdownMenuItem>
                                                    )}
                                                    {/* Credit Note, Debit Note, and Refund Actions */}
                                                    {(invoice.status === 'ISSUED' || invoice.status === 'PAID' || invoice.paymentStatus === 'PAID') && (
                                                        <>
                                                            <DropdownMenuSeparator />
                                                            {/* Credit notes now available for both customer sales and quick sales */}
                                                            <DropdownMenuItem
                                                                onClick={() => window.location.href = `/invoices/credit-notes/create?invoiceId=${invoice.id}`}
                                                            >
                                                                <MinusCircle className="mr-2 h-4 w-4" />
                                                                Create Credit Note
                                                            </DropdownMenuItem>
                                                            {/* Hide debit notes and refunds for Kenyan merchants */}
                                                            {!isKenyanMerchant && (
                                                                <>
                                                                    <DropdownMenuItem
                                                                        onClick={() => window.location.href = `/invoices/debit-notes/create?invoiceId=${invoice.id}`}
                                                                    >
                                                                        <PlusCircle className="mr-2 h-4 w-4" />
                                                                        Create Debit Note
                                                                    </DropdownMenuItem>
                                                                    {invoice.paymentStatus === 'PAID' && (
                                                                        <DropdownMenuItem
                                                                            onClick={() => window.location.href = `/invoices/refunds/create?invoiceId=${invoice.id}`}
                                                                        >
                                                                            <RotateCcw className="mr-2 h-4 w-4" />
                                                                            Create Refund
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                </>
                                                            )}
                                                        </>
                                                    )}
                                                    {(invoice.status === 'ISSUED' || invoice.status === 'OVERDUE') && (
                                                        <DropdownMenuItem
                                                            onClick={() => handleVoidInvoice(invoice)}
                                                            className="text-destructive"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Void Invoice
                                                        </DropdownMenuItem>
                                                    )}
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

            {/* View Invoice Dialog */}
            <Dialog open={state.showViewDialog} onOpenChange={(open) => setState(prev => ({ ...prev, showViewDialog: open }))}>
                <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Invoice Details</DialogTitle>
                    </DialogHeader>
                    {state.viewingInvoice && (
                        <div className="grid gap-4 py-4">
                            {/* Invoice Header */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Invoice Number</Label>
                                    <p className="text-sm font-mono">{state.viewingInvoice.invoiceNumber}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                                    <div className="flex gap-2">
                                        <Badge className={getDisplayStatusColor(state.viewingInvoice)}>
                                            {getDisplayStatus(state.viewingInvoice)}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            {/* Customer and Branch Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Customer</Label>
                                    <p className="text-sm">
                                        {state.viewingInvoice.customer?.name || 'Walk-in Customer'}
                                    </p>
                                    {state.viewingInvoice.customer?.phone && (
                                        <p className="text-sm text-muted-foreground">
                                            {state.viewingInvoice.customer.phone}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Branch</Label>
                                    <p className="text-sm">{state.viewingInvoice.branch?.name || 'Unknown Branch'}</p>
                                </div>
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Invoice Date</Label>
                                    <p className="text-sm">{formatDate(state.viewingInvoice.invoiceDate)}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Due Date</Label>
                                    <p className="text-sm">
                                        {state.viewingInvoice.dueDate ? formatDate(state.viewingInvoice.dueDate) : 'No due date'}
                                    </p>
                                </div>
                            </div>

                            {/* Amount Breakdown */}
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Total Amount</Label>
                                    <p className="text-sm font-medium">
                                        {formatCurrency(state.viewingInvoice.totalAmount, merchantSettings)}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Amount Paid</Label>
                                    <p className="text-sm font-medium text-green-600">
                                        {formatCurrency(state.viewingInvoice.amountPaid, merchantSettings)}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Amount Due</Label>
                                    <p className="text-sm font-medium text-orange-600">
                                        {formatCurrency(state.viewingInvoice.totalAmount - state.viewingInvoice.amountPaid, merchantSettings)}
                                    </p>
                                </div>
                            </div>

                            {/* Tax Amount */}
                            {state.viewingInvoice.taxAmount > 0 && (
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Tax Amount</Label>
                                    <p className="text-sm">{formatCurrency(state.viewingInvoice.taxAmount, merchantSettings)}</p>
                                </div>
                            )}

                            {/* Invoice Items */}
                            {state.viewingInvoice.items && state.viewingInvoice.items.length > 0 && (
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Invoice Items</Label>
                                    <div className="mt-2 border rounded-lg">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Item</TableHead>
                                                    <TableHead>Qty</TableHead>
                                                    <TableHead>Price</TableHead>
                                                    <TableHead>Total</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {state.viewingInvoice.items.map((item) => (
                                                    <TableRow key={item.id}>
                                                        <TableCell>
                                                            <div>
                                                                <div className="font-medium">
                                                                    {item.product?.name || item.description || 'Unknown Item'}
                                                                </div>
                                                                {item.product?.code && (
                                                                    <div className="text-sm text-muted-foreground">
                                                                        {item.product.code}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>{item.quantity}</TableCell>
                                                        <TableCell>{formatCurrency(item.unitPrice, merchantSettings)}</TableCell>
                                                        <TableCell>{formatCurrency(item.totalAmount, merchantSettings)}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            )}

                            {/* Notes */}
                            {state.viewingInvoice.notes && (
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Notes</Label>
                                    <p className="text-sm">{state.viewingInvoice.notes}</p>
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setState(prev => ({ ...prev, showViewDialog: false }))}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Record Payment Dialog */}
            <Dialog open={state.showRecordPaymentDialog} onOpenChange={(open) => setState(prev => ({ ...prev, showRecordPaymentDialog: open }))}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Record Payment</DialogTitle>
                        <DialogDescription>
                            Record a payment for invoice {state.recordingPaymentInvoice?.invoiceNumber}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="paymentAmount">Payment Amount *</Label>
                            <Input
                                id="paymentAmount"
                                type="number"
                                step="0.01"
                                value={state.paymentAmount}
                                onChange={(e) => setState(prev => ({ ...prev, paymentAmount: parseFloat(e.target.value) || 0 }))}
                                placeholder="0.00"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="paymentModeId">Payment Method *</Label>
                            <Select
                                value={state.paymentModeId}
                                onValueChange={(value) => setState(prev => ({ ...prev, paymentModeId: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select payment method" />
                                </SelectTrigger>
                                <SelectContent>
                                    {state.paymentModes.map((paymentMode) => (
                                        <SelectItem key={paymentMode.id} value={paymentMode.id}>
                                            {paymentMode.name}
                                            {paymentMode.isDefault && ' (Default)'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="paymentDate">Payment Date *</Label>
                            <Input
                                id="paymentDate"
                                type="date"
                                value={state.paymentDate}
                                onChange={(e) => setState(prev => ({ ...prev, paymentDate: e.target.value }))}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="paymentReference">Reference Number</Label>
                            <Input
                                id="paymentReference"
                                value={state.paymentReference}
                                onChange={(e) => setState(prev => ({ ...prev, paymentReference: e.target.value }))}
                                placeholder="Transaction reference"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="paymentNotes">Notes</Label>
                            <Input
                                id="paymentNotes"
                                value={state.paymentNotes}
                                onChange={(e) => setState(prev => ({ ...prev, paymentNotes: e.target.value }))}
                                placeholder="Payment notes"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setState(prev => ({ ...prev, showRecordPaymentDialog: false }))}>
                            Cancel
                        </Button>
                        <Button onClick={handleRecordPayment}>
                            Record Payment
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
} 