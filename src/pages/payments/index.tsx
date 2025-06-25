import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MoreHorizontal, Eye, Edit, Trash2, CreditCard, Calendar, DollarSign, FileText, Filter } from 'lucide-react';
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
import { invoicesService, paymentModesService } from '@/services/sdk';
import type { InvoicePaymentResponseDto, InvoiceResponseDto, PaymentModeResponseDto } from '@/lib/sdk';

// Use the actual API DTOs
interface Payment extends InvoicePaymentResponseDto {
    invoice?: InvoiceResponseDto;
}

interface PaymentsPageState {
    payments: Payment[];
    paymentModes: PaymentModeResponseDto[];
    loading: boolean;
    error: string | null;
    filters: {
        search: string;
        paymentModeId?: string;
        startDate?: string;
        endDate?: string;
        minAmount?: number;
        maxAmount?: number;
    };
    showDeleteDialog: boolean;
    deletingPayment: Payment | null;
}

export default function PaymentsPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const merchantSettings = useMerchantSettings();
    const [state, setState] = useState<PaymentsPageState>({
        payments: [],
        paymentModes: [],
        loading: true,
        error: null,
        filters: {
            search: '',
        },
        showDeleteDialog: false,
        deletingPayment: null,
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

    // Load payments and related data from API
    const loadPayments = async () => {
        try {
            setState(prev => ({ ...prev, loading: true, error: null }));

            const merchantId = getMerchantId();
            if (!merchantId) {
                throw new Error('Merchant ID not found. Please ensure you are logged in.');
            }

            // Load payment modes first
            const paymentModesData = await paymentModesService.paymentModeControllerFindAll(merchantId);

            // Load all invoices to get their payments
            const invoicesData = await invoicesService.invoiceControllerGetInvoices();

            // Extract all payments from invoices
            const allPayments: Payment[] = [];
            for (const invoice of invoicesData || []) {
                if (invoice.payments && invoice.payments.length > 0) {
                    for (const payment of invoice.payments) {
                        allPayments.push({
                            ...payment,
                            invoice: invoice,
                        });
                    }
                }
            }

            // Apply filters
            let filteredPayments = [...allPayments];

            // Search filter
            if (state.filters.search) {
                filteredPayments = filteredPayments.filter(payment =>
                    payment.invoice?.invoiceNumber?.toLowerCase().includes(state.filters.search.toLowerCase()) ||
                    payment.invoice?.customer?.name?.toLowerCase().includes(state.filters.search.toLowerCase()) ||
                    payment.referenceNumber?.toLowerCase().includes(state.filters.search.toLowerCase()) ||
                    payment.notes?.toLowerCase().includes(state.filters.search.toLowerCase())
                );
            }

            // Payment mode filter
            if (state.filters.paymentModeId) {
                filteredPayments = filteredPayments.filter(payment =>
                    payment.paymentModeId === state.filters.paymentModeId
                );
            }

            // Date range filter
            if (state.filters.startDate) {
                filteredPayments = filteredPayments.filter(payment =>
                    new Date(payment.paymentDate) >= new Date(state.filters.startDate!)
                );
            }
            if (state.filters.endDate) {
                filteredPayments = filteredPayments.filter(payment =>
                    new Date(payment.paymentDate) <= new Date(state.filters.endDate!)
                );
            }

            // Amount range filter
            if (state.filters.minAmount !== undefined) {
                filteredPayments = filteredPayments.filter(payment =>
                    payment.amount >= state.filters.minAmount!
                );
            }
            if (state.filters.maxAmount !== undefined) {
                filteredPayments = filteredPayments.filter(payment =>
                    payment.amount <= state.filters.maxAmount!
                );
            }

            // Sort by payment date (newest first)
            filteredPayments.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());

            setState(prev => ({
                ...prev,
                payments: filteredPayments,
                paymentModes: paymentModesData || [],
                loading: false,
            }));
        } catch (error: any) {
            console.error('Failed to load payments:', error);
            const errorMessage = extractErrorMessage(error);
            setState(prev => ({
                ...prev,
                error: errorMessage,
                loading: false,
            }));
            toast.error(errorMessage);
        }
    };

    useEffect(() => {
        if (user) {
            loadPayments();
        }
    }, [user, state.filters]);

    // Handle delete payment
    const handleDeletePayment = async () => {
        if (!state.deletingPayment) return;

        try {
            await invoicesService.invoiceControllerDeletePayment(state.deletingPayment.id);
            toast.success('Payment deleted successfully');
            setState(prev => ({
                ...prev,
                showDeleteDialog: false,
                deletingPayment: null,
            }));
            loadPayments();
        } catch (error: any) {
            console.error('Failed to delete payment:', error);
            const errorMessage = extractErrorMessage(error);
            toast.error(errorMessage);
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
            filters: { ...prev.filters, [key]: value },
        }));
    };

    // Format date
    const formatDate = (date: Date | string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    // Get payment mode name
    const getPaymentModeName = (paymentModeId?: string) => {
        if (!paymentModeId) return 'Unknown';
        const paymentMode = state.paymentModes.find(pm => pm.id === paymentModeId);
        return paymentMode?.name || 'Unknown';
    };

    // Calculate totals
    const totalPayments = state.payments.length;
    const totalAmount = state.payments.reduce((sum, payment) => sum + payment.amount, 0);
    const averagePayment = totalPayments > 0 ? totalAmount / totalPayments : 0;

    // Show loading or error if user is not available
    if (!user) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-muted-foreground">Please log in to view payments</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
                    <p className="text-muted-foreground">
                        Track and manage all invoice payments
                    </p>
                </div>
                <Button onClick={() => window.location.href = '/invoices'}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Record New Payment
                </Button>
            </div>

            {/* Dashboard Overview Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalPayments}</div>
                        <p className="text-xs text-muted-foreground">
                            All recorded payments
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <CardAmount amount={totalAmount} variant="green" />
                        <p className="text-xs text-muted-foreground">
                            Sum of all payments
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Payment</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <CardAmount amount={averagePayment} />
                        <p className="text-xs text-muted-foreground">
                            Average payment amount
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters and Search */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Filter className="mr-2 h-5 w-5" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        {/* Search */}
                        <div>
                            <Label htmlFor="search">Search</Label>
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="search"
                                    placeholder="Search by invoice number, customer, reference, or notes..."
                                    value={state.filters.search}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                        </div>

                        {/* Filter Row */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div>
                                <Label>Payment Mode</Label>
                                <Select
                                    value={state.filters.paymentModeId || 'all'}
                                    onValueChange={(value) =>
                                        handleFilterChange('paymentModeId', value === 'all' ? undefined : value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Payment Modes</SelectItem>
                                        {state.paymentModes.map((mode) => (
                                            <SelectItem key={mode.id} value={mode.id}>
                                                {mode.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="startDate">Start Date</Label>
                                <Input
                                    id="startDate"
                                    type="date"
                                    value={state.filters.startDate || ''}
                                    onChange={(e) => handleFilterChange('startDate', e.target.value || undefined)}
                                />
                            </div>

                            <div>
                                <Label htmlFor="endDate">End Date</Label>
                                <Input
                                    id="endDate"
                                    type="date"
                                    value={state.filters.endDate || ''}
                                    onChange={(e) => handleFilterChange('endDate', e.target.value || undefined)}
                                />
                            </div>

                            <div>
                                <Label htmlFor="minAmount">Min Amount</Label>
                                <Input
                                    id="minAmount"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={state.filters.minAmount || ''}
                                    onChange={(e) => handleFilterChange('minAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
                                />
                            </div>

                            <div>
                                <Label htmlFor="maxAmount">Max Amount</Label>
                                <Input
                                    id="maxAmount"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={state.filters.maxAmount || ''}
                                    onChange={(e) => handleFilterChange('maxAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
                                />
                            </div>
                        </div>

                        {/* Clear Filters */}
                        <div className="flex justify-end">
                            <Button
                                variant="outline"
                                onClick={() => setState(prev => ({
                                    ...prev,
                                    filters: { search: '' }
                                }))}
                            >
                                Clear Filters
                            </Button>
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

            {/* Payments Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Payments ({state.payments.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Payment Details</TableHead>
                                <TableHead>Invoice</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Payment Mode</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="w-12"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {state.loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8">
                                        Loading payments...
                                    </TableCell>
                                </TableRow>
                            ) : state.payments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8">
                                        No payments found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                state.payments.map((payment) => (
                                    <TableRow key={payment.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                                                    <CreditCard className="h-5 w-5 text-green-600" />
                                                </div>
                                                <div>
                                                    <div className="font-medium">Payment #{payment.id.slice(-8)}</div>
                                                    {payment.referenceNumber && (
                                                        <div className="text-sm text-muted-foreground">
                                                            Ref: {payment.referenceNumber}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{payment.invoice?.invoiceNumber}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {formatCurrency(payment.invoice?.totalAmount || 0, merchantSettings)} total
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">
                                                    {payment.invoice?.customer?.name || 'Walk-in Customer'}
                                                </div>
                                                {payment.invoice?.customer?.phone && (
                                                    <div className="text-sm text-muted-foreground">
                                                        {payment.invoice.customer.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {getPaymentModeName(payment.paymentModeId)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium text-green-600">
                                                {formatCurrency(payment.amount, merchantSettings)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm">{formatDate(payment.paymentDate)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            navigate(`/payments/receipt/${payment.id}`);
                                                        }}
                                                    >
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Receipt
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            navigate(`/payments/edit/${payment.id}`);
                                                        }}
                                                    >
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit Payment
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => navigate(`/invoices/view/${payment.invoice?.id}`)}
                                                    >
                                                        <FileText className="mr-2 h-4 w-4" />
                                                        View Invoice
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => setState(prev => ({ ...prev, showDeleteDialog: true, deletingPayment: payment }))}
                                                        className="text-destructive"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
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

            {/* Delete Payment Dialog */}
            <Dialog open={state.showDeleteDialog} onOpenChange={(open) => setState(prev => ({ ...prev, showDeleteDialog: open }))}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Payment</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this payment of {state.deletingPayment && formatCurrency(state.deletingPayment.amount, merchantSettings)}?
                            This action cannot be undone and will affect the invoice payment status.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setState(prev => ({ ...prev, showDeleteDialog: false }))}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeletePayment}>
                            Delete Payment
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
} 