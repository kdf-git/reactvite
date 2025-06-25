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
    CreditNoteResponseDto,
    BranchResponseDto,
    CustomerResponseDto,
    InvoiceResponseDto
} from '@/lib/sdk';
import { useNavigate } from 'react-router-dom';

interface CreditNotesPageState {
    creditNotes: CreditNoteResponseDto[];
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
    viewingCreditNote: CreditNoteResponseDto | null;
    issuingCreditNote: CreditNoteResponseDto | null;
}

const creditNoteStatusLabels = {
    DRAFT: 'Draft',
    ISSUED: 'Issued',
    CREDIT_NOTE: 'Credit Note', // Add this status which is used by the backend
    VOID: 'Void',
    CANCELLED: 'Cancelled',
};

const creditNoteStatusColors = {
    DRAFT: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
    ISSUED: 'bg-green-100 text-green-800 hover:bg-green-200',
    CREDIT_NOTE: 'bg-green-100 text-green-800 hover:bg-green-200', // Same as issued
    VOID: 'bg-red-100 text-red-800 hover:bg-red-200',
    CANCELLED: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
};

export default function CreditNotesPage() {
    const { user } = useAuth();
    const merchantSettings = useMerchantSettings();
    const navigate = useNavigate();
    const [state, setState] = useState<CreditNotesPageState>({
        creditNotes: [],
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
        viewingCreditNote: null,
        issuingCreditNote: null,
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

    // Load credit notes and related data from API
    const loadCreditNotes = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, loading: true, error: null }));

            const merchantId = getMerchantId();
            if (!merchantId) {
                throw new Error('Merchant ID not found. Please ensure you are logged in.');
            }

            // Load credit notes, branches, customers, and invoices
            const [creditNotesData, branchesData, customersData, invoicesData] = await Promise.all([
                invoicesService.invoiceControllerGetCreditNotes(
                    state.filters.branchId,
                    state.filters.customerId,
                    state.filters.originalInvoiceId,
                    state.filters.status as 'DRAFT' | 'ISSUED' | 'VOID' | 'CANCELLED' | undefined,
                    state.filters.startDate,
                    state.filters.endDate
                ),
                branchesService.branchControllerFindAll(merchantId),
                customersService.customerControllerFindAll(merchantId, null, ''),
                invoicesService.invoiceControllerGetInvoices() // Load all invoices for original invoice filter
            ]);

            // Apply client-side search filter
            let filteredCreditNotes = [...(creditNotesData || [])];
            if (state.filters.search) {
                filteredCreditNotes = filteredCreditNotes.filter(creditNote =>
                    creditNote.creditNoteNumber?.toLowerCase().includes(state.filters.search.toLowerCase()) ||
                    creditNote.customer?.name?.toLowerCase().includes(state.filters.search.toLowerCase()) ||
                    creditNote.reason?.toLowerCase().includes(state.filters.search.toLowerCase()) ||
                    creditNote.originalInvoice?.invoiceNumber?.toLowerCase().includes(state.filters.search.toLowerCase())
                );
            }

            setState(prev => ({
                ...prev,
                creditNotes: filteredCreditNotes,
                branches: branchesData || [],
                customers: customersData || [],
                invoices: invoicesData || [],
                loading: false,
            }));
        } catch (error: any) {
            console.error('Failed to load credit notes:', error);
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
        loadCreditNotes();
    }, [loadCreditNotes]);

    const handleIssueCreditNote = async (creditNote: CreditNoteResponseDto) => {
        try {
            await invoicesService.invoiceControllerIssueCreditNote(creditNote.id);
            toast.success('Credit note issued successfully');
            setState(prev => ({ ...prev, showIssueDialog: false, issuingCreditNote: null }));
            loadCreditNotes();
        } catch (error: any) {
            console.error('Failed to issue credit note:', error);
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
        return creditNoteStatusColors[status as keyof typeof creditNoteStatusColors] || 'bg-gray-100 text-gray-800';
    };

    const handleViewCreditNote = (creditNote: CreditNoteResponseDto) => {
        setState(prev => ({
            ...prev,
            viewingCreditNote: creditNote,
            showViewDialog: true,
        }));
    };

    const handleOpenIssueDialog = (creditNote: CreditNoteResponseDto) => {
        setState(prev => ({
            ...prev,
            issuingCreditNote: creditNote,
            showIssueDialog: true,
        }));
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-muted-foreground">Please log in to view credit notes</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Credit Notes</h1>
                    <p className="text-muted-foreground">
                        Manage customer credit notes for returns and adjustments
                    </p>
                </div>
                <Button onClick={() => navigate('/invoices/credit-notes/create')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Credit Note
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
                                    placeholder="Search credit notes..."
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

            {/* Credit Notes Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Credit Notes</CardTitle>
                </CardHeader>
                <CardContent>
                    {state.loading ? (
                        <div className="flex items-center justify-center h-32">
                            <p className="text-muted-foreground">Loading credit notes...</p>
                        </div>
                    ) : state.error ? (
                        <div className="flex items-center justify-center h-32">
                            <p className="text-destructive">{state.error}</p>
                        </div>
                    ) : state.creditNotes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-32 space-y-2">
                            <FileText className="h-8 w-8 text-muted-foreground" />
                            <p className="text-muted-foreground">No credit notes found</p>
                            <Button variant="outline" onClick={() => navigate('/invoices/credit-notes/create')}>
                                Create your first credit note
                            </Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Credit Note #</TableHead>
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
                                {state.creditNotes.map((creditNote) => (
                                    <TableRow key={creditNote.id}>
                                        <TableCell className="font-medium">
                                            {creditNote.creditNoteNumber}
                                        </TableCell>
                                        <TableCell>
                                            {creditNote.originalInvoice?.invoiceNumber || 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            {creditNote.customer?.name || 'Walk-in Customer'}
                                        </TableCell>
                                        <TableCell>
                                            {formatDate(creditNote.creditNoteDate)}
                                        </TableCell>
                                        <TableCell>
                                            {formatCurrency(creditNote.totalAmount, merchantSettings)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(creditNote.status)}>
                                                {creditNoteStatusLabels[creditNote.status as keyof typeof creditNoteStatusLabels]}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="max-w-xs truncate">
                                            {creditNote.reason}
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
                                                    <DropdownMenuItem onClick={() => handleViewCreditNote(creditNote)}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                    {creditNote.status === 'DRAFT' && (
                                                        <DropdownMenuItem onClick={() => handleOpenIssueDialog(creditNote)}>
                                                            <FileText className="mr-2 h-4 w-4" />
                                                            Issue Credit Note
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => navigate(`/invoices/credit-notes/view/${creditNote.id}`)}>
                                                        <FileText className="mr-2 h-4 w-4" />
                                                        View Full Credit Note
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

            {/* View Credit Note Dialog */}
            <Dialog open={state.showViewDialog} onOpenChange={(open) => setState(prev => ({ ...prev, showViewDialog: open, viewingCreditNote: open ? prev.viewingCreditNote : null }))}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Credit Note Details</DialogTitle>
                        <DialogDescription>
                            View credit note information and items
                        </DialogDescription>
                    </DialogHeader>
                    {state.viewingCreditNote && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium">Credit Note Number</p>
                                    <p className="text-sm text-muted-foreground">{state.viewingCreditNote.creditNoteNumber}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Original Invoice</p>
                                    <p className="text-sm text-muted-foreground">{state.viewingCreditNote.originalInvoice?.invoiceNumber}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Customer</p>
                                    <p className="text-sm text-muted-foreground">{state.viewingCreditNote.customer?.name || 'Walk-in Customer'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Date</p>
                                    <p className="text-sm text-muted-foreground">{formatDate(state.viewingCreditNote.creditNoteDate)}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Total Amount</p>
                                    <p className="text-sm text-muted-foreground">
                                        <CardAmount amount={state.viewingCreditNote.totalAmount} />
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Status</p>
                                    <Badge className={getStatusColor(state.viewingCreditNote.status)}>
                                        {creditNoteStatusLabels[state.viewingCreditNote.status as keyof typeof creditNoteStatusLabels]}
                                    </Badge>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium">Reason</p>
                                <p className="text-sm text-muted-foreground">{state.viewingCreditNote.reason}</p>
                            </div>
                            {state.viewingCreditNote.notes && (
                                <div>
                                    <p className="text-sm font-medium">Notes</p>
                                    <p className="text-sm text-muted-foreground">{state.viewingCreditNote.notes}</p>
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setState(prev => ({ ...prev, showViewDialog: false, viewingCreditNote: null }))}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Issue Credit Note Dialog */}
            <Dialog open={state.showIssueDialog} onOpenChange={(open) => setState(prev => ({ ...prev, showIssueDialog: open, issuingCreditNote: open ? prev.issuingCreditNote : null }))}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Issue Credit Note</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to issue this credit note? This action will finalize the credit note and apply the credit to the customer account.
                        </DialogDescription>
                    </DialogHeader>
                    {state.issuingCreditNote && (
                        <div className="space-y-4">
                            <div className="rounded-lg border p-4">
                                <p className="font-medium">{state.issuingCreditNote.creditNoteNumber}</p>
                                <p className="text-sm text-muted-foreground">
                                    Customer: {state.issuingCreditNote.customer?.name || 'Walk-in Customer'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Amount: <CardAmount amount={state.issuingCreditNote.totalAmount} />
                                </p>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setState(prev => ({ ...prev, showIssueDialog: false, issuingCreditNote: null }))}>
                            Cancel
                        </Button>
                        <Button
                            onClick={() => state.issuingCreditNote && handleIssueCreditNote(state.issuingCreditNote)}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            <FileText className="mr-2 h-4 w-4" />
                            Issue Credit Note
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
} 