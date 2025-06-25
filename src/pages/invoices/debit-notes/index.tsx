import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, FileText, CreditCard, AlertCircle, Calendar } from 'lucide-react';
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
import { invoicesService, branchesService, customersService } from '@/services/sdk';
import type {
    DebitNoteResponseDto,
    BranchResponseDto,
    CustomerResponseDto,
    InvoiceResponseDto
} from '@/lib/sdk';
import { useNavigate } from 'react-router-dom';

interface DebitNotesPageState {
    debitNotes: DebitNoteResponseDto[];
    branches: BranchResponseDto[];
    customers: CustomerResponseDto[];
    invoices: InvoiceResponseDto[];
    loading: boolean;
    error: string | null;
    filters: {
        search: string;
        branchId?: string;
        customerId?: string;
        originalInvoiceId?: string;
        status?: string;
        startDate?: string;
        endDate?: string;
    };
    showViewDialog: boolean;
    showIssueDialog: boolean;
    viewingDebitNote: DebitNoteResponseDto | null;
    issuingDebitNote: DebitNoteResponseDto | null;
}

const debitNoteStatusLabels = {
    DRAFT: 'Draft',
    ISSUED: 'Issued',
    VOID: 'Void',
    CANCELLED: 'Cancelled',
};

const debitNoteStatusColors = {
    DRAFT: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
    ISSUED: 'bg-green-100 text-green-800 hover:bg-green-200',
    VOID: 'bg-red-100 text-red-800 hover:bg-red-200',
    CANCELLED: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
};

export default function DebitNotesPage() {
    const { user } = useAuth();
    const merchantSettings = useMerchantSettings();
    const navigate = useNavigate();
    const [state, setState] = useState<DebitNotesPageState>({
        debitNotes: [],
        branches: [],
        customers: [],
        invoices: [],
        loading: true,
        error: null,
        filters: {
            search: '',
        },
        showViewDialog: false,
        showIssueDialog: false,
        viewingDebitNote: null,
        issuingDebitNote: null,
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

    // Load debit notes and related data from API
    const loadDebitNotes = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, loading: true, error: null }));

            const merchantId = getMerchantId();
            if (!merchantId) {
                throw new Error('Merchant ID not found. Please ensure you are logged in.');
            }

            // Load debit notes, branches, customers, and invoices
            const [debitNotesData, branchesData, customersData, invoicesData] = await Promise.all([
                invoicesService.invoiceControllerGetDebitNotes(
                    state.filters.branchId,
                    state.filters.customerId,
                    state.filters.originalInvoiceId,
                    state.filters.status as 'DRAFT' | 'ISSUED' | 'VOID' | 'CANCELLED' | undefined,
                    state.filters.startDate,
                    state.filters.endDate
                ),
                branchesService.branchControllerFindAll(merchantId),
                customersService.customerControllerFindAll(merchantId, '', ''),
                invoicesService.invoiceControllerGetInvoices() // Load all invoices for original invoice filter
            ]);

            // Apply client-side search filter
            let filteredDebitNotes = [...(debitNotesData || [])];
            if (state.filters.search) {
                filteredDebitNotes = filteredDebitNotes.filter(debitNote =>
                    debitNote.debitNoteNumber?.toLowerCase().includes(state.filters.search.toLowerCase()) ||
                    debitNote.customer?.name?.toLowerCase().includes(state.filters.search.toLowerCase()) ||
                    debitNote.reason?.toLowerCase().includes(state.filters.search.toLowerCase()) ||
                    debitNote.originalInvoice?.invoiceNumber?.toLowerCase().includes(state.filters.search.toLowerCase())
                );
            }

            setState(prev => ({
                ...prev,
                debitNotes: filteredDebitNotes,
                branches: branchesData || [],
                customers: customersData || [],
                invoices: invoicesData || [],
                loading: false,
            }));
        } catch (error: any) {
            console.error('Failed to load debit notes:', error);
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
        loadDebitNotes();
    }, [loadDebitNotes]);

    const handleIssueDebitNote = async (debitNote: DebitNoteResponseDto) => {
        try {
            await invoicesService.invoiceControllerIssueDebitNote(debitNote.id);
            toast.success('Debit note issued successfully');
            setState(prev => ({ ...prev, showIssueDialog: false, issuingDebitNote: null }));
            loadDebitNotes();
        } catch (error: any) {
            console.error('Failed to issue debit note:', error);
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
        return debitNoteStatusColors[status as keyof typeof debitNoteStatusColors] || 'bg-gray-100 text-gray-800';
    };

    const handleViewDebitNote = (debitNote: DebitNoteResponseDto) => {
        setState(prev => ({
            ...prev,
            viewingDebitNote: debitNote,
            showViewDialog: true,
        }));
    };

    const handleOpenIssueDialog = (debitNote: DebitNoteResponseDto) => {
        setState(prev => ({
            ...prev,
            issuingDebitNote: debitNote,
            showIssueDialog: true,
        }));
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-muted-foreground">Please log in to view debit notes</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Debit Notes</h1>
                    <p className="text-muted-foreground">
                        Manage additional charges and adjustments to customer invoices
                    </p>
                </div>
                <Button onClick={() => navigate('/invoices/debit-notes/create')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Debit Note
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
                                    placeholder="Search debit notes..."
                                    value={state.filters.search}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="branch">Branch</Label>
                            <Select value={state.filters.branchId || 'all'} onValueChange={(value) => handleFilterChange('branchId', value === 'all' ? undefined : value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All branches" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All branches</SelectItem>
                                    {state.branches.map((branch) => (
                                        <SelectItem key={branch.id} value={branch.id}>
                                            {branch.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="customer">Customer</Label>
                            <Select value={state.filters.customerId || 'all'} onValueChange={(value) => handleFilterChange('customerId', value === 'all' ? undefined : value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All customers" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All customers</SelectItem>
                                    {state.customers.map((customer) => (
                                        <SelectItem key={customer.id} value={customer.id}>
                                            {customer.name}
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
                                    <SelectItem value="DRAFT">Draft</SelectItem>
                                    <SelectItem value="ISSUED">Issued</SelectItem>
                                    <SelectItem value="VOID">Void</SelectItem>
                                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Debit Notes Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Debit Notes</CardTitle>
                </CardHeader>
                <CardContent>
                    {state.loading ? (
                        <div className="flex items-center justify-center h-32">
                            <p className="text-muted-foreground">Loading debit notes...</p>
                        </div>
                    ) : state.error ? (
                        <div className="flex items-center justify-center h-32">
                            <p className="text-destructive">{state.error}</p>
                        </div>
                    ) : state.debitNotes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-32 space-y-2">
                            <FileText className="h-8 w-8 text-muted-foreground" />
                            <p className="text-muted-foreground">No debit notes found</p>
                            <Button variant="outline" onClick={() => navigate('/invoices/debit-notes/create')}>
                                Create your first debit note
                            </Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Debit Note #</TableHead>
                                    <TableHead>Original Invoice</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Reason</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {state.debitNotes.map((debitNote) => (
                                    <TableRow key={debitNote.id}>
                                        <TableCell className="font-medium">
                                            {debitNote.debitNoteNumber}
                                        </TableCell>
                                        <TableCell>
                                            {debitNote.originalInvoice?.invoiceNumber || 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            {debitNote.customer?.name || 'Walk-in Customer'}
                                        </TableCell>
                                        <TableCell>
                                            {formatDate(debitNote.debitNoteDate)}
                                        </TableCell>
                                        <TableCell>
                                            <CardAmount amount={debitNote.totalAmount} />
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(debitNote.status)}>
                                                {debitNoteStatusLabels[debitNote.status as keyof typeof debitNoteStatusLabels]}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="max-w-xs truncate">
                                            {debitNote.reason}
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
                                                    <DropdownMenuItem onClick={() => handleViewDebitNote(debitNote)}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                    {debitNote.status === 'DRAFT' && (
                                                        <DropdownMenuItem onClick={() => handleOpenIssueDialog(debitNote)}>
                                                            <FileText className="mr-2 h-4 w-4" />
                                                            Issue Debit Note
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => navigate(`/invoices/debit-notes/view/${debitNote.id}`)}>
                                                        <FileText className="mr-2 h-4 w-4" />
                                                        View Full Debit Note
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

            {/* View Debit Note Dialog */}
            <Dialog open={state.showViewDialog} onOpenChange={(open) => setState(prev => ({ ...prev, showViewDialog: open, viewingDebitNote: open ? prev.viewingDebitNote : null }))}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Debit Note Details</DialogTitle>
                        <DialogDescription>
                            View debit note information and items
                        </DialogDescription>
                    </DialogHeader>
                    {state.viewingDebitNote && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium">Debit Note Number</p>
                                    <p className="text-sm text-muted-foreground">{state.viewingDebitNote.debitNoteNumber}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Original Invoice</p>
                                    <p className="text-sm text-muted-foreground">{state.viewingDebitNote.originalInvoice?.invoiceNumber}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Customer</p>
                                    <p className="text-sm text-muted-foreground">{state.viewingDebitNote.customer?.name || 'Walk-in Customer'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Date</p>
                                    <p className="text-sm text-muted-foreground">{formatDate(state.viewingDebitNote.debitNoteDate)}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Total Amount</p>
                                    <p className="text-sm text-muted-foreground">
                                        <CardAmount amount={state.viewingDebitNote.totalAmount} />
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Status</p>
                                    <Badge className={getStatusColor(state.viewingDebitNote.status)}>
                                        {debitNoteStatusLabels[state.viewingDebitNote.status as keyof typeof debitNoteStatusLabels]}
                                    </Badge>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium">Reason</p>
                                <p className="text-sm text-muted-foreground">{state.viewingDebitNote.reason}</p>
                            </div>
                            {state.viewingDebitNote.notes && (
                                <div>
                                    <p className="text-sm font-medium">Notes</p>
                                    <p className="text-sm text-muted-foreground">{state.viewingDebitNote.notes}</p>
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setState(prev => ({ ...prev, showViewDialog: false, viewingDebitNote: null }))}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Issue Debit Note Dialog */}
            <Dialog open={state.showIssueDialog} onOpenChange={(open) => setState(prev => ({ ...prev, showIssueDialog: open, issuingDebitNote: open ? prev.issuingDebitNote : null }))}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Issue Debit Note</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to issue this debit note? This action will finalize the debit note and add the charge to the customer account.
                        </DialogDescription>
                    </DialogHeader>
                    {state.issuingDebitNote && (
                        <div className="space-y-4">
                            <div className="rounded-lg border p-4">
                                <p className="font-medium">{state.issuingDebitNote.debitNoteNumber}</p>
                                <p className="text-sm text-muted-foreground">
                                    Customer: {state.issuingDebitNote.customer?.name || 'Walk-in Customer'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Amount: <CardAmount amount={state.issuingDebitNote.totalAmount} />
                                </p>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setState(prev => ({ ...prev, showIssueDialog: false, issuingDebitNote: null }))}>
                            Cancel
                        </Button>
                        <Button
                            onClick={() => state.issuingDebitNote && handleIssueDebitNote(state.issuingDebitNote)}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            <FileText className="mr-2 h-4 w-4" />
                            Issue Debit Note
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
} 