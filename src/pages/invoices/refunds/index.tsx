import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, FileText, CreditCard, AlertCircle, Calendar, Check, X, DollarSign } from 'lucide-react';
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
import { invoicesService } from '@/services/sdk';
import type {
    InvoiceRefundResponseDto,
    InvoiceResponseDto
} from '@/lib/sdk';
import { useNavigate } from 'react-router-dom';

interface RefundsPageState {
    refunds: InvoiceRefundResponseDto[];
    invoices: InvoiceResponseDto[];
    loading: boolean;
    error: string | null;
    filters: {
        search: string;
        invoiceId?: string;
        status?: string;
        startDate?: string;
        endDate?: string;
    };
    showViewDialog: boolean;
    showApprovalDialog: boolean;
    showProcessDialog: boolean;
    showRejectDialog: boolean;
    viewingRefund: InvoiceRefundResponseDto | null;
    processingRefund: InvoiceRefundResponseDto | null;
    actionType: 'approve' | 'process' | 'reject' | null;
}

const refundStatusLabels = {
    PENDING: 'Pending',
    APPROVED: 'Approved',
    PROCESSED: 'Processed',
    REJECTED: 'Rejected',
    CANCELLED: 'Cancelled',
};

const refundStatusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    APPROVED: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    PROCESSED: 'bg-green-100 text-green-800 hover:bg-green-200',
    REJECTED: 'bg-red-100 text-red-800 hover:bg-red-200',
    CANCELLED: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
};

export default function RefundsPage() {
    const { user } = useAuth();
    const merchantSettings = useMerchantSettings();
    const navigate = useNavigate();
    const [state, setState] = useState<RefundsPageState>({
        refunds: [],
        invoices: [],
        loading: true,
        error: null,
        filters: {
            search: '',
        },
        showViewDialog: false,
        showApprovalDialog: false,
        showProcessDialog: false,
        showRejectDialog: false,
        viewingRefund: null,
        processingRefund: null,
        actionType: null,
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

    // Load refunds and related data from API
    const loadRefunds = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, loading: true, error: null }));

            const merchantId = getMerchantId();
            if (!merchantId) {
                throw new Error('Merchant ID not found. Please ensure you are logged in.');
            }

            // Load refunds and invoices
            const [refundsData, invoicesData] = await Promise.all([
                invoicesService.invoiceControllerGetRefunds(
                    state.filters.invoiceId,
                    state.filters.status as 'PENDING' | 'APPROVED' | 'PROCESSED' | 'REJECTED' | 'CANCELLED' | undefined,
                    state.filters.startDate,
                    state.filters.endDate
                ),
                invoicesService.invoiceControllerGetInvoices() // Load all invoices for invoice filter
            ]);

            // Apply client-side search filter
            let filteredRefunds = [...(refundsData || [])];
            if (state.filters.search) {
                filteredRefunds = filteredRefunds.filter(refund =>
                    refund.refundNumber?.toLowerCase().includes(state.filters.search.toLowerCase()) ||
                    refund.invoice?.invoiceNumber?.toLowerCase().includes(state.filters.search.toLowerCase()) ||
                    refund.reason?.toLowerCase().includes(state.filters.search.toLowerCase())
                );
            }

            setState(prev => ({
                ...prev,
                refunds: filteredRefunds,
                invoices: invoicesData || [],
                loading: false,
            }));
        } catch (error: any) {
            console.error('Failed to load refunds:', error);
            const errorMessage = extractErrorMessage(error);
            setState(prev => ({
                ...prev,
                loading: false,
                error: errorMessage,
            }));
            toast.error(errorMessage);
        }
    }, [state.filters]);

    useEffect(() => {
        loadRefunds();
    }, [loadRefunds]);

    const handleApproveRefund = async (refund: InvoiceRefundResponseDto) => {
        try {
            await invoicesService.invoiceControllerApproveRefund(refund.id);
            toast.success('Refund approved successfully');
            setState(prev => ({
                ...prev,
                showApprovalDialog: false,
                processingRefund: null,
                actionType: null
            }));
            loadRefunds();
        } catch (error: any) {
            console.error('Failed to approve refund:', error);
            const errorMessage = extractErrorMessage(error);
            toast.error(errorMessage);
        }
    };

    const handleProcessRefund = async (refund: InvoiceRefundResponseDto) => {
        try {
            await invoicesService.invoiceControllerProcessRefund(refund.id);
            toast.success('Refund processed successfully');
            setState(prev => ({
                ...prev,
                showProcessDialog: false,
                processingRefund: null,
                actionType: null
            }));
            loadRefunds();
        } catch (error: any) {
            console.error('Failed to process refund:', error);
            const errorMessage = extractErrorMessage(error);
            toast.error(errorMessage);
        }
    };

    const handleRejectRefund = async (refund: InvoiceRefundResponseDto) => {
        try {
            await invoicesService.invoiceControllerRejectRefund(refund.id);
            toast.success('Refund rejected successfully');
            setState(prev => ({
                ...prev,
                showRejectDialog: false,
                processingRefund: null,
                actionType: null
            }));
            loadRefunds();
        } catch (error: any) {
            console.error('Failed to reject refund:', error);
            const errorMessage = extractErrorMessage(error);
            toast.error(errorMessage);
        }
    };

    const handleSearch = (value: string) => {
        setState(prev => ({
            ...prev,
            filters: { ...prev.filters, search: value },
        }));
    };

    const handleFilterChange = (key: string, value: any) => {
        setState(prev => ({
            ...prev,
            filters: { ...prev.filters, [key]: value },
        }));
    };

    const formatDate = (date: Date | string) => {
        return new Date(date).toLocaleDateString();
    };

    const getStatusColor = (status: string) => {
        return refundStatusColors[status as keyof typeof refundStatusColors] || 'bg-gray-100 text-gray-800';
    };

    const handleViewRefund = (refund: InvoiceRefundResponseDto) => {
        setState(prev => ({
            ...prev,
            viewingRefund: refund,
            showViewDialog: true,
        }));
    };

    const handleOpenActionDialog = (refund: InvoiceRefundResponseDto, action: 'approve' | 'process' | 'reject') => {
        setState(prev => ({
            ...prev,
            processingRefund: refund,
            actionType: action,
            showApprovalDialog: action === 'approve',
            showProcessDialog: action === 'process',
            showRejectDialog: action === 'reject',
        }));
    };

    const closeActionDialogs = () => {
        setState(prev => ({
            ...prev,
            showApprovalDialog: false,
            showProcessDialog: false,
            showRejectDialog: false,
            processingRefund: null,
            actionType: null,
        }));
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-muted-foreground">Please log in to view refunds</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Refunds</h1>
                    <p className="text-muted-foreground">
                        Manage invoice refunds and process customer returns
                    </p>
                </div>
                <Button onClick={() => navigate('/invoices/refunds/create')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Refund
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="search">Search</Label>
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="search"
                                    placeholder="Search refunds..."
                                    value={state.filters.search}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="invoice">Invoice</Label>
                            <Select value={state.filters.invoiceId || 'all'} onValueChange={(value) => handleFilterChange('invoiceId', value === 'all' ? undefined : value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All invoices" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All invoices</SelectItem>
                                    {state.invoices.map((invoice) => (
                                        <SelectItem key={invoice.id} value={invoice.id}>
                                            {invoice.invoiceNumber}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select value={state.filters.status || 'all'} onValueChange={(value) => handleFilterChange('status', value === 'all' ? undefined : value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All statuses</SelectItem>
                                    <SelectItem value="PENDING">Pending</SelectItem>
                                    <SelectItem value="APPROVED">Approved</SelectItem>
                                    <SelectItem value="PROCESSED">Processed</SelectItem>
                                    <SelectItem value="REJECTED">Rejected</SelectItem>
                                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="startDate">Start Date</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={state.filters.startDate || ''}
                                onChange={(e) => handleFilterChange('startDate', e.target.value || undefined)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Refunds Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Refunds</CardTitle>
                </CardHeader>
                <CardContent>
                    {state.loading ? (
                        <div className="flex items-center justify-center h-32">
                            <p className="text-muted-foreground">Loading refunds...</p>
                        </div>
                    ) : state.error ? (
                        <div className="flex items-center justify-center h-32">
                            <p className="text-destructive">{state.error}</p>
                        </div>
                    ) : state.refunds.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-32 space-y-2">
                            <DollarSign className="h-8 w-8 text-muted-foreground" />
                            <p className="text-muted-foreground">No refunds found</p>
                            <Button variant="outline" onClick={() => navigate('/invoices/refunds/create')}>
                                Create your first refund
                            </Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Refund #</TableHead>
                                    <TableHead>Invoice</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Method</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Reason</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {state.refunds.map((refund) => (
                                    <TableRow key={refund.id}>
                                        <TableCell className="font-medium">
                                            {refund.refundNumber}
                                        </TableCell>
                                        <TableCell>
                                            {refund.invoice?.invoiceNumber || 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            {formatDate(refund.refundDate)}
                                        </TableCell>
                                        <TableCell>
                                            <CardAmount amount={refund.refundAmount} />
                                        </TableCell>
                                        <TableCell>
                                            {refund.refundMethod || 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(refund.status)}>
                                                {refundStatusLabels[refund.status as keyof typeof refundStatusLabels]}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="max-w-xs truncate">
                                            {refund.reason}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => handleViewRefund(refund)}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                    {refund.status === 'PENDING' && (
                                                        <>
                                                            <DropdownMenuItem onClick={() => handleOpenActionDialog(refund, 'approve')}>
                                                                <Check className="mr-2 h-4 w-4" />
                                                                Approve Refund
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleOpenActionDialog(refund, 'reject')}>
                                                                <X className="mr-2 h-4 w-4" />
                                                                Reject Refund
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                    {refund.status === 'APPROVED' && (
                                                        <DropdownMenuItem onClick={() => handleOpenActionDialog(refund, 'process')}>
                                                            <DollarSign className="mr-2 h-4 w-4" />
                                                            Process Refund
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => navigate(`/invoices/refunds/view/${refund.id}`)}>
                                                        <FileText className="mr-2 h-4 w-4" />
                                                        View Full Refund
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* View Refund Dialog */}
            <Dialog open={state.showViewDialog} onOpenChange={(open) => setState(prev => ({ ...prev, showViewDialog: open, viewingRefund: open ? prev.viewingRefund : null }))}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Refund Details</DialogTitle>
                        <DialogDescription>
                            View refund information and processing details
                        </DialogDescription>
                    </DialogHeader>
                    {state.viewingRefund && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium">Refund Number</p>
                                    <p className="text-sm text-muted-foreground">{state.viewingRefund.refundNumber}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Invoice</p>
                                    <p className="text-sm text-muted-foreground">{state.viewingRefund.invoice?.invoiceNumber}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Refund Date</p>
                                    <p className="text-sm text-muted-foreground">{formatDate(state.viewingRefund.refundDate)}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Refund Amount</p>
                                    <p className="text-sm text-muted-foreground">
                                        <CardAmount amount={state.viewingRefund.refundAmount} />
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Refund Method</p>
                                    <p className="text-sm text-muted-foreground">{state.viewingRefund.refundMethod || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Status</p>
                                    <Badge className={getStatusColor(state.viewingRefund.status)}>
                                        {refundStatusLabels[state.viewingRefund.status as keyof typeof refundStatusLabels]}
                                    </Badge>
                                </div>
                                {state.viewingRefund.processedAt && (
                                    <div>
                                        <p className="text-sm font-medium">Processed At</p>
                                        <p className="text-sm text-muted-foreground">{formatDate(state.viewingRefund.processedAt)}</p>
                                    </div>
                                )}
                                {state.viewingRefund.processedBy && (
                                    <div>
                                        <p className="text-sm font-medium">Processed By</p>
                                        <p className="text-sm text-muted-foreground">{state.viewingRefund.processedBy}</p>
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-medium">Reason</p>
                                <p className="text-sm text-muted-foreground">{state.viewingRefund.reason}</p>
                            </div>
                            {state.viewingRefund.notes && (
                                <div>
                                    <p className="text-sm font-medium">Notes</p>
                                    <p className="text-sm text-muted-foreground">{state.viewingRefund.notes}</p>
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setState(prev => ({ ...prev, showViewDialog: false, viewingRefund: null }))}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Approve Refund Dialog */}
            <Dialog open={state.showApprovalDialog} onOpenChange={(open) => !open && closeActionDialogs()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Approve Refund</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to approve this refund? Once approved, it can be processed for payment.
                        </DialogDescription>
                    </DialogHeader>
                    {state.processingRefund && (
                        <div className="space-y-4">
                            <div className="rounded-lg border p-4">
                                <p className="font-medium">{state.processingRefund.refundNumber}</p>
                                <p className="text-sm text-muted-foreground">
                                    Invoice: {state.processingRefund.invoice?.invoiceNumber}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Amount: <CardAmount amount={state.processingRefund.refundAmount} />
                                </p>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={closeActionDialogs}>
                            Cancel
                        </Button>
                        <Button
                            onClick={() => state.processingRefund && handleApproveRefund(state.processingRefund)}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            <Check className="mr-2 h-4 w-4" />
                            Approve Refund
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Process Refund Dialog */}
            <Dialog open={state.showProcessDialog} onOpenChange={(open) => !open && closeActionDialogs()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Process Refund</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to process this refund? This action will complete the refund and cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    {state.processingRefund && (
                        <div className="space-y-4">
                            <div className="rounded-lg border p-4">
                                <p className="font-medium">{state.processingRefund.refundNumber}</p>
                                <p className="text-sm text-muted-foreground">
                                    Invoice: {state.processingRefund.invoice?.invoiceNumber}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Amount: <CardAmount amount={state.processingRefund.refundAmount} />
                                </p>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={closeActionDialogs}>
                            Cancel
                        </Button>
                        <Button
                            onClick={() => state.processingRefund && handleProcessRefund(state.processingRefund)}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <DollarSign className="mr-2 h-4 w-4" />
                            Process Refund
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Refund Dialog */}
            <Dialog open={state.showRejectDialog} onOpenChange={(open) => !open && closeActionDialogs()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Refund</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to reject this refund? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    {state.processingRefund && (
                        <div className="space-y-4">
                            <div className="rounded-lg border p-4">
                                <p className="font-medium">{state.processingRefund.refundNumber}</p>
                                <p className="text-sm text-muted-foreground">
                                    Invoice: {state.processingRefund.invoice?.invoiceNumber}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Amount: <CardAmount amount={state.processingRefund.refundAmount} />
                                </p>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={closeActionDialogs}>
                            Cancel
                        </Button>
                        <Button
                            onClick={() => state.processingRefund && handleRejectRefund(state.processingRefund)}
                            variant="destructive"
                        >
                            <X className="mr-2 h-4 w-4" />
                            Reject Refund
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
} 