import { useState, useEffect } from 'react';
import { Plus, Search, MoreHorizontal, Edit, Trash2, Building, Eye } from 'lucide-react';
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
import { vendorsService } from '@/services/sdk';
import type { VendorResponseDto, CreateVendorDto, UpdateVendorDto } from '@/lib/sdk';

// Update interfaces to match the API DTOs
interface Vendor extends VendorResponseDto { }

interface VendorFormData {
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
    address: string;
    taxIdentifier: string;
    isActive: boolean;
}

interface VendorsPageState {
    vendors: Vendor[];
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
    editingVendor: Vendor | null;
    deletingVendor: Vendor | null;
    viewingVendor: Vendor | null;
}

const initialFormData: VendorFormData = {
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    taxIdentifier: '',
    isActive: true,
};

export default function VendorsPage() {
    const { user } = useAuth();
    const [state, setState] = useState<VendorsPageState>({
        vendors: [],
        loading: true,
        error: null,
        filters: {
            search: '',
        },
        showCreateDialog: false,
        showEditDialog: false,
        showDeleteDialog: false,
        showViewDialog: false,
        editingVendor: null,
        deletingVendor: null,
        viewingVendor: null,
    });

    const [createForm, setCreateForm] = useState<VendorFormData>(initialFormData);
    const [editForm, setEditForm] = useState<VendorFormData>(initialFormData);

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

    // Load vendors from API
    const loadVendors = async () => {
        try {
            setState(prev => ({ ...prev, loading: true, error: null }));

            const merchantId = getMerchantId();
            if (!merchantId) {
                throw new Error('Merchant ID not found. Please ensure you are logged in.');
            }

            let vendors: Vendor[] = [];

            // Apply filters and call appropriate API endpoint
            if (state.filters.search) {
                vendors = await vendorsService.vendorControllerSearch(merchantId, state.filters.search);
            } else {
                vendors = await vendorsService.vendorControllerFindAll(merchantId);
            }

            // Apply client-side filters
            let filteredVendors = [...vendors];

            if (state.filters.isActive !== undefined) {
                filteredVendors = filteredVendors.filter(vendor =>
                    vendor.isActive === state.filters.isActive
                );
            }

            setState(prev => ({
                ...prev,
                vendors: filteredVendors,
                loading: false,
            }));
        } catch (error: any) {
            console.error('Failed to load vendors:', error);
            setState(prev => ({
                ...prev,
                error: error.message || 'Failed to load vendors',
                loading: false,
            }));
            toast.error(error.message || 'Failed to load vendors');
        }
    };

    useEffect(() => {
        if (user) {
            loadVendors();
        }
    }, [user, state.filters]);

    // Handle create vendor
    const handleCreateVendor = async () => {
        try {
            const merchantId = getMerchantId();
            if (!merchantId) {
                throw new Error('Merchant ID not found');
            }

            const createData: CreateVendorDto = {
                merchantId,
                name: createForm.name,
                contactPerson: createForm.contactPerson || undefined,
                email: createForm.email || undefined,
                phone: createForm.phone || undefined,
                address: createForm.address || undefined,
                taxIdentifier: createForm.taxIdentifier || undefined,
                isActive: createForm.isActive,
            };

            await vendorsService.vendorControllerCreate(createData);
            toast.success('Vendor created successfully');
            setState(prev => ({ ...prev, showCreateDialog: false }));
            setCreateForm(initialFormData);
            loadVendors();
        } catch (error: any) {
            console.error('Failed to create vendor:', error);
            toast.error(error.message || 'Failed to create vendor');
        }
    };

    // Handle update vendor
    const handleUpdateVendor = async () => {
        if (!state.editingVendor) return;

        try {
            const updateData: UpdateVendorDto = {
                name: editForm.name,
                contactPerson: editForm.contactPerson || undefined,
                email: editForm.email || undefined,
                phone: editForm.phone || undefined,
                address: editForm.address || undefined,
                taxIdentifier: editForm.taxIdentifier || undefined,
                isActive: editForm.isActive,
            };

            await vendorsService.vendorControllerUpdate(state.editingVendor.id, updateData);
            toast.success('Vendor updated successfully');
            setState(prev => ({ ...prev, showEditDialog: false, editingVendor: null }));
            setEditForm(initialFormData);
            loadVendors();
        } catch (error: any) {
            console.error('Failed to update vendor:', error);
            toast.error(error.message || 'Failed to update vendor');
        }
    };

    // Handle delete vendor
    const handleDeleteVendor = async () => {
        if (!state.deletingVendor) return;

        try {
            await vendorsService.vendorControllerRemove(state.deletingVendor.id);
            toast.success('Vendor deleted successfully');
            setState(prev => ({ ...prev, showDeleteDialog: false, deletingVendor: null }));
            loadVendors();
        } catch (error: any) {
            console.error('Failed to delete vendor:', error);
            toast.error(error.message || 'Failed to delete vendor');
        }
    };

    // Handle toggle vendor status
    const handleToggleStatus = async (vendor: Vendor) => {
        try {
            if (vendor.isActive) {
                await vendorsService.vendorControllerDeactivate(vendor.id);
            } else {
                await vendorsService.vendorControllerActivate(vendor.id);
            }
            toast.success(`Vendor ${vendor.isActive ? 'deactivated' : 'activated'} successfully`);
            loadVendors();
        } catch (error: any) {
            console.error('Failed to toggle vendor status:', error);
            toast.error(error.message || 'Failed to update vendor status');
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
                    <p className="text-muted-foreground">Please log in to view vendors</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Vendors</h1>
                    <p className="text-muted-foreground">
                        Manage your suppliers and vendor relationships
                    </p>
                </div>
                <Button onClick={() => setState(prev => ({ ...prev, showCreateDialog: true }))}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Vendor
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
                                    placeholder="Search vendors..."
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
                                <Button variant="outline" onClick={loadVendors}>
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

            {/* Vendors Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Vendors ({state.vendors.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Vendor</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Tax ID</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-12"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {state.loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8">
                                        Loading vendors...
                                    </TableCell>
                                </TableRow>
                            ) : state.vendors.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8">
                                        No vendors found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                state.vendors.map((vendor) => (
                                    <TableRow key={vendor.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                                    <Building className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="font-medium">{vendor.name}</div>
                                                    {vendor.contactPerson && (
                                                        <div className="text-sm text-muted-foreground">
                                                            Contact: {vendor.contactPerson}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                {vendor.email && (
                                                    <div className="text-sm">{vendor.email}</div>
                                                )}
                                                {vendor.phone && (
                                                    <div className="text-sm text-muted-foreground">{vendor.phone}</div>
                                                )}
                                                {!vendor.email && !vendor.phone && (
                                                    <div className="text-sm text-muted-foreground">No contact info</div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {vendor.taxIdentifier ? (
                                                <code className="text-sm">{vendor.taxIdentifier}</code>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">Not provided</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={vendor.isActive ? 'default' : 'secondary'}
                                                className={vendor.isActive ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''}
                                            >
                                                {vendor.isActive ? 'Active' : 'Inactive'}
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
                                                            setState(prev => ({ ...prev, showViewDialog: true, viewingVendor: vendor }));
                                                        }}
                                                    >
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setState(prev => ({ ...prev, showEditDialog: true, editingVendor: vendor }));
                                                            setEditForm({
                                                                name: vendor.name,
                                                                contactPerson: vendor.contactPerson || '',
                                                                email: vendor.email || '',
                                                                phone: vendor.phone || '',
                                                                address: vendor.address || '',
                                                                taxIdentifier: vendor.taxIdentifier || '',
                                                                isActive: vendor.isActive,
                                                            });
                                                        }}
                                                    >
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleToggleStatus(vendor)}
                                                    >
                                                        <Building className="mr-2 h-4 w-4" />
                                                        {vendor.isActive ? 'Deactivate' : 'Activate'}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => setState(prev => ({ ...prev, showDeleteDialog: true, deletingVendor: vendor }))}
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

            {/* Create Vendor Dialog */}
            <Dialog open={state.showCreateDialog} onOpenChange={(open) => setState(prev => ({ ...prev, showCreateDialog: open }))}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Add New Vendor</DialogTitle>
                        <DialogDescription>
                            Create a new vendor to manage your supplier relationships.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Vendor Name *</Label>
                            <Input
                                id="name"
                                value={createForm.name}
                                onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Enter vendor name"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="contactPerson">Contact Person</Label>
                            <Input
                                id="contactPerson"
                                value={createForm.contactPerson}
                                onChange={(e) => setCreateForm(prev => ({ ...prev, contactPerson: e.target.value }))}
                                placeholder="Enter contact person name"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={createForm.email}
                                    onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                                    placeholder="Enter email address"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    value={createForm.phone}
                                    onChange={(e) => setCreateForm(prev => ({ ...prev, phone: e.target.value }))}
                                    placeholder="Enter phone number"
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="address">Address</Label>
                            <Textarea
                                id="address"
                                value={createForm.address}
                                onChange={(e) => setCreateForm(prev => ({ ...prev, address: e.target.value }))}
                                placeholder="Enter physical address"
                                rows={3}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="taxIdentifier">Tax Identifier (TIN)</Label>
                            <Input
                                id="taxIdentifier"
                                value={createForm.taxIdentifier}
                                onChange={(e) => setCreateForm(prev => ({ ...prev, taxIdentifier: e.target.value }))}
                                placeholder="Enter tax identification number"
                            />
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
                        <Button onClick={handleCreateVendor}>Add Vendor</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Vendor Dialog */}
            <Dialog open={state.showEditDialog} onOpenChange={(open) => setState(prev => ({ ...prev, showEditDialog: open }))}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Edit Vendor</DialogTitle>
                        <DialogDescription>
                            Update vendor information and contact details.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="editName">Vendor Name *</Label>
                            <Input
                                id="editName"
                                value={editForm.name}
                                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="editContactPerson">Contact Person</Label>
                            <Input
                                id="editContactPerson"
                                value={editForm.contactPerson}
                                onChange={(e) => setEditForm(prev => ({ ...prev, contactPerson: e.target.value }))}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="editEmail">Email</Label>
                                <Input
                                    id="editEmail"
                                    type="email"
                                    value={editForm.email}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="editPhone">Phone</Label>
                                <Input
                                    id="editPhone"
                                    value={editForm.phone}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="editAddress">Address</Label>
                            <Textarea
                                id="editAddress"
                                value={editForm.address}
                                onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                                rows={3}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="editTaxIdentifier">Tax Identifier (TIN)</Label>
                            <Input
                                id="editTaxIdentifier"
                                value={editForm.taxIdentifier}
                                onChange={(e) => setEditForm(prev => ({ ...prev, taxIdentifier: e.target.value }))}
                            />
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
                        <Button onClick={handleUpdateVendor}>Update Vendor</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Vendor Dialog */}
            <Dialog open={state.showViewDialog} onOpenChange={(open) => setState(prev => ({ ...prev, showViewDialog: open }))}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Vendor Details</DialogTitle>
                    </DialogHeader>
                    {state.viewingVendor && (
                        <div className="grid gap-4 py-4">
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Vendor Name</Label>
                                <p className="text-sm">{state.viewingVendor.name}</p>
                            </div>

                            {state.viewingVendor.contactPerson && (
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Contact Person</Label>
                                    <p className="text-sm">{state.viewingVendor.contactPerson}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                                    <p className="text-sm">{state.viewingVendor.email || 'Not provided'}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                                    <p className="text-sm">{state.viewingVendor.phone || 'Not provided'}</p>
                                </div>
                            </div>

                            {state.viewingVendor.address && (
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                                    <p className="text-sm">{state.viewingVendor.address}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Tax Identifier</Label>
                                    <p className="text-sm">{state.viewingVendor.taxIdentifier || 'Not provided'}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                                    <div>
                                        <Badge
                                            variant={state.viewingVendor.isActive ? 'default' : 'secondary'}
                                            className={state.viewingVendor.isActive ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''}
                                        >
                                            {state.viewingVendor.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                                    <p className="text-sm">{new Date(state.viewingVendor.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Last Updated</Label>
                                    <p className="text-sm">{new Date(state.viewingVendor.updatedAt).toLocaleDateString()}</p>
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

            {/* Delete Vendor Dialog */}
            <Dialog open={state.showDeleteDialog} onOpenChange={(open) => setState(prev => ({ ...prev, showDeleteDialog: open }))}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Vendor</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{state.deletingVendor?.name}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setState(prev => ({ ...prev, showDeleteDialog: false }))}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteVendor}>
                            Delete Vendor
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
} 