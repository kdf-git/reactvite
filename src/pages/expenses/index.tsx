import { useState, useEffect } from 'react';
import { Plus, Search, MoreHorizontal, Edit, Trash2, Receipt, Eye, DollarSign, Calendar, Filter } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useMerchantSettings, formatCurrency } from '@/hooks/useMerchantSettings';
import { CardAmount } from '@/components/ui/amount-display';
import { expensesService, expenseCategoriesService, branchesService, paymentModesService } from '@/services/sdk';
import { VendorSearch } from '@/components/ui/vendor-search';
import { CreateExpenseDto, UpdateExpenseDto } from '@/lib/sdk';
import type { ExpenseResponseDto, ExpenseCategoryResponseDto, BranchResponseDto, PaymentModeResponseDto, VendorResponseDto } from '@/lib/sdk';

// Update interfaces to match the API DTOs
interface Expense extends ExpenseResponseDto { }

interface ExpenseCategory extends ExpenseCategoryResponseDto { }

interface Branch extends BranchResponseDto { }

interface PaymentMode extends PaymentModeResponseDto { }

interface ExpenseFormData {
    title: string;
    description: string;
    amount: number;
    taxAmount: number;
    totalAmount: number;
    expenseDate: string; // ISO string for API
    dueDate: string | null; // ISO string for API
    categoryId: string;
    branchId: string | null;
    vendorId: string | null;
    paymentModeId: string | null;
    referenceNumber: string;
    receiptNumber: string;
    notes: string;
    attachments: string[];
}

interface ExpensesPageState {
    expenses: Expense[];
    categories: ExpenseCategory[];
    branches: Branch[];
    paymentModes: PaymentMode[];
    loading: boolean;
    error: string | null;
    filters: {
        search: string;
        categoryId?: string;
        vendorId?: string;
        branchId?: string;
        status?: string;
        startDate?: string;
        endDate?: string;
    };
    showCreateDialog: boolean;
    showEditDialog: boolean;
    showDeleteDialog: boolean;
    showViewDialog: boolean;
    editingExpense: Expense | null;
    deletingExpense: Expense | null;
    viewingExpense: Expense | null;
}

const initialFormData: ExpenseFormData = {
    title: '',
    description: '',
    amount: 0,
    taxAmount: 0,
    totalAmount: 0,
    expenseDate: new Date().toISOString().split('T')[0],
    dueDate: null,
    categoryId: '',
    branchId: null,
    vendorId: null,
    paymentModeId: null,
    referenceNumber: '',
    receiptNumber: '',
    notes: '',
    attachments: [],
};

export default function ExpensesPage() {
    const { user } = useAuth();
    const merchantSettings = useMerchantSettings();
    const [state, setState] = useState<ExpensesPageState>({
        expenses: [],
        categories: [],
        branches: [],
        paymentModes: [],
        loading: true,
        error: null,
        filters: {
            search: '',
        },
        showCreateDialog: false,
        showEditDialog: false,
        showDeleteDialog: false,
        showViewDialog: false,
        editingExpense: null,
        deletingExpense: null,
        viewingExpense: null,
    });

    const [createForm, setCreateForm] = useState<ExpenseFormData>(initialFormData);
    const [editForm, setEditForm] = useState<ExpenseFormData>(initialFormData);

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

    // Get userId from user context
    const getUserId = (): string | null => {
        return user?.id || null;
    };

    const loadExpenses = async () => {
        try {
            setState(prev => ({ ...prev, loading: true, error: null }));

            const merchantId = getMerchantId();
            if (!merchantId) {
                throw new Error('Merchant ID not found. Please ensure you are logged in.');
            }

            // Call the expenses API with all filter parameters
            const expenses = await expensesService.expenseControllerFindAll(
                merchantId,
                state.filters.branchId,
                state.filters.categoryId,
                state.filters.vendorId,
                state.filters.status as any,
                undefined,
                state.filters.startDate,
                state.filters.endDate,
                state.filters.search
            );

            setState(prev => ({
                ...prev,
                expenses: expenses,
                loading: false,
            }));
        } catch (error: any) {
            console.error('Failed to load expenses:', error);
            setState(prev => ({
                ...prev,
                error: error.message || 'Failed to load expenses',
                loading: false,
            }));
            toast.error(error.message || 'Failed to load expenses');
        }
    };

    const loadCategories = async () => {
        try {
            console.log('Loading expense categories...');

            // Check if user is authenticated
            if (!user) {
                console.log('User not authenticated, skipping categories load');
                return;
            }

            // Call the expense categories API to get live data
            console.log('Calling expenseCategoriesService.expenseCategoryControllerFindAll()');
            const categories = await expenseCategoriesService.expenseCategoryControllerFindAll();
            console.log('Loaded expense categories:', categories);

            // Use the categories directly since they already match ExpenseCategoryResponseDto
            setState(prev => ({ ...prev, categories }));
            console.log('Categories state updated successfully');
        } catch (error: any) {
            console.error('Failed to load expense categories:', error);
            console.error('Error details:', error.response?.data || error.message);
            toast.error('Failed to load expense categories: ' + (error.message || 'Unknown error'));
        }
    };

    const loadBranches = async () => {
        try {
            console.log('Loading branches...');

            const merchantId = getMerchantId();
            if (!merchantId) {
                console.log('Merchant ID not found, skipping branches load');
                return;
            }

            // Call the branches API to get live data
            const branches = await branchesService.branchControllerFindAll(merchantId);
            console.log('Loaded branches:', branches);

            // Use the branches directly since they already match BranchResponseDto
            setState(prev => ({ ...prev, branches }));
            console.log('Branches state updated successfully');
        } catch (error: any) {
            console.error('Failed to load branches:', error);
            console.error('Error details:', error.response?.data || error.message);
            toast.error('Failed to load branches: ' + (error.message || 'Unknown error'));
        }
    };

    const loadPaymentModes = async () => {
        try {
            console.log('Loading payment modes...');

            const merchantId = getMerchantId();
            if (!merchantId) {
                console.log('Merchant ID not found, skipping payment modes load');
                return;
            }

            // Call the payment modes API to get live data with active filter
            const paymentModes = await paymentModesService.paymentModeControllerFindAll(merchantId, true);
            console.log('Loaded payment modes:', paymentModes);

            // Use the payment modes directly since they already match PaymentModeResponseDto
            setState(prev => ({ ...prev, paymentModes }));
            console.log('Payment modes state updated successfully');
        } catch (error: any) {
            console.error('Failed to load payment modes:', error);
            console.error('Error details:', error.response?.data || error.message);
            toast.error('Failed to load payment modes: ' + (error.message || 'Unknown error'));
        }
    };

    const loadSupportingData = async () => {
        try {
            // Load all supporting data in parallel
            await Promise.all([
                loadCategories(),
                loadBranches(),
                loadPaymentModes()
            ]);
        } catch (error: any) {
            console.error('Failed to load supporting data:', error);
            toast.error('Failed to load supporting data');
        }
    };

    useEffect(() => {
        if (user) {
            loadExpenses();
            loadSupportingData();
        }
    }, [user, state.filters]);

    // Handle create expense
    const handleCreateExpense = async () => {
        try {
            const merchantId = getMerchantId();
            const userId = getUserId();
            if (!merchantId || !userId) {
                throw new Error('Merchant ID or User ID not found');
            }

            const createData: CreateExpenseDto = {
                merchantId,
                title: createForm.title,
                description: createForm.description || undefined,
                amount: createForm.amount,
                taxAmount: createForm.taxAmount,
                totalAmount: createForm.totalAmount,
                expenseDate: createForm.expenseDate,
                dueDate: createForm.dueDate || undefined,
                categoryId: createForm.categoryId,
                branchId: createForm.branchId || undefined,
                vendorId: createForm.vendorId || undefined,
                paymentModeId: createForm.paymentModeId || undefined,
                referenceNumber: createForm.referenceNumber || undefined,
                receiptNumber: createForm.receiptNumber || undefined,
                notes: createForm.notes || undefined,
                attachments: createForm.attachments.length > 0 ? createForm.attachments : undefined,
                createdBy: userId,
                status: CreateExpenseDto.status.PAID, // Mark as paid on creation
            };

            await expensesService.expenseControllerCreate(createData);
            toast.success('Expense created and marked as paid successfully');
            setState(prev => ({ ...prev, showCreateDialog: false }));
            setCreateForm(initialFormData);
            loadExpenses();
        } catch (error: any) {
            console.error('Failed to create expense:', error);
            toast.error(error.message || 'Failed to create expense');
        }
    };

    // Handle update expense
    const handleUpdateExpense = async () => {
        if (!state.editingExpense) return;

        try {
            const updateData: UpdateExpenseDto = {
                title: editForm.title,
                description: editForm.description || undefined,
                amount: editForm.amount,
                taxAmount: editForm.taxAmount,
                totalAmount: editForm.totalAmount,
                expenseDate: editForm.expenseDate,
                dueDate: editForm.dueDate || undefined,
                categoryId: editForm.categoryId,
                branchId: editForm.branchId || undefined,
                vendorId: editForm.vendorId || undefined,
                paymentModeId: editForm.paymentModeId || undefined,
                referenceNumber: editForm.referenceNumber || undefined,
                receiptNumber: editForm.receiptNumber || undefined,
                notes: editForm.notes || undefined,
                attachments: editForm.attachments.length > 0 ? editForm.attachments : undefined,
            };

            await expensesService.expenseControllerUpdate(state.editingExpense.id, updateData);
            toast.success('Expense updated successfully');
            setState(prev => ({ ...prev, showEditDialog: false, editingExpense: null }));
            setEditForm(initialFormData);
            loadExpenses();
        } catch (error: any) {
            console.error('Failed to update expense:', error);
            toast.error(error.message || 'Failed to update expense');
        }
    };

    // Handle delete expense
    const handleDeleteExpense = async () => {
        if (!state.deletingExpense) return;

        try {
            await expensesService.expenseControllerDelete(state.deletingExpense.id);
            toast.success('Expense deleted successfully');
            setState(prev => ({ ...prev, showDeleteDialog: false, deletingExpense: null }));
            loadExpenses();
        } catch (error: any) {
            console.error('Failed to delete expense:', error);
            toast.error(error.message || 'Failed to delete expense');
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

    // Update total amount when amount or tax changes
    const updateTotalAmount = (form: ExpenseFormData, setForm: (form: ExpenseFormData) => void) => {
        const totalAmount = form.amount + form.taxAmount;
        setForm({ ...form, totalAmount });
    };

    // Get status badge
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'DRAFT': return <Badge variant="outline" className="border-gray-300 bg-gray-50 text-gray-700">Draft</Badge>;
            case 'PENDING': return <Badge variant="outline" className="border-yellow-300 bg-yellow-50 text-yellow-700">Pending</Badge>;
            case 'APPROVED': return <Badge variant="outline" className="border-green-300 bg-green-50 text-green-700">Approved</Badge>;
            case 'REJECTED': return <Badge variant="outline" className="border-red-300 bg-red-50 text-red-700">Rejected</Badge>;
            case 'PAID': return <Badge variant="outline" className="border-blue-300 bg-blue-50 text-blue-700">Paid</Badge>;
            case 'CANCELLED': return <Badge variant="outline" className="border-gray-300 bg-gray-50 text-gray-700">Cancelled</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    // Format date for display
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    // Convert date to input format
    const toInputDate = (dateString: string) => {
        return new Date(dateString).toISOString().split('T')[0];
    };

    // Show loading or error if user is not available
    if (!user) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-muted-foreground">Please log in to view expenses</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
                    <p className="text-muted-foreground">
                        Manage business expenses and track spending
                    </p>
                </div>
                <Button onClick={() => setState(prev => ({ ...prev, showCreateDialog: true }))}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Expense
                </Button>
            </div>

            {/* Dashboard Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{state.expenses.length}</div>
                        <p className="text-xs text-muted-foreground">
                            All recorded expenses
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <CardAmount
                            amount={state.expenses.reduce((sum, expense) => sum + expense.totalAmount, 0)}
                            variant="red"
                        />
                        <p className="text-xs text-muted-foreground">
                            Total expense value
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">This Month</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <CardAmount
                            amount={state.expenses
                                .filter(e => new Date(e.expenseDate).getMonth() === new Date().getMonth())
                                .reduce((sum, expense) => sum + expense.totalAmount, 0)}
                            variant="orange"
                        />
                        <p className="text-xs text-muted-foreground">
                            Current month expenses
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
                    <div className="space-y-4">
                        {/* Search Row */}
                        <div className="flex flex-col gap-4 md:flex-row md:items-end">
                            <div className="flex-1">
                                <Label htmlFor="search">Search</Label>
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="search"
                                        placeholder="Search expenses by title, number, or description..."
                                        value={state.filters.search}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        className="pl-8"
                                    />
                                </div>
                            </div>
                            <div className="flex items-end">
                                <Button variant="outline" onClick={loadExpenses}>
                                    <Search className="mr-2 h-4 w-4" />
                                    Refresh
                                </Button>
                            </div>
                        </div>

                        {/* Filter Row 1: Category, Vendor, Branch */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div>
                                <Label>Category</Label>
                                <Select
                                    value={state.filters.categoryId || 'all'}
                                    onValueChange={(value) =>
                                        handleFilterChange('categoryId', value === 'all' ? undefined : value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Categories" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        {state.categories.map((category) => (
                                            <SelectItem key={category.id} value={category.id}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Vendor</Label>
                                <VendorSearch
                                    value={state.filters.vendorId}
                                    onValueChange={(value) => handleFilterChange('vendorId', value)}
                                    placeholder="Filter by vendor..."
                                />
                            </div>

                            <div>
                                <Label>Branch</Label>
                                <Select
                                    value={state.filters.branchId || 'all'}
                                    onValueChange={(value) =>
                                        handleFilterChange('branchId', value === 'all' ? undefined : value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Branches" />
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
                        </div>

                        {/* Filter Row 2: Status, Date Range */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div>
                                <Label>Status</Label>
                                <Select
                                    value={state.filters.status || 'all'}
                                    onValueChange={(value) =>
                                        handleFilterChange('status', value === 'all' ? undefined : value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="DRAFT">Draft</SelectItem>
                                        <SelectItem value="PENDING">Pending</SelectItem>
                                        <SelectItem value="APPROVED">Approved</SelectItem>
                                        <SelectItem value="REJECTED">Rejected</SelectItem>
                                        <SelectItem value="PAID">Paid</SelectItem>
                                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Start Date</Label>
                                <Input
                                    type="date"
                                    value={state.filters.startDate || ''}
                                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                    placeholder="From date"
                                />
                            </div>

                            <div>
                                <Label>End Date</Label>
                                <Input
                                    type="date"
                                    value={state.filters.endDate || ''}
                                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                    placeholder="To date"
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

            {/* Expenses Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Expenses ({state.expenses.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Expense</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-12"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {state.loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">
                                        Loading expenses...
                                    </TableCell>
                                </TableRow>
                            ) : state.expenses.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">
                                        No expenses found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                state.expenses.map((expense) => (
                                    <TableRow key={expense.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                                    <Receipt className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="font-medium">{expense.title}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {expense.expenseNumber}
                                                    </div>
                                                    {expense.description && (
                                                        <div className="text-sm text-muted-foreground">
                                                            {expense.description.length > 50
                                                                ? `${expense.description.substring(0, 50)}...`
                                                                : expense.description}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{expense.category?.name || 'No Category'}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{formatCurrency(expense.totalAmount, merchantSettings)}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    Base: {formatCurrency(expense.amount, merchantSettings)}
                                                    {expense.taxAmount > 0 && ` + Tax: ${formatCurrency(expense.taxAmount, merchantSettings)}`}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                {new Date(expense.expenseDate).toLocaleDateString()}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(expense.status)}
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
                                                        onClick={() => {
                                                            setState(prev => ({ ...prev, showViewDialog: true, viewingExpense: expense }));
                                                        }}
                                                    >
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setState(prev => ({ ...prev, showEditDialog: true, editingExpense: expense }));
                                                            setEditForm({
                                                                title: expense.title,
                                                                description: expense.description || '',
                                                                amount: expense.amount,
                                                                taxAmount: expense.taxAmount,
                                                                totalAmount: expense.totalAmount,
                                                                expenseDate: toInputDate(expense.expenseDate),
                                                                dueDate: expense.dueDate ? toInputDate(expense.dueDate) : null,
                                                                categoryId: expense.categoryId,
                                                                branchId: expense.branchId || null,
                                                                vendorId: expense.vendorId || null,
                                                                paymentModeId: expense.paymentModeId || null,
                                                                referenceNumber: expense.referenceNumber || '',
                                                                receiptNumber: expense.receiptNumber || '',
                                                                notes: expense.notes || '',
                                                                attachments: expense.attachments || [],
                                                            });
                                                        }}
                                                    >
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => setState(prev => ({ ...prev, showDeleteDialog: true, deletingExpense: expense }))}
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

            {/* Create Expense Dialog */}
            <Dialog open={state.showCreateDialog} onOpenChange={(open) => setState(prev => ({ ...prev, showCreateDialog: open }))}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add New Expense</DialogTitle>
                        <DialogDescription>
                            Create a new expense record for tracking business spending.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Title *</Label>
                                <Input
                                    id="title"
                                    value={createForm.title}
                                    onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="Enter expense title"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="category">Category *</Label>
                                <Select
                                    value={createForm.categoryId}
                                    onValueChange={(value) => setCreateForm(prev => ({ ...prev, categoryId: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {state.categories.map((category) => (
                                            <SelectItem key={category.id} value={category.id}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={createForm.description}
                                onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Enter expense description"
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="vendor">Vendor</Label>
                                <VendorSearch
                                    value={createForm.vendorId || ''}
                                    onValueChange={(value) => setCreateForm(prev => ({ ...prev, vendorId: value === '' ? null : value }))}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="branch">Branch</Label>
                                <Select
                                    value={createForm.branchId || ''}
                                    onValueChange={(value) => setCreateForm(prev => ({ ...prev, branchId: value === '' ? null : value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select branch" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {state.branches.map((branch) => (
                                            <SelectItem key={branch.id} value={branch.id}>
                                                {branch.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="amount">Amount *</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    value={createForm.amount}
                                    onChange={(e) => {
                                        const newForm = { ...createForm, amount: parseFloat(e.target.value) || 0 };
                                        updateTotalAmount(newForm, setCreateForm);
                                    }}
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="taxAmount">Tax Amount</Label>
                                <Input
                                    id="taxAmount"
                                    type="number"
                                    step="0.01"
                                    value={createForm.taxAmount}
                                    onChange={(e) => {
                                        const newForm = { ...createForm, taxAmount: parseFloat(e.target.value) || 0 };
                                        updateTotalAmount(newForm, setCreateForm);
                                    }}
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="totalAmount">Total Amount</Label>
                                <Input
                                    id="totalAmount"
                                    type="number"
                                    step="0.01"
                                    value={createForm.totalAmount}
                                    readOnly
                                    className="bg-muted"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="expenseDate">Expense Date *</Label>
                                <Input
                                    id="expenseDate"
                                    type="date"
                                    value={createForm.expenseDate}
                                    onChange={(e) => setCreateForm(prev => ({ ...prev, expenseDate: e.target.value }))}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="dueDate">Due Date</Label>
                                <Input
                                    id="dueDate"
                                    type="date"
                                    value={createForm.dueDate || ''}
                                    onChange={(e) => setCreateForm(prev => ({ ...prev, dueDate: e.target.value || null }))}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                value={createForm.notes}
                                onChange={(e) => setCreateForm(prev => ({ ...prev, notes: e.target.value }))}
                                placeholder="Additional notes"
                                rows={2}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setState(prev => ({ ...prev, showCreateDialog: false }))}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateExpense}>Add Expense</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Expense Dialog */}
            <Dialog open={state.showEditDialog} onOpenChange={(open) => setState(prev => ({ ...prev, showEditDialog: open }))}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Expense</DialogTitle>
                        <DialogDescription>
                            Update expense information and details.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="editTitle">Title *</Label>
                                <Input
                                    id="editTitle"
                                    value={editForm.title}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="Enter expense title"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="editCategory">Category *</Label>
                                <Select
                                    value={editForm.categoryId}
                                    onValueChange={(value) => setEditForm(prev => ({ ...prev, categoryId: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {state.categories.map((category) => (
                                            <SelectItem key={category.id} value={category.id}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="editDescription">Description</Label>
                            <Textarea
                                id="editDescription"
                                value={editForm.description}
                                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Enter expense description"
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="editVendor">Vendor</Label>
                                <VendorSearch
                                    value={editForm.vendorId || ''}
                                    onValueChange={(value) => setEditForm(prev => ({ ...prev, vendorId: value === '' ? null : value }))}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="editBranch">Branch</Label>
                                <Select
                                    value={editForm.branchId || ''}
                                    onValueChange={(value) => setEditForm(prev => ({ ...prev, branchId: value === '' ? null : value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select branch" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {state.branches.map((branch) => (
                                            <SelectItem key={branch.id} value={branch.id}>
                                                {branch.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="editAmount">Amount *</Label>
                                <Input
                                    id="editAmount"
                                    type="number"
                                    step="0.01"
                                    value={editForm.amount}
                                    onChange={(e) => {
                                        const newForm = { ...editForm, amount: parseFloat(e.target.value) || 0 };
                                        updateTotalAmount(newForm, setEditForm);
                                    }}
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="editTaxAmount">Tax Amount</Label>
                                <Input
                                    id="editTaxAmount"
                                    type="number"
                                    step="0.01"
                                    value={editForm.taxAmount}
                                    onChange={(e) => {
                                        const newForm = { ...editForm, taxAmount: parseFloat(e.target.value) || 0 };
                                        updateTotalAmount(newForm, setEditForm);
                                    }}
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="editTotalAmount">Total Amount</Label>
                                <Input
                                    id="editTotalAmount"
                                    type="number"
                                    step="0.01"
                                    value={editForm.totalAmount}
                                    readOnly
                                    className="bg-muted"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="editExpenseDate">Expense Date *</Label>
                                <Input
                                    id="editExpenseDate"
                                    type="date"
                                    value={editForm.expenseDate}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, expenseDate: e.target.value }))}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="editDueDate">Due Date</Label>
                                <Input
                                    id="editDueDate"
                                    type="date"
                                    value={editForm.dueDate || ''}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, dueDate: e.target.value || null }))}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="editNotes">Notes</Label>
                            <Textarea
                                id="editNotes"
                                value={editForm.notes}
                                onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                                placeholder="Additional notes"
                                rows={2}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setState(prev => ({ ...prev, showEditDialog: false }))}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateExpense}>Update Expense</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Expense Dialog */}
            <Dialog open={state.showViewDialog} onOpenChange={(open) => setState(prev => ({ ...prev, showViewDialog: open }))}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Expense Details</DialogTitle>
                    </DialogHeader>
                    {state.viewingExpense && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Expense Number</Label>
                                    <p className="text-sm font-mono">{state.viewingExpense.expenseNumber}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Title</Label>
                                    <p className="text-sm">{state.viewingExpense.title}</p>
                                </div>
                            </div>

                            {state.viewingExpense.description && (
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                                    <p className="text-sm">{state.viewingExpense.description}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Category</Label>
                                    <p className="text-sm">{state.viewingExpense.category?.name || 'No Category'}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Vendor</Label>
                                    <p className="text-sm">{state.viewingExpense.vendor?.name || 'No Vendor'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Amount</Label>
                                    <p className="text-sm">{formatCurrency(state.viewingExpense.amount, merchantSettings)}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Tax Amount</Label>
                                    <p className="text-sm">{formatCurrency(state.viewingExpense.taxAmount, merchantSettings)}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Total Amount</Label>
                                    <p className="text-sm font-medium">{formatCurrency(state.viewingExpense.totalAmount, merchantSettings)}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Expense Date</Label>
                                    <p className="text-sm">{new Date(state.viewingExpense.expenseDate).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Due Date</Label>
                                    <p className="text-sm">{state.viewingExpense.dueDate ? new Date(state.viewingExpense.dueDate).toLocaleDateString() : 'Not set'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                                    <div>{getStatusBadge(state.viewingExpense.status)}</div>
                                </div>
                            </div>

                            {state.viewingExpense.notes && (
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Notes</Label>
                                    <p className="text-sm">{state.viewingExpense.notes}</p>
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

            {/* Delete Expense Dialog */}
            <Dialog open={state.showDeleteDialog} onOpenChange={(open) => setState(prev => ({ ...prev, showDeleteDialog: open }))}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Expense</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{state.deletingExpense?.title}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setState(prev => ({ ...prev, showDeleteDialog: false }))}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteExpense}>
                            Delete Expense
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
} 