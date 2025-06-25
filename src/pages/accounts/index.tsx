import { useState, useEffect } from 'react';
import { Plus, Search, MoreHorizontal, Edit, Trash2, Building, Eye, BarChart3, TreePine } from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useMerchantSettings, formatCurrency } from '@/hooks/useMerchantSettings';
import { accountsService } from '@/services/sdk';
import type { AccountResponseDto, CreateAccountDto, UpdateAccountDto } from '@/lib/sdk';

// Account types for the select dropdown
const ACCOUNT_TYPES = [
    { value: 'ASSET', label: 'Asset' },
    { value: 'LIABILITY', label: 'Liability' },
    { value: 'EQUITY', label: 'Equity' },
    { value: 'REVENUE', label: 'Revenue' },
    { value: 'EXPENSE', label: 'Expense' },
];

const ACCOUNT_SUB_TYPES = {
    ASSET: [
        { value: 'CURRENT_ASSET', label: 'Current Asset' },
        { value: 'FIXED_ASSET', label: 'Fixed Asset' },
        { value: 'OTHER_ASSET', label: 'Other Asset' },
    ],
    LIABILITY: [
        { value: 'CURRENT_LIABILITY', label: 'Current Liability' },
        { value: 'LONG_TERM_LIABILITY', label: 'Long Term Liability' },
        { value: 'OTHER_LIABILITY', label: 'Other Liability' },
    ],
    EQUITY: [
        { value: 'OWNER_EQUITY', label: 'Owner Equity' },
        { value: 'RETAINED_EARNINGS', label: 'Retained Earnings' },
        { value: 'OTHER_EQUITY', label: 'Other Equity' },
    ],
    REVENUE: [
        { value: 'OPERATING_REVENUE', label: 'Operating Revenue' },
        { value: 'OTHER_REVENUE', label: 'Other Revenue' },
    ],
    EXPENSE: [
        { value: 'OPERATING_EXPENSE', label: 'Operating Expense' },
        { value: 'OTHER_EXPENSE', label: 'Other Expense' },
    ],
};

const BALANCE_TYPES = [
    { value: 'DEBIT', label: 'Debit' },
    { value: 'CREDIT', label: 'Credit' },
];

interface Account extends AccountResponseDto { }

interface AccountFormData {
    accountCode: string;
    accountName: string;
    description: string;
    accountType: string;
    accountSubType: string;
    normalBalance: string;
    parentAccountId?: string;
    isActive: boolean;
    isSystemAccount: boolean;
}

interface AccountsPageState {
    accounts: Account[];
    loading: boolean;
    error: string | null;
    filters: {
        search: string;
        accountType?: string;
        isActive?: boolean;
    };
    showCreateDialog: boolean;
    showEditDialog: boolean;
    showDeleteDialog: boolean;
    showViewDialog: boolean;
    editingAccount: Account | null;
    deletingAccount: Account | null;
    viewingAccount: Account | null;
}

const initialFormData: AccountFormData = {
    accountCode: '',
    accountName: '',
    description: '',
    accountType: '',
    accountSubType: '',
    normalBalance: '',
    isActive: true,
    isSystemAccount: false,
};

export default function AccountsPage() {
    const { user } = useAuth();
    const merchantSettings = useMerchantSettings();
    const [state, setState] = useState<AccountsPageState>({
        accounts: [],
        loading: true,
        error: null,
        filters: {
            search: '',
        },
        showCreateDialog: false,
        showEditDialog: false,
        showDeleteDialog: false,
        showViewDialog: false,
        editingAccount: null,
        deletingAccount: null,
        viewingAccount: null,
    });

    const [createForm, setCreateForm] = useState<AccountFormData>(initialFormData);
    const [editForm, setEditForm] = useState<AccountFormData>(initialFormData);

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

    // Load accounts from API
    const loadAccounts = async () => {
        try {
            setState(prev => ({ ...prev, loading: true, error: null }));

            const merchantId = getMerchantId();
            if (!merchantId) {
                throw new Error('Merchant ID not found. Please ensure you are logged in.');
            }

            let accounts: Account[] = [];

            // Apply filters and call appropriate API endpoint
            if (state.filters.accountType) {
                accounts = await accountsService.accountControllerGetByType(
                    merchantId,
                    state.filters.accountType
                );
            } else {
                accounts = await accountsService.accountControllerFindAll(
                    merchantId,
                    '',
                    true
                );
            }

            // Apply client-side filters
            let filteredAccounts = [...accounts];

            if (state.filters.search) {
                filteredAccounts = filteredAccounts.filter(account =>
                    account.name.toLowerCase().includes(state.filters.search.toLowerCase()) ||
                    account.accountCode.toLowerCase().includes(state.filters.search.toLowerCase()) ||
                    account.description?.toLowerCase().includes(state.filters.search.toLowerCase())
                );
            }

            if (state.filters.isActive !== undefined) {
                filteredAccounts = filteredAccounts.filter(account =>
                    account.isActive === state.filters.isActive
                );
            }

            setState(prev => ({
                ...prev,
                accounts: filteredAccounts,
                loading: false,
            }));
        } catch (error: any) {
            console.error('Failed to load accounts:', error);
            setState(prev => ({
                ...prev,
                error: error.message || 'Failed to load accounts',
                loading: false,
            }));
            toast.error(error.message || 'Failed to load accounts');
        }
    };

    useEffect(() => {
        if (user) {
            loadAccounts();
        }
    }, [user, state.filters]);

    // Handle create account
    const handleCreateAccount = async () => {
        try {
            const merchantId = getMerchantId();
            if (!merchantId) {
                throw new Error('Merchant ID not found');
            }

            const createData: CreateAccountDto = {
                merchantId,
                accountCode: createForm.accountCode,
                accountName: createForm.accountName,
                description: createForm.description || undefined,
                accountType: createForm.accountType as any,
                accountSubType: createForm.accountSubType as any,
                normalBalance: createForm.normalBalance as any,
                parentAccountId: createForm.parentAccountId || undefined,
                isActive: createForm.isActive,
                isSystemAccount: createForm.isSystemAccount,
            };

            await accountsService.accountControllerCreate(createData);
            toast.success('Account created successfully');
            setState(prev => ({ ...prev, showCreateDialog: false }));
            setCreateForm(initialFormData);
            loadAccounts();
        } catch (error: any) {
            console.error('Failed to create account:', error);
            toast.error(error.message || 'Failed to create account');
        }
    };

    // Handle update account
    const handleUpdateAccount = async () => {
        if (!state.editingAccount) return;

        try {
            const updateData: UpdateAccountDto = {
                accountName: editForm.accountName,
                description: editForm.description || undefined,
                accountType: editForm.accountType as any,
                accountSubType: editForm.accountSubType as any,
                normalBalance: editForm.normalBalance as any,
                parentAccountId: editForm.parentAccountId || undefined,
                isActive: editForm.isActive,
                isSystemAccount: editForm.isSystemAccount,
            };

            await accountsService.accountControllerUpdate(state.editingAccount.id, updateData);
            toast.success('Account updated successfully');
            setState(prev => ({ ...prev, showEditDialog: false, editingAccount: null }));
            setEditForm(initialFormData);
            loadAccounts();
        } catch (error: any) {
            console.error('Failed to update account:', error);
            toast.error(error.message || 'Failed to update account');
        }
    };

    // Handle delete account
    const handleDeleteAccount = async () => {
        if (!state.deletingAccount) return;

        try {
            await accountsService.accountControllerDelete(state.deletingAccount.id);
            toast.success('Account deleted successfully');
            setState(prev => ({ ...prev, showDeleteDialog: false, deletingAccount: null }));
            loadAccounts();
        } catch (error: any) {
            console.error('Failed to delete account:', error);
            toast.error(error.message || 'Failed to delete account');
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

    // Show loading or error if user is not available
    if (!user) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-muted-foreground">Please log in to view accounts</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Chart of Accounts</h1>
                    <p className="text-muted-foreground">
                        Manage your accounting structure and financial accounts
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => setState(prev => ({ ...prev, showCreateDialog: true }))}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Account
                    </Button>
                </div>
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
                                    placeholder="Search accounts..."
                                    value={state.filters.search}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                            <div>
                                <Label>Account Type</Label>
                                <Select
                                    value={state.filters.accountType || 'all'}
                                    onValueChange={(value) =>
                                        handleFilterChange('accountType', value === 'all' ? undefined : value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        {ACCOUNT_TYPES.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Status</Label>
                                <Select
                                    value={state.filters.isActive?.toString() || 'all'}
                                    onValueChange={(value) =>
                                        handleFilterChange('isActive', value === 'all' ? undefined : value === 'true')
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="true">Active</SelectItem>
                                        <SelectItem value="false">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-end">
                                <Button variant="outline" onClick={loadAccounts}>
                                    <Search className="mr-2 h-4 w-4" />
                                    Refresh
                                </Button>
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

            {/* Accounts Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Accounts ({state.accounts.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Account</TableHead>
                                <TableHead>Code</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Balance Type</TableHead>
                                <TableHead>Current Balance</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-12"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {state.loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8">
                                        Loading accounts...
                                    </TableCell>
                                </TableRow>
                            ) : state.accounts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8">
                                        No accounts found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                state.accounts.map((account) => (
                                    <TableRow key={account.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                                    <Building className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="font-medium">{account.name}</div>
                                                    {account.description && (
                                                        <div className="text-sm text-muted-foreground">
                                                            {account.description}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <code className="text-sm font-medium">{account.accountCode}</code>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <Badge variant="outline">{account.accountType}</Badge>
                                                {account.accountSubType && (
                                                    <div className="text-sm text-muted-foreground mt-1">
                                                        {account.accountSubType.replace(/_/g, ' ')}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={account.balanceType === 'DEBIT' ? 'default' : 'secondary'}>
                                                {account.balanceType}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">
                                                {formatCurrency(account.currentBalance || 0, merchantSettings)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    variant={account.isActive ? 'default' : 'outline'}
                                                    className={account.isActive ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'border-orange-200 bg-orange-50 text-orange-800 hover:bg-orange-100 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-200 dark:hover:bg-orange-900'}
                                                >
                                                    {account.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                                {account.isSystemAccount && (
                                                    <Badge variant="outline" className="text-xs">
                                                        System
                                                    </Badge>
                                                )}
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
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setState(prev => ({ ...prev, showViewDialog: true, viewingAccount: account }));
                                                        }}
                                                    >
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setState(prev => ({ ...prev, showEditDialog: true, editingAccount: account }));
                                                            setEditForm({
                                                                accountCode: account.accountCode,
                                                                accountName: account.name,
                                                                description: account.description || '',
                                                                accountType: account.accountType,
                                                                accountSubType: account.accountSubType,
                                                                normalBalance: account.balanceType,
                                                                parentAccountId: account.parentAccountId || undefined,
                                                                isActive: account.isActive,
                                                                isSystemAccount: account.isSystemAccount || false,
                                                            });
                                                        }}
                                                        disabled={account.isSystemAccount}
                                                    >
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => setState(prev => ({ ...prev, showDeleteDialog: true, deletingAccount: account }))}
                                                        className="text-destructive"
                                                        disabled={account.isSystemAccount}
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

            {/* Create Account Dialog */}
            <Dialog open={state.showCreateDialog} onOpenChange={(open) => setState(prev => ({ ...prev, showCreateDialog: open }))}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Add New Account</DialogTitle>
                        <DialogDescription>
                            Create a new account in your chart of accounts.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="accountCode">Account Code *</Label>
                                <Input
                                    id="accountCode"
                                    value={createForm.accountCode}
                                    onChange={(e) => setCreateForm(prev => ({ ...prev, accountCode: e.target.value }))}
                                    placeholder="e.g., 1000"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="accountName">Account Name *</Label>
                                <Input
                                    id="accountName"
                                    value={createForm.accountName}
                                    onChange={(e) => setCreateForm(prev => ({ ...prev, accountName: e.target.value }))}
                                    placeholder="Enter account name"
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={createForm.description}
                                onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Enter account description"
                                rows={2}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="accountType">Account Type *</Label>
                                <Select
                                    value={createForm.accountType}
                                    onValueChange={(value) => setCreateForm(prev => ({ ...prev, accountType: value, accountSubType: '' }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select account type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ACCOUNT_TYPES.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="accountSubType">Account Sub Type *</Label>
                                <Select
                                    value={createForm.accountSubType}
                                    onValueChange={(value) => setCreateForm(prev => ({ ...prev, accountSubType: value }))}
                                    disabled={!createForm.accountType}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select sub type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {createForm.accountType && ACCOUNT_SUB_TYPES[createForm.accountType as keyof typeof ACCOUNT_SUB_TYPES]?.map((subType) => (
                                            <SelectItem key={subType.value} value={subType.value}>
                                                {subType.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="normalBalance">Balance Type *</Label>
                            <Select
                                value={createForm.normalBalance}
                                onValueChange={(value) => setCreateForm(prev => ({ ...prev, normalBalance: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select balance type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {BALANCE_TYPES.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="isActive"
                                checked={createForm.isActive}
                                onCheckedChange={(checked) => setCreateForm(prev => ({ ...prev, isActive: checked }))}
                            />
                            <Label htmlFor="isActive">Active</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setState(prev => ({ ...prev, showCreateDialog: false }))}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateAccount}>Add Account</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Account Dialog */}
            <Dialog open={state.showEditDialog} onOpenChange={(open) => setState(prev => ({ ...prev, showEditDialog: open }))}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Edit Account</DialogTitle>
                        <DialogDescription>
                            Update account information.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="editAccountCode">Account Code</Label>
                                <Input
                                    id="editAccountCode"
                                    value={editForm.accountCode}
                                    disabled
                                    className="bg-muted"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="editAccountName">Account Name *</Label>
                                <Input
                                    id="editAccountName"
                                    value={editForm.accountName}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, accountName: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="editDescription">Description</Label>
                            <Textarea
                                id="editDescription"
                                value={editForm.description}
                                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                rows={2}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="editAccountType">Account Type *</Label>
                                <Select
                                    value={editForm.accountType}
                                    onValueChange={(value) => setEditForm(prev => ({ ...prev, accountType: value, accountSubType: '' }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ACCOUNT_TYPES.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="editAccountSubType">Account Sub Type *</Label>
                                <Select
                                    value={editForm.accountSubType}
                                    onValueChange={(value) => setEditForm(prev => ({ ...prev, accountSubType: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {editForm.accountType && ACCOUNT_SUB_TYPES[editForm.accountType as keyof typeof ACCOUNT_SUB_TYPES]?.map((subType) => (
                                            <SelectItem key={subType.value} value={subType.value}>
                                                {subType.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="editNormalBalance">Balance Type *</Label>
                            <Select
                                value={editForm.normalBalance}
                                onValueChange={(value) => setEditForm(prev => ({ ...prev, normalBalance: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {BALANCE_TYPES.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="editIsActive"
                                checked={editForm.isActive}
                                onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, isActive: checked }))}
                            />
                            <Label htmlFor="editIsActive">Active</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setState(prev => ({ ...prev, showEditDialog: false }))}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateAccount}>Update Account</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Account Dialog */}
            <Dialog open={state.showViewDialog} onOpenChange={(open) => setState(prev => ({ ...prev, showViewDialog: open }))}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Account Details</DialogTitle>
                    </DialogHeader>
                    {state.viewingAccount && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Account Code</Label>
                                    <p className="text-sm font-mono">{state.viewingAccount.accountCode}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Account Name</Label>
                                    <p className="text-sm">{state.viewingAccount.name}</p>
                                </div>
                            </div>

                            {state.viewingAccount.description && (
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                                    <p className="text-sm">{state.viewingAccount.description}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Account Type</Label>
                                    <p className="text-sm">{state.viewingAccount.accountType}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Sub Type</Label>
                                    <p className="text-sm">{state.viewingAccount.accountSubType?.replace(/_/g, ' ')}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Balance Type</Label>
                                    <p className="text-sm">{state.viewingAccount.balanceType}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Current Balance</Label>
                                    <p className="text-sm font-medium">{formatCurrency(state.viewingAccount.currentBalance || 0, merchantSettings)}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                                    <div>
                                        <Badge
                                            variant={state.viewingAccount.isActive ? 'default' : 'outline'}
                                            className={state.viewingAccount.isActive ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'border-orange-200 bg-orange-50 text-orange-800 hover:bg-orange-100 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-200 dark:hover:bg-orange-900'}
                                        >
                                            {state.viewingAccount.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Account Type</Label>
                                    <div>
                                        {state.viewingAccount.isSystemAccount && (
                                            <Badge variant="outline">System Account</Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setState(prev => ({ ...prev, showViewDialog: false }))}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Account Dialog */}
            <Dialog open={state.showDeleteDialog} onOpenChange={(open) => setState(prev => ({ ...prev, showDeleteDialog: open }))}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Account</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{state.deletingAccount?.name}"?
                            This action cannot be undone and may affect your financial reports.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setState(prev => ({ ...prev, showDeleteDialog: false }))}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteAccount}>
                            Delete Account
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
} 