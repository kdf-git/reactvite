import { useState, useEffect } from 'react';
import { Plus, Search, MoreHorizontal, Edit, Trash2, CreditCard, Eye, Star } from 'lucide-react';
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
import { paymentModesService } from '@/services/sdk';
import type { PaymentModeResponseDto, CreatePaymentModeDto, UpdatePaymentModeDto } from '@/lib/sdk';

// Update interfaces to match the API DTOs
interface PaymentMode extends PaymentModeResponseDto { }

interface PaymentModeFormData {
    name: string;
    type: string;
    paymentMethodCode: string;
    description: string;
    isActive: boolean;
    requiresReference: boolean;
    allowPartialPayments: boolean;
}

interface PaymentModesPageState {
    paymentModes: PaymentMode[];
    loading: boolean;
    error: string | null;
    filters: {
        search: string;
        isActive?: boolean;
    };
    showCreateDialog: boolean;
    showEditDialog: boolean;
    showDeleteDialog: boolean;
    showViewDialog: boolean;
    editingPaymentMode: PaymentMode | null;
    deletingPaymentMode: PaymentMode | null;
    viewingPaymentMode: PaymentMode | null;
}

const initialFormData: PaymentModeFormData = {
    name: '',
    type: 'CASH',
    paymentMethodCode: '',
    description: '',
    isActive: true,
    requiresReference: false,
    allowPartialPayments: true,
};

const paymentTypes = [
    { value: 'CASH', label: 'Cash' },
    { value: 'CHEQUE', label: 'Cheque' },
    { value: 'CREDIT_CARD', label: 'Credit Card' },
    { value: 'DEBIT_CARD', label: 'Debit Card' },
    { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
    { value: 'MOBILE_MONEY', label: 'Mobile Money' },
    { value: 'DIGITAL_WALLET', label: 'Digital Wallet' },
    { value: 'CRYPTOCURRENCY', label: 'Cryptocurrency' },
    { value: 'STORE_CREDIT', label: 'Store Credit' },
    { value: 'OTHER', label: 'Other' },
];

export default function PaymentModesPage() {
    const { user } = useAuth();
    const [state, setState] = useState<PaymentModesPageState>({
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
        editingPaymentMode: null,
        deletingPaymentMode: null,
        viewingPaymentMode: null,
    });

    const [createForm, setCreateForm] = useState<PaymentModeFormData>(initialFormData);
    const [editForm, setEditForm] = useState<PaymentModeFormData>(initialFormData);

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

    // Load payment modes from API
    const loadPaymentModes = async () => {
        try {
            setState(prev => ({ ...prev, loading: true, error: null }));

            const merchantId = getMerchantId();
            if (!merchantId) {
                throw new Error('Merchant ID not found. Please ensure you are logged in.');
            }

            let paymentModes: PaymentMode[] = [];

            // Apply filters and call appropriate API endpoint
            if (state.filters.isActive !== undefined) {
                paymentModes = await paymentModesService.paymentModeControllerFindAll(
                    merchantId,
                    state.filters.isActive
                );
            } else {
                paymentModes = await paymentModesService.paymentModeControllerFindAll(merchantId);
            }

            // Apply client-side filters
            let filteredPaymentModes = [...paymentModes];

            if (state.filters.search) {
                filteredPaymentModes = filteredPaymentModes.filter(paymentMode =>
                    paymentMode.name.toLowerCase().includes(state.filters.search.toLowerCase()) ||
                    paymentMode.type.toLowerCase().includes(state.filters.search.toLowerCase()) ||
                    (paymentMode.description && paymentMode.description.toLowerCase().includes(state.filters.search.toLowerCase()))
                );
            }

            if (state.filters.isActive !== undefined) {
                filteredPaymentModes = filteredPaymentModes.filter(paymentMode =>
                    paymentMode.isActive === state.filters.isActive
                );
            }

            setState(prev => ({
                ...prev,
                paymentModes: filteredPaymentModes,
                loading: false,
            }));
        } catch (error: any) {
            console.error('Failed to load payment modes:', error);
            setState(prev => ({
                ...prev,
                error: error.message || 'Failed to load payment modes',
                loading: false,
            }));
            toast.error(error.message || 'Failed to load payment modes');
        }
    };

    useEffect(() => {
        if (user) {
            loadPaymentModes();
        }
    }, [user, state.filters]);

    // Handle create payment mode
    const handleCreatePaymentMode = async () => {
        try {
            const merchantId = getMerchantId();
            if (!merchantId) {
                throw new Error('Merchant ID not found');
            }

            const createData: CreatePaymentModeDto = {
                merchantId,
                name: createForm.name,
                type: createForm.type as any,
                paymentMethodCode: createForm.paymentMethodCode || undefined,
                description: createForm.description || undefined,
                isActive: createForm.isActive,
                requiresReference: createForm.requiresReference,
                allowPartialPayments: createForm.allowPartialPayments,
            };

            await paymentModesService.paymentModeControllerCreate(createData);
            toast.success('Payment mode created successfully');
            setState(prev => ({ ...prev, showCreateDialog: false }));
            setCreateForm(initialFormData);
            loadPaymentModes();
        } catch (error: any) {
            console.error('Failed to create payment mode:', error);
            toast.error(error.message || 'Failed to create payment mode');
        }
    };

    // Handle update payment mode
    const handleUpdatePaymentMode = async () => {
        try {
            if (!state.editingPaymentMode) return;

            // For system default payment modes, only allow editing isActive and description
            let updateData: UpdatePaymentModeDto;
            if (state.editingPaymentMode.isSystemDefault) {
                updateData = {
                    isActive: editForm.isActive,
                    description: editForm.description || undefined,
                };
            } else {
                updateData = {
                    name: editForm.name,
                    paymentMethodCode: editForm.paymentMethodCode || undefined,
                    description: editForm.description || undefined,
                    isActive: editForm.isActive,
                    requiresReference: editForm.requiresReference,
                    allowPartialPayments: editForm.allowPartialPayments,
                };
            }

            await paymentModesService.paymentModeControllerUpdate(state.editingPaymentMode.id, updateData);
            toast.success('Payment mode updated successfully');
            setState(prev => ({ ...prev, showEditDialog: false, editingPaymentMode: null }));
            setEditForm(initialFormData);
            loadPaymentModes();
        } catch (error: any) {
            console.error('Failed to update payment mode:', error);
            toast.error(error.message || 'Failed to update payment mode');
        }
    };

    // Handle delete payment mode
    const handleDeletePaymentMode = async () => {
        if (!state.deletingPaymentMode) return;

        try {
            await paymentModesService.paymentModeControllerRemove(state.deletingPaymentMode.id);
            toast.success('Payment mode deleted successfully');
            setState(prev => ({ ...prev, showDeleteDialog: false, deletingPaymentMode: null }));
            loadPaymentModes();
        } catch (error: any) {
            console.error('Failed to delete payment mode:', error);
            toast.error(error.message || 'Failed to delete payment mode');
        }
    };

    // Handle toggle payment mode status
    const handleToggleStatus = async (paymentMode: PaymentMode) => {
        try {
            if (paymentMode.isActive) {
                await paymentModesService.paymentModeControllerDeactivate(paymentMode.id);
            } else {
                await paymentModesService.paymentModeControllerActivate(paymentMode.id);
            }
            toast.success(`Payment mode ${paymentMode.isActive ? 'deactivated' : 'activated'} successfully`);
            loadPaymentModes();
        } catch (error: any) {
            console.error('Failed to toggle payment mode status:', error);
            toast.error(error.message || 'Failed to update payment mode status');
        }
    };

    // Handle set as default
    const handleSetAsDefault = async (paymentMode: PaymentMode) => {
        try {
            await paymentModesService.paymentModeControllerSetAsDefault(paymentMode.id);
            toast.success(`"${paymentMode.name}" set as default payment mode successfully`);
            loadPaymentModes();
        } catch (error: any) {
            console.error('Failed to set payment mode as default:', error);
            toast.error(error.message || 'Failed to set payment mode as default');
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

    const getPaymentTypeLabel = (type: string) => {
        const paymentType = paymentTypes.find(pt => pt.value === type);
        return paymentType ? paymentType.label : type;
    };

    // Show loading or error if user is not available
    if (!user) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-muted-foreground">Please log in to view payment modes</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Payment Modes</h1>
                    <p className="text-muted-foreground">
                        Manage payment methods accepted by your business
                    </p>
                </div>
                <Button onClick={() => setState(prev => ({ ...prev, showCreateDialog: true }))}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Payment Mode
                </Button>
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
                                    placeholder="Search payment modes..."
                                    value={state.filters.search}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 md:grid-cols-2">
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
                                <Button variant="outline" onClick={loadPaymentModes}>
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

            {/* Payment Modes Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Payment Modes ({state.paymentModes.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Payment Mode</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>KRA Code</TableHead>
                                <TableHead>Settings</TableHead>
                                <TableHead>Transactions</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-12"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {state.loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8">
                                        Loading payment modes...
                                    </TableCell>
                                </TableRow>
                            ) : state.paymentModes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8">
                                        No payment modes found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                state.paymentModes.map((paymentMode) => (
                                    <TableRow key={paymentMode.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                                    <CreditCard className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="font-medium flex items-center gap-2">
                                                        {paymentMode.name}
                                                        {paymentMode.isDefault && (
                                                            <Badge variant="outline" className="text-xs border-blue-200 text-blue-700 bg-blue-50">
                                                                Default
                                                            </Badge>
                                                        )}
                                                        {paymentMode.isSystemDefault && (
                                                            <Badge variant="outline" className="text-xs border-green-200 text-green-700 bg-green-50">
                                                                System
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {paymentMode.description && (
                                                        <div className="text-sm text-muted-foreground">
                                                            {paymentMode.description}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{getPaymentTypeLabel(paymentMode.type)}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            {paymentMode.paymentMethodCode ? (
                                                <Badge variant="secondary" className="font-mono">
                                                    {paymentMode.paymentMethodCode}
                                                </Badge>
                                            ) : (
                                                <span className="text-muted-foreground text-sm">Not set</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                {paymentMode.requiresReference && (
                                                    <Badge variant="outline" className="text-xs border-orange-200 text-orange-700 bg-orange-50">
                                                        Requires Reference
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{paymentMode.transactionCount || 0}</div>
                                            <div className="text-sm text-muted-foreground">transactions</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={paymentMode.isActive ? 'default' : 'secondary'}
                                                className={paymentMode.isActive ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''}
                                            >
                                                {paymentMode.isActive ? 'Active' : 'Inactive'}
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
                                                        onClick={() => {
                                                            setState(prev => ({ ...prev, showViewDialog: true, viewingPaymentMode: paymentMode }));
                                                        }}
                                                    >
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setState(prev => ({ ...prev, showEditDialog: true, editingPaymentMode: paymentMode }));
                                                            setEditForm({
                                                                name: paymentMode.name,
                                                                type: paymentMode.type,
                                                                paymentMethodCode: paymentMode.paymentMethodCode || '',
                                                                description: paymentMode.description || '',
                                                                isActive: paymentMode.isActive,
                                                                requiresReference: paymentMode.requiresReference,
                                                                allowPartialPayments: paymentMode.allowPartialPayments,
                                                            });
                                                        }}
                                                        disabled={paymentMode.isSystemDefault}
                                                    >
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        {paymentMode.isSystemDefault ? 'Edit (System Default)' : 'Edit'}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleToggleStatus(paymentMode)}
                                                    >
                                                        <CreditCard className="mr-2 h-4 w-4" />
                                                        {paymentMode.isActive ? 'Deactivate' : 'Activate'}
                                                    </DropdownMenuItem>
                                                    {!paymentMode.isDefault && (
                                                        <DropdownMenuItem
                                                            onClick={() => handleSetAsDefault(paymentMode)}
                                                        >
                                                            <Star className="mr-2 h-4 w-4" />
                                                            Set as Default
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => setState(prev => ({ ...prev, showDeleteDialog: true, deletingPaymentMode: paymentMode }))}
                                                        className="text-destructive"
                                                        disabled={paymentMode.isDefault || paymentMode.isSystemDefault || (paymentMode.transactionCount || 0) > 0}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        {paymentMode.isSystemDefault ? 'Delete (System Default)' : 'Delete'}
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

            {/* Create Payment Mode Dialog */}
            <Dialog open={state.showCreateDialog} onOpenChange={(open) => setState(prev => ({ ...prev, showCreateDialog: open }))}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Add New Payment Mode</DialogTitle>
                        <DialogDescription>
                            Create a new payment method for your business transactions.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Payment Mode Name *</Label>
                            <Input
                                id="name"
                                value={createForm.name}
                                onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Enter payment mode name"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="type">Payment Type *</Label>
                            <Select
                                value={createForm.type}
                                onValueChange={(value) => setCreateForm(prev => ({ ...prev, type: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {paymentTypes.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="paymentMethodCode">KRA Payment Method Code</Label>
                            <Input
                                id="paymentMethodCode"
                                value={createForm.paymentMethodCode}
                                onChange={(e) => setCreateForm(prev => ({ ...prev, paymentMethodCode: e.target.value }))}
                                placeholder="Enter KRA payment method code (e.g., 01, 02, 07)"
                                maxLength={2}
                            />
                            <p className="text-xs text-muted-foreground">
                                Optional KRA code for tax integration. Standard codes: 01=Cash, 02=Credit Card, 03=Debit Card, 04=Mobile Money, 05=Bank Transfer, 06=Cheque, 07=Other
                            </p>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={createForm.description}
                                onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Enter payment mode description"
                                rows={3}
                            />
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="isActive"
                                    checked={createForm.isActive}
                                    onCheckedChange={(checked) => setCreateForm(prev => ({ ...prev, isActive: checked }))}
                                />
                                <Label htmlFor="isActive">Active</Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="requiresReference"
                                    checked={createForm.requiresReference}
                                    onCheckedChange={(checked) => setCreateForm(prev => ({ ...prev, requiresReference: checked }))}
                                />
                                <Label htmlFor="requiresReference">Requires Reference Number</Label>
                            </div>


                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setState(prev => ({ ...prev, showCreateDialog: false }))}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreatePaymentMode}>Add Payment Mode</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Payment Mode Dialog */}
            <Dialog open={state.showEditDialog} onOpenChange={(open) => setState(prev => ({ ...prev, showEditDialog: open }))}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit Payment Mode</DialogTitle>
                        <DialogDescription>
                            Update payment mode settings and configuration.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="editName">Payment Mode Name *</Label>
                            <Input
                                id="editName"
                                value={editForm.name}
                                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="editType">Payment Type *</Label>
                            <Select
                                value={editForm.type}
                                onValueChange={(value) => setEditForm(prev => ({ ...prev, type: value }))}
                                disabled={state.editingPaymentMode?.isDefault || state.editingPaymentMode?.isSystemDefault}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {paymentTypes.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {(state.editingPaymentMode?.isDefault || state.editingPaymentMode?.isSystemDefault) && (
                                <p className="text-xs text-muted-foreground">
                                    Payment type cannot be changed for {state.editingPaymentMode?.isSystemDefault ? 'system default' : 'default'} payment modes
                                </p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="editPaymentMethodCode">KRA Payment Method Code</Label>
                            <Input
                                id="editPaymentMethodCode"
                                value={editForm.paymentMethodCode}
                                onChange={(e) => setEditForm(prev => ({ ...prev, paymentMethodCode: e.target.value }))}
                                placeholder="Enter KRA payment method code (e.g., 01, 02, 07)"
                                maxLength={2}
                                disabled={state.editingPaymentMode?.isSystemDefault}
                            />
                            <p className="text-xs text-muted-foreground">
                                {state.editingPaymentMode?.isSystemDefault
                                    ? 'KRA code cannot be changed for system default payment modes'
                                    : 'Optional KRA code for tax integration. Standard codes: 01=Cash, 02=Credit Card, 03=Debit Card, 04=Mobile Money, 05=Bank Transfer, 06=Cheque, 07=Other'
                                }
                            </p>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="editDescription">Description</Label>
                            <Textarea
                                id="editDescription"
                                value={editForm.description}
                                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                rows={3}
                            />
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="editIsActive"
                                    checked={editForm.isActive}
                                    onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, isActive: checked }))}
                                />
                                <Label htmlFor="editIsActive">Active</Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="editRequiresReference"
                                    checked={editForm.requiresReference}
                                    onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, requiresReference: checked }))}
                                />
                                <Label htmlFor="editRequiresReference">Requires Reference Number</Label>
                            </div>


                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setState(prev => ({ ...prev, showEditDialog: false }))}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdatePaymentMode}>Update Payment Mode</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Payment Mode Dialog */}
            <Dialog open={state.showViewDialog} onOpenChange={(open) => setState(prev => ({ ...prev, showViewDialog: open }))}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Payment Mode Details</DialogTitle>
                    </DialogHeader>
                    {state.viewingPaymentMode && (
                        <div className="grid gap-4 py-4">
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Payment Mode Name</Label>
                                <p className="text-sm">{state.viewingPaymentMode.name}</p>
                            </div>

                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Payment Type</Label>
                                <p className="text-sm">{getPaymentTypeLabel(state.viewingPaymentMode.type)}</p>
                            </div>

                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">KRA Payment Method Code</Label>
                                <p className="text-sm">
                                    {state.viewingPaymentMode.paymentMethodCode ? (
                                        <Badge variant="secondary" className="font-mono">
                                            {state.viewingPaymentMode.paymentMethodCode}
                                        </Badge>
                                    ) : (
                                        <span className="text-muted-foreground">Not set</span>
                                    )}
                                </p>
                            </div>

                            {state.viewingPaymentMode.description && (
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                                    <p className="text-sm">{state.viewingPaymentMode.description}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Transaction Count</Label>
                                    <p className="text-sm font-medium">{state.viewingPaymentMode.transactionCount || 0}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                                    <div>
                                        <Badge
                                            variant={state.viewingPaymentMode.isActive ? 'default' : 'secondary'}
                                            className={state.viewingPaymentMode.isActive ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''}
                                        >
                                            {state.viewingPaymentMode.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Requires Reference</Label>
                                    <p className="text-sm">{state.viewingPaymentMode.requiresReference ? 'Yes' : 'No'}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Default Mode</Label>
                                    <p className="text-sm">{state.viewingPaymentMode.isDefault ? 'Yes' : 'No'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                                    <p className="text-sm">{new Date(state.viewingPaymentMode.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Last Updated</Label>
                                    <p className="text-sm">{new Date(state.viewingPaymentMode.updatedAt).toLocaleDateString()}</p>
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

            {/* Delete Payment Mode Dialog */}
            <Dialog open={state.showDeleteDialog} onOpenChange={(open) => setState(prev => ({ ...prev, showDeleteDialog: open }))}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Payment Mode</DialogTitle>
                        <DialogDescription>
                            {state.deletingPaymentMode?.isDefault
                                ? `Cannot delete "${state.deletingPaymentMode?.name}" because it is a default payment mode.`
                                : (state.deletingPaymentMode?.transactionCount || 0) > 0
                                    ? `Cannot delete "${state.deletingPaymentMode?.name}" because it is referenced by ${state.deletingPaymentMode?.transactionCount} transaction(s).`
                                    : `Are you sure you want to delete "${state.deletingPaymentMode?.name}"? This action cannot be undone.`
                            }
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setState(prev => ({ ...prev, showDeleteDialog: false }))}>
                            Cancel
                        </Button>
                        {!state.deletingPaymentMode?.isDefault && (state.deletingPaymentMode?.transactionCount || 0) === 0 && (
                            <Button variant="destructive" onClick={handleDeletePaymentMode}>
                                Delete Payment Mode
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
} 