import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, MoreHorizontal, Edit, Trash2, Building, Building2, BarChart3, Settings, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { adminService } from '@/services/sdk';
import { MerchantResponseDto } from '@/lib/sdk/models/MerchantResponseDto';
import { CreateMerchantDto } from '@/lib/sdk/models/CreateMerchantDto';
import { UpdateMerchantDto } from '@/lib/sdk/models/UpdateMerchantDto';
import { getInitials } from '@/lib/utils';

interface MerchantsPageState {
    merchants: MerchantResponseDto[];
    loading: boolean;
    error: string | null;
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
    filters: {
        search: string;
        isActive?: boolean;
        kraEnabled?: boolean;
    };
    selectedMerchants: string[];
    showCreateDialog: boolean;
    showEditDialog: boolean;
    showDeleteDialog: boolean;
    showStatsDialog: boolean;
    editingMerchant: MerchantResponseDto | null;
    deletingMerchant: MerchantResponseDto | null;
    statsData: any;
}

export default function MerchantsPage() {
    const navigate = useNavigate();
    const [state, setState] = useState<MerchantsPageState>({
        merchants: [],
        loading: true,
        error: null,
        pagination: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
        },
        filters: {
            search: '',
        },
        selectedMerchants: [],
        showCreateDialog: false,
        showEditDialog: false,
        showDeleteDialog: false,
        showStatsDialog: false,
        editingMerchant: null,
        deletingMerchant: null,
        statsData: null,
    });

    const [createForm, setCreateForm] = useState<CreateMerchantDto>({
        name: '',
        contactEmail: '',
        contactPhone: '',
        address: '',
        taxIdentifier: '',
        kraEnabled: false,
    });

    const [editForm, setEditForm] = useState<UpdateMerchantDto>({});

    // Load merchants
    const loadMerchants = async () => {
        try {
            setState(prev => ({ ...prev, loading: true, error: null }));

            const response = await adminService.getAllMerchants({
                page: state.pagination.page,
                limit: state.pagination.limit,
                ...state.filters,
            });

            setState(prev => ({
                ...prev,
                merchants: response.data,
                pagination: {
                    page: response.page,
                    limit: response.limit,
                    total: response.total,
                    totalPages: response.totalPages,
                    hasNext: response.hasNext,
                    hasPrev: response.hasPrev,
                },
                loading: false,
            }));
        } catch (error) {
            setState(prev => ({
                ...prev,
                error: 'Failed to load merchants',
                loading: false,
            }));
            toast.error('Failed to load merchants');
        }
    };

    useEffect(() => {
        loadMerchants();
    }, [state.pagination.page, state.pagination.limit, state.filters]);

    // Create merchant
    const handleCreateMerchant = async () => {
        try {
            await adminService.createMerchant(createForm);
            toast.success('Merchant created successfully');
            setState(prev => ({ ...prev, showCreateDialog: false }));
            setCreateForm({
                name: '',
                contactEmail: '',
                contactPhone: '',
                address: '',
                taxIdentifier: '',
                kraEnabled: false,
            });
            loadMerchants();
        } catch (error) {
            toast.error('Failed to create merchant');
        }
    };

    // Update merchant
    const handleUpdateMerchant = async () => {
        if (!state.editingMerchant) return;

        try {
            await adminService.updateMerchant(state.editingMerchant.id, editForm);
            toast.success('Merchant updated successfully');
            setState(prev => ({ ...prev, showEditDialog: false, editingMerchant: null }));
            setEditForm({});
            loadMerchants();
        } catch (error) {
            toast.error('Failed to update merchant');
        }
    };

    // Delete merchant
    const handleDeleteMerchant = async () => {
        if (!state.deletingMerchant) return;

        try {
            await adminService.deleteMerchant(state.deletingMerchant.id);
            toast.success('Merchant deleted successfully');
            setState(prev => ({ ...prev, showDeleteDialog: false, deletingMerchant: null }));
            loadMerchants();
        } catch (error) {
            toast.error('Failed to delete merchant');
        }
    };

    // Toggle merchant status
    const handleToggleMerchantStatus = async (merchant: MerchantResponseDto) => {
        try {
            await adminService.toggleMerchantStatus(merchant.id, { isActive: !merchant.isActive });
            toast.success(`Merchant ${!merchant.isActive ? 'activated' : 'suspended'} successfully`);
            loadMerchants();
        } catch (error) {
            toast.error('Failed to update merchant status');
        }
    };

    // Toggle KRA enabled
    const handleToggleKraEnabled = async (merchant: MerchantResponseDto) => {
        try {
            await adminService.toggleMerchantKraEnabled(merchant.id, { kraEnabled: !merchant.kraEnabled });
            toast.success(`KRA integration ${!merchant.kraEnabled ? 'enabled' : 'disabled'} successfully`);
            loadMerchants();
        } catch (error) {
            toast.error('Failed to update KRA status');
        }
    };

    // Get merchant stats
    const handleGetMerchantStats = async (merchant: MerchantResponseDto) => {
        try {
            const stats = await adminService.getMerchantStats(merchant.id);
            setState(prev => ({
                ...prev,
                showStatsDialog: true,
                statsData: stats,
                editingMerchant: merchant
            }));
        } catch (error) {
            toast.error('Failed to load merchant statistics');
        }
    };

    // Bulk status update
    const handleBulkStatusUpdate = async (isActive: boolean) => {
        if (state.selectedMerchants.length === 0) return;

        try {
            await adminService.bulkUpdateMerchantStatus({
                merchantIds: state.selectedMerchants,
                isActive,
            });
            toast.success(`${state.selectedMerchants.length} merchants ${isActive ? 'activated' : 'suspended'} successfully`);
            setState(prev => ({ ...prev, selectedMerchants: [] }));
            loadMerchants();
        } catch (error) {
            toast.error('Failed to update merchants');
        }
    };

    // Handle search
    const handleSearch = (value: string) => {
        setState(prev => ({
            ...prev,
            filters: { ...prev.filters, search: value },
            pagination: { ...prev.pagination, page: 1 },
        }));
    };

    // Handle filter change
    const handleFilterChange = (key: string, value: any) => {
        setState(prev => ({
            ...prev,
            filters: { ...prev.filters, [key]: value },
            pagination: { ...prev.pagination, page: 1 },
        }));
    };

    // Handle pagination
    const handlePageChange = (page: number) => {
        setState(prev => ({
            ...prev,
            pagination: { ...prev.pagination, page },
        }));
    };

    // Handle merchant selection
    const handleMerchantSelection = (merchantId: string, checked: boolean) => {
        setState(prev => ({
            ...prev,
            selectedMerchants: checked
                ? [...prev.selectedMerchants, merchantId]
                : prev.selectedMerchants.filter(id => id !== merchantId),
        }));
    };

    // Handle select all
    const handleSelectAll = (checked: boolean) => {
        setState(prev => ({
            ...prev,
            selectedMerchants: checked ? state.merchants.map(merchant => merchant.id) : [],
        }));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Merchants</h1>
                    <p className="text-muted-foreground">
                        Manage merchant accounts and settings
                    </p>
                </div>
                <Button onClick={() => setState(prev => ({ ...prev, showCreateDialog: true }))}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Merchant
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
                                    placeholder="Search by name, email, phone, or address..."
                                    value={state.filters.search}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
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

                            <div>
                                <Label>KRA Integration</Label>
                                <Select
                                    value={state.filters.kraEnabled?.toString() || 'all'}
                                    onValueChange={(value) =>
                                        handleFilterChange('kraEnabled', value === 'all' ? undefined : value === 'true')
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="true">Enabled</SelectItem>
                                        <SelectItem value="false">Disabled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Bulk Actions */}
            {state.selectedMerchants.length > 0 && (
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground">
                                {state.selectedMerchants.length} merchant(s) selected
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleBulkStatusUpdate(true)}
                            >
                                <Building className="mr-2 h-4 w-4" />
                                Activate
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleBulkStatusUpdate(false)}
                            >
                                <Building2 className="mr-2 h-4 w-4" />
                                Suspend
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Merchants Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Merchants ({state.pagination.total})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">
                                    <Checkbox
                                        checked={state.selectedMerchants.length === state.merchants.length && state.merchants.length > 0}
                                        onCheckedChange={handleSelectAll}
                                    />
                                </TableHead>
                                <TableHead>Merchant</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Users</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>KRA</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="w-12"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {state.loading ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8">
                                        Loading merchants...
                                    </TableCell>
                                </TableRow>
                            ) : state.merchants.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8">
                                        No merchants found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                state.merchants.map((merchant) => (
                                    <TableRow key={merchant.id}>
                                        <TableCell>
                                            <Checkbox
                                                checked={state.selectedMerchants.includes(merchant.id)}
                                                onCheckedChange={(checked) => handleMerchantSelection(merchant.id, checked as boolean)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={merchant.logo || undefined} />
                                                    <AvatarFallback>
                                                        {getInitials(merchant.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium">{merchant.name}</div>
                                                    {merchant.taxIdentifier && (
                                                        <div className="text-sm text-muted-foreground">TIN: {merchant.taxIdentifier}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="text-sm">{merchant.contactEmail}</div>
                                                <div className="text-sm text-muted-foreground">{merchant.contactPhone}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-center">
                                                <div className="text-sm font-medium">
                                                    {(merchant as any)._count?.users || 0}
                                                </div>
                                                <div className="text-xs text-muted-foreground">users</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={merchant.isActive ? 'default' : 'secondary'}>
                                                {merchant.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={merchant.kraEnabled ? 'default' : 'outline'}>
                                                {merchant.kraEnabled ? 'Enabled' : 'Disabled'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(merchant.createdAt).toLocaleDateString()}
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
                                                        onClick={() => navigate(`/users?merchantId=${merchant.id}`)}
                                                    >
                                                        <Users className="mr-2 h-4 w-4" />
                                                        View Users
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleGetMerchantStats(merchant)}
                                                    >
                                                        <BarChart3 className="mr-2 h-4 w-4" />
                                                        View Statistics
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setState(prev => ({ ...prev, showEditDialog: true, editingMerchant: merchant }));
                                                            setEditForm({
                                                                name: merchant.name,
                                                                contactEmail: merchant.contactEmail,
                                                                contactPhone: merchant.contactPhone,
                                                                address: merchant.address,
                                                                taxIdentifier: merchant.taxIdentifier || '',
                                                                kraEnabled: merchant.kraEnabled,
                                                            });
                                                        }}
                                                    >
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleToggleMerchantStatus(merchant)}
                                                    >
                                                        {merchant.isActive ? (
                                                            <>
                                                                <Building2 className="mr-2 h-4 w-4" />
                                                                Suspend
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Building className="mr-2 h-4 w-4" />
                                                                Activate
                                                            </>
                                                        )}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleToggleKraEnabled(merchant)}
                                                    >
                                                        <Settings className="mr-2 h-4 w-4" />
                                                        {merchant.kraEnabled ? 'Disable' : 'Enable'} KRA
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => setState(prev => ({ ...prev, showDeleteDialog: true, deletingMerchant: merchant }))}
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

                    {/* Pagination */}
                    {state.pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4">
                            <div className="text-sm text-muted-foreground">
                                Showing {((state.pagination.page - 1) * state.pagination.limit) + 1} to{' '}
                                {Math.min(state.pagination.page * state.pagination.limit, state.pagination.total)} of{' '}
                                {state.pagination.total} merchants
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(state.pagination.page - 1)}
                                    disabled={!state.pagination.hasPrev}
                                >
                                    Previous
                                </Button>
                                <span className="text-sm">
                                    Page {state.pagination.page} of {state.pagination.totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(state.pagination.page + 1)}
                                    disabled={!state.pagination.hasNext}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create Merchant Dialog */}
            <Dialog open={state.showCreateDialog} onOpenChange={(open) => setState(prev => ({ ...prev, showCreateDialog: open }))}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Create New Merchant</DialogTitle>
                        <DialogDescription>
                            Add a new merchant to the system.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Merchant Name</Label>
                            <Input
                                id="name"
                                value={createForm.name}
                                onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="ABC Fuel Station"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="contactEmail">Contact Email</Label>
                            <Input
                                id="contactEmail"
                                type="email"
                                value={createForm.contactEmail}
                                onChange={(e) => setCreateForm(prev => ({ ...prev, contactEmail: e.target.value }))}
                                placeholder="contact@abcfuel.com"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="contactPhone">Contact Phone</Label>
                            <Input
                                id="contactPhone"
                                value={createForm.contactPhone}
                                onChange={(e) => setCreateForm(prev => ({ ...prev, contactPhone: e.target.value }))}
                                placeholder="+254712345678"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="address">Address</Label>
                            <Textarea
                                id="address"
                                value={createForm.address}
                                onChange={(e) => setCreateForm(prev => ({ ...prev, address: e.target.value }))}
                                placeholder="123 Main Street, Nairobi"
                                rows={3}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="taxIdentifier">Tax Identifier (TIN)</Label>
                            <Input
                                id="taxIdentifier"
                                value={createForm.taxIdentifier}
                                onChange={(e) => setCreateForm(prev => ({ ...prev, taxIdentifier: e.target.value }))}
                                placeholder="P051234567M"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="kraEnabled"
                                checked={createForm.kraEnabled}
                                onCheckedChange={(checked) => setCreateForm(prev => ({ ...prev, kraEnabled: checked }))}
                            />
                            <Label htmlFor="kraEnabled">Enable KRA Integration</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setState(prev => ({ ...prev, showCreateDialog: false }))}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateMerchant}>Create Merchant</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Merchant Dialog */}
            <Dialog open={state.showEditDialog} onOpenChange={(open) => setState(prev => ({ ...prev, showEditDialog: open }))}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit Merchant</DialogTitle>
                        <DialogDescription>
                            Update merchant information and settings.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="editName">Merchant Name</Label>
                            <Input
                                id="editName"
                                value={editForm.name || ''}
                                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="editContactEmail">Contact Email</Label>
                            <Input
                                id="editContactEmail"
                                type="email"
                                value={editForm.contactEmail || ''}
                                onChange={(e) => setEditForm(prev => ({ ...prev, contactEmail: e.target.value }))}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="editContactPhone">Contact Phone</Label>
                            <Input
                                id="editContactPhone"
                                value={editForm.contactPhone || ''}
                                onChange={(e) => setEditForm(prev => ({ ...prev, contactPhone: e.target.value }))}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="editAddress">Address</Label>
                            <Textarea
                                id="editAddress"
                                value={editForm.address || ''}
                                onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                                rows={3}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="editTaxIdentifier">Tax Identifier (TIN)</Label>
                            <Input
                                id="editTaxIdentifier"
                                value={editForm.taxIdentifier || ''}
                                onChange={(e) => setEditForm(prev => ({ ...prev, taxIdentifier: e.target.value }))}
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="editKraEnabled"
                                checked={editForm.kraEnabled || false}
                                onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, kraEnabled: checked }))}
                            />
                            <Label htmlFor="editKraEnabled">Enable KRA Integration</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setState(prev => ({ ...prev, showEditDialog: false }))}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateMerchant}>Update Merchant</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Merchant Dialog */}
            <Dialog open={state.showDeleteDialog} onOpenChange={(open) => setState(prev => ({ ...prev, showDeleteDialog: open }))}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Merchant</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {state.deletingMerchant?.name}?
                            This action cannot be undone and will only work if the merchant has no associated data.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setState(prev => ({ ...prev, showDeleteDialog: false }))}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteMerchant}>
                            Delete Merchant
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Merchant Statistics Dialog */}
            <Dialog open={state.showStatsDialog} onOpenChange={(open) => setState(prev => ({ ...prev, showStatsDialog: open }))}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Merchant Statistics</DialogTitle>
                        <DialogDescription>
                            Overview of {state.editingMerchant?.name} performance and data
                        </DialogDescription>
                    </DialogHeader>
                    {state.statsData && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm">Users</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{state.statsData.stats.totalUsers}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {state.statsData.stats.activeUsers} active
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm">Branches</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{state.statsData.stats.totalBranches}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {state.statsData.stats.activeBranches} active
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm">Products</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{state.statsData.stats.totalProducts}</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm">Customers</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{state.statsData.stats.totalCustomers}</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm">Purchases</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{state.statsData.stats.totalPurchases}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {state.statsData.stats.recentPurchases} this month
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm">Invoices</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{state.statsData.stats.totalInvoices}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {state.statsData.stats.recentInvoices} this month
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                            <div className="mt-4">
                                <h4 className="text-sm font-medium mb-2">Merchant Details</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Status:</span>
                                        <Badge variant={state.statsData.merchant.isActive ? 'default' : 'secondary'}>
                                            {state.statsData.merchant.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">KRA Integration:</span>
                                        <Badge variant={state.statsData.merchant.kraEnabled ? 'default' : 'outline'}>
                                            {state.statsData.merchant.kraEnabled ? 'Enabled' : 'Disabled'}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Created:</span>
                                        <span>{new Date(state.statsData.merchant.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button onClick={() => setState(prev => ({ ...prev, showStatsDialog: false }))}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
} 