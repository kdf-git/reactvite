import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, Edit, Trash2, ChevronLeft, ChevronRight, MoreHorizontal, Shield, CheckCircle, AlertCircle, ArrowUpDown, RefreshCw, Phone, Mail, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { getInitials } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useMerchantSettings, formatCurrency } from '@/hooks/useMerchantSettings';
import { customersService, branchesService, secureApi } from '@/services/sdk';
import { getErrorMessage } from '@/lib/utils/error-utils';
import type { CustomerResponseDto, CreateCustomerDto, UpdateCustomerDto, BranchResponseDto, RegisterKraCustomerDto } from '@/lib/sdk';

// Update interfaces to match the API DTOs
interface Customer extends CustomerResponseDto {
    // All KRA fields are already included in CustomerResponseDto, no need to override
}

interface CustomerFormData {
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    type: 'INDIVIDUAL' | 'BUSINESS';
    taxIdentifier: string;
    creditLimit: number;
    creditBalance: number;
    notes: string;
    isActive: boolean;
    customerCode: string;
}

interface CustomersPageState {
    customers: Customer[];
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
        type?: string;
        isActive?: boolean;
        branchId?: string;
    };
    branches: BranchResponseDto[];
    showDeleteDialog: boolean;
    showViewDialog: boolean;
    showKraRegisterDialog: boolean;
    showKraSyncDialog: boolean;
    editingCustomer: Customer | null;
    deletingCustomer: Customer | null;
    viewingCustomer: Customer | null;
    kraCustomer: Customer | null;
    kraLoading: boolean;
}

interface KraRegistrationData {
    merchantPin: string;
    branchId: string;
    customerPin: string;
    customerName: string;
    customerAddress: string;
}

const initialFormData: CustomerFormData = {
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    type: 'INDIVIDUAL',
    taxIdentifier: '',
    creditLimit: 0,
    creditBalance: 0,
    notes: '',
    isActive: true,
    customerCode: '',
};

export default function CustomersPage() {
    const { user } = useAuth();
    const merchantSettings = useMerchantSettings();
    const [state, setState] = useState<CustomersPageState>({
        customers: [],
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
        branches: [],
        showDeleteDialog: false,
        showViewDialog: false,
        showKraRegisterDialog: false,
        showKraSyncDialog: false,
        editingCustomer: null,
        deletingCustomer: null,
        viewingCustomer: null,
        kraCustomer: null,
        kraLoading: false,
    });

    const navigate = useNavigate();

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

    // Load branches from API
    const loadBranches = async () => {
        try {
            const merchantId = getMerchantId();
            if (!merchantId) return;

            const branchesData = await branchesService.branchControllerFindAll(merchantId);
            setState(prev => ({ ...prev, branches: branchesData }));
        } catch (error: any) {
            console.error('Failed to load branches:', error);
        }
    };

    // Load customers from API
    const loadCustomers = async () => {
        try {
            setState(prev => ({ ...prev, loading: true, error: null }));

            const merchantId = getMerchantId();
            if (!merchantId) {
                throw new Error('Merchant ID not found. Please ensure you are logged in.');
            }

            let customers: Customer[] = [];

            // Apply filters and call appropriate API endpoint
            if (state.filters.search) {
                customers = await customersService.customerControllerFindAll(
                    merchantId,
                    state.filters.type as any,
                    state.filters.search
                );
            } else if (state.filters.type) {
                customers = await customersService.customerControllerFindAll(
                    merchantId,
                    state.filters.type as any,
                    ''
                );
            } else {
                customers = await customersService.customerControllerFindAll(
                    merchantId,
                    undefined,
                    ''
                );
            }

            // Apply client-side filters
            let filteredCustomers = [...customers];

            if (state.filters.isActive !== undefined) {
                filteredCustomers = filteredCustomers.filter(customer =>
                    customer.isActive === state.filters.isActive
                );
            }

            if (state.filters.branchId && state.filters.branchId !== 'all') {
                filteredCustomers = filteredCustomers.filter(customer =>
                    customer.branchId === state.filters.branchId
                );
            }

            setState(prev => ({
                ...prev,
                customers: filteredCustomers,
                pagination: {
                    page: 1,
                    limit: 10,
                    total: filteredCustomers.length,
                    totalPages: Math.ceil(filteredCustomers.length / 10),
                    hasNext: filteredCustomers.length > 10,
                    hasPrev: false,
                },
                loading: false,
            }));
        } catch (error: any) {
            console.error('Failed to load customers:', error);
            setState(prev => ({
                ...prev,
                error: error.message || 'Failed to load customers',
                loading: false,
            }));
            toast.error(error.message || 'Failed to load customers');
        }
    };

    useEffect(() => {
        if (user) {
            loadBranches();
            loadCustomers();
        }
    }, [user, state.filters]);

    // Handle delete customer
    const handleDeleteCustomer = async () => {
        if (!state.deletingCustomer) return;

        try {
            await customersService.customerControllerRemove(state.deletingCustomer.id);
            toast.success('Customer deleted successfully');
            setState(prev => ({ ...prev, showDeleteDialog: false, deletingCustomer: null }));
            loadCustomers();
        } catch (error: any) {
            console.error('Failed to delete customer:', error);
            toast.error(error.message || 'Failed to delete customer');
        }
    };

    // Handle toggle customer status
    const handleToggleStatus = async (customer: Customer) => {
        try {
            await customersService.customerControllerToggleStatus(customer.id);
            toast.success(`Customer ${customer.isActive ? 'deactivated' : 'activated'} successfully`);
            loadCustomers();
        } catch (error: any) {
            console.error('Failed to toggle customer status:', error);
            toast.error(error.message || 'Failed to update customer status');
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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };


    // Show loading or error if user is not available
    if (!user) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-muted-foreground">Please log in to view customers</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
                    <p className="text-muted-foreground">
                        Manage your customer database and relationships
                    </p>
                </div>
                <Button onClick={() => navigate('/customers/create')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Customer
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
                                    placeholder="Search by name, phone, email..."
                                    value={state.filters.search}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                            <div>
                                <Label>Customer Type</Label>
                                <Select
                                    value={state.filters.type || 'all'}
                                    onValueChange={(value) =>
                                        handleFilterChange('type', value === 'all' ? undefined : value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                                        <SelectItem value="BUSINESS">Business</SelectItem>
                                    </SelectContent>
                                </Select>
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
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Branches</SelectItem>
                                        {state.branches.map((branch) => (
                                            <SelectItem key={branch.id} value={branch.id}>
                                                {branch.name} ({branch.code})
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
                                <Button variant="outline" onClick={loadCustomers}>
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

            {/* Customers Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Customers ({state.pagination.total})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Customer</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Branch</TableHead>
                                <TableHead>Credit</TableHead>
                                {merchantSettings.country === 'KE' && <TableHead>KRA Status</TableHead>}
                                <TableHead>Status</TableHead>
                                <TableHead className="w-12"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {state.loading ? (
                                <TableRow>
                                    <TableCell colSpan={merchantSettings.country === 'KE' ? 8 : 7} className="text-center py-8">
                                        Loading customers...
                                    </TableCell>
                                </TableRow>
                            ) : state.customers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={merchantSettings.country === 'KE' ? 8 : 7} className="text-center py-8">
                                        No customers found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                state.customers.map((customer) => (
                                    <TableRow key={customer.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback>
                                                        {getInitials(customer.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium">{customer.name}</div>
                                                    {customer.contactPerson && (
                                                        <div className="text-sm text-muted-foreground">
                                                            Contact: {customer.contactPerson}
                                                        </div>
                                                    )}
                                                    {customer.customerCode && (
                                                        <div className="text-xs text-muted-foreground">
                                                            Code: {customer.customerCode}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                {customer.phone && (
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <Phone className="h-3 w-3" />
                                                        {customer.phone}
                                                    </div>
                                                )}
                                                {customer.email && (
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <Mail className="h-3 w-3" />
                                                        {customer.email}
                                                    </div>
                                                )}
                                                {customer.city && (
                                                    <div className="text-xs text-muted-foreground">
                                                        {customer.city}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className="bg-purple-100 text-purple-900 hover:bg-purple-200 border-purple-300">
                                                {customer.type === 'INDIVIDUAL' ? 'Individual' : 'Business'}
                                            </Badge>
                                            {customer.taxIdentifier && (
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    Tax: {customer.taxIdentifier}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {customer.branchId ? (
                                                <div className="text-sm font-medium">
                                                    {state.branches.find(b => b.id === customer.branchId)?.name || 'Unknown Branch'}
                                                </div>
                                            ) : (
                                                <div className="text-sm text-muted-foreground">
                                                    No Branch
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">
                                                    {formatCurrency(customer.creditBalance, merchantSettings)}
                                                </div>
                                                {customer.creditLimit && customer.creditLimit > 0 && (
                                                    <div className="text-sm text-muted-foreground">
                                                        Limit: {formatCurrency(customer.creditLimit, merchantSettings)}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        {merchantSettings.country === 'KE' && (
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {customer.kraRegistered ? (
                                                        <>
                                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                                            <div>
                                                                <Badge className="text-xs bg-green-700 text-white hover:bg-green-800 border-green-700">
                                                                    Registered
                                                                </Badge>
                                                                {customer.kraPin && (
                                                                    <div className="text-xs text-muted-foreground mt-1">
                                                                        PIN: {customer.kraPin}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <AlertCircle className="h-4 w-4 text-red-600" />
                                                            <Badge className="text-xs bg-red-100 text-red-900 hover:bg-red-200 border-red-300">
                                                                Not Registered
                                                            </Badge>
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                        )}
                                        <TableCell>
                                            <Badge className={customer.isActive
                                                ? "bg-blue-700 text-white hover:bg-blue-800 border-blue-700"
                                                : "bg-gray-200 text-gray-800 hover:bg-gray-300 border-gray-400"
                                            }>
                                                {customer.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                            {customer.lastPurchase && (
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    Last: {formatDate(customer.lastPurchase.toString())}
                                                </div>
                                            )}
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
                                                            setState(prev => ({ ...prev, showViewDialog: true, viewingCustomer: customer }));
                                                        }}
                                                    >
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            navigate(`/customers/edit/${customer.id}`);
                                                        }}
                                                    >
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleToggleStatus(customer)}
                                                    >
                                                        <User className="mr-2 h-4 w-4" />
                                                        {customer.isActive ? 'Deactivate' : 'Activate'}
                                                    </DropdownMenuItem>
                                                    {merchantSettings.country === 'KE' && (
                                                        <>
                                                            <DropdownMenuSeparator />
                                                            {!customer.kraRegistered ? (
                                                                <DropdownMenuItem
                                                                    onClick={() => {
                                                                        setState(prev => ({
                                                                            ...prev,
                                                                            showKraRegisterDialog: true,
                                                                            kraCustomer: customer
                                                                        }));
                                                                    }}
                                                                >
                                                                    <Shield className="mr-2 h-4 w-4" />
                                                                    Register with KRA
                                                                </DropdownMenuItem>
                                                            ) : (
                                                                <DropdownMenuItem
                                                                    onClick={() => {
                                                                        setState(prev => ({
                                                                            ...prev,
                                                                            showKraSyncDialog: true,
                                                                            kraCustomer: customer
                                                                        }));
                                                                    }}
                                                                >
                                                                    <RefreshCw className="mr-2 h-4 w-4" />
                                                                    Sync KRA Data
                                                                </DropdownMenuItem>
                                                            )}
                                                        </>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => setState(prev => ({ ...prev, showDeleteDialog: true, deletingCustomer: customer }))}
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

            {/* View Customer Dialog */}
            <Dialog open={state.showViewDialog} onOpenChange={(open) => setState(prev => ({ ...prev, showViewDialog: open }))}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Customer Details</DialogTitle>
                    </DialogHeader>
                    {state.viewingCustomer && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Customer Name</Label>
                                    <p className="text-sm">{state.viewingCustomer.name}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Customer Type</Label>
                                    <p className="text-sm">{state.viewingCustomer.type === 'INDIVIDUAL' ? 'Individual' : 'Business'}</p>
                                </div>
                            </div>

                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Branch</Label>
                                <p className="text-sm">
                                    {state.viewingCustomer.branchId
                                        ? state.branches.find(b => b.id === state.viewingCustomer.branchId)?.name || 'Unknown Branch'
                                        : 'No branch assigned'
                                    }
                                </p>
                            </div>

                            {state.viewingCustomer.contactPerson && (
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Contact Person</Label>
                                    <p className="text-sm">{state.viewingCustomer.contactPerson}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                                    <p className="text-sm">{state.viewingCustomer.phone}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                                    <p className="text-sm">{state.viewingCustomer.email || 'Not provided'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                                    <p className="text-sm">{state.viewingCustomer.address || 'Not provided'}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">City</Label>
                                    <p className="text-sm">{state.viewingCustomer.city || 'Not provided'}</p>
                                </div>
                            </div>

                            {state.viewingCustomer.taxIdentifier && (
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Tax Identifier</Label>
                                    <p className="text-sm font-mono">{state.viewingCustomer.taxIdentifier}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Credit Limit</Label>
                                    <p className="text-sm">{formatCurrency(state.viewingCustomer.creditLimit || 0, merchantSettings)}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Credit Balance</Label>
                                    <p className="text-sm font-medium">{formatCurrency(state.viewingCustomer.creditBalance, merchantSettings)}</p>
                                </div>
                            </div>

                            <div className="grid gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                                    <div>
                                        <Badge className={state.viewingCustomer.isActive
                                            ? "bg-blue-700 text-white hover:bg-blue-800 border-blue-700"
                                            : "bg-gray-200 text-gray-800 hover:bg-gray-300 border-gray-400"
                                        }>
                                            {state.viewingCustomer.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            {state.viewingCustomer.customerCode && (
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Customer Code</Label>
                                    <p className="text-sm font-mono">{state.viewingCustomer.customerCode}</p>
                                </div>
                            )}

                            {state.viewingCustomer.notes && (
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Notes</Label>
                                    <p className="text-sm">{state.viewingCustomer.notes}</p>
                                </div>
                            )}

                            {/* KRA Integration Section - Only for Kenyan merchants */}
                            {merchantSettings.country === 'KE' && (
                                <div className="border-t pt-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Shield className="h-4 w-4" />
                                        <Label className="text-sm font-medium">KRA Registration</Label>
                                    </div>

                                    <div className="grid gap-3">
                                        <div className="flex items-center gap-2">
                                            <Label className="text-sm font-medium text-muted-foreground">Status:</Label>
                                            {state.viewingCustomer.kraRegistered ? (
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                    <Badge className="bg-green-700 text-white hover:bg-green-800 border-green-700">
                                                        Registered with KRA
                                                    </Badge>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <AlertCircle className="h-4 w-4 text-red-600" />
                                                    <Badge className="bg-red-100 text-red-900 hover:bg-red-200 border-red-300">
                                                        Not Registered
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>

                                        {state.viewingCustomer.kraRegistered && (
                                            <>
                                                {state.viewingCustomer.kraPin && (
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <Label className="text-sm font-medium text-muted-foreground">KRA PIN</Label>
                                                            <p className="text-sm font-mono">{state.viewingCustomer.kraPin}</p>
                                                        </div>
                                                        <div>
                                                            <Label className="text-sm font-medium text-muted-foreground">KRA Customer Name</Label>
                                                            <p className="text-sm">{state.viewingCustomer.kraCustomerName || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                )}

                                                {state.viewingCustomer.kraStatus && (
                                                    <div>
                                                        <Label className="text-sm font-medium text-muted-foreground">Taxpayer Status</Label>
                                                        <p className="text-sm">{state.viewingCustomer.kraStatus}</p>
                                                    </div>
                                                )}

                                                {(state.viewingCustomer.kraProvince || state.viewingCustomer.kraDistrict || state.viewingCustomer.kraSector) && (
                                                    <div className="grid grid-cols-3 gap-4">
                                                        {state.viewingCustomer.kraProvince && (
                                                            <div>
                                                                <Label className="text-sm font-medium text-muted-foreground">Province</Label>
                                                                <p className="text-sm">{state.viewingCustomer.kraProvince}</p>
                                                            </div>
                                                        )}
                                                        {state.viewingCustomer.kraDistrict && (
                                                            <div>
                                                                <Label className="text-sm font-medium text-muted-foreground">District</Label>
                                                                <p className="text-sm">{state.viewingCustomer.kraDistrict}</p>
                                                            </div>
                                                        )}
                                                        {state.viewingCustomer.kraSector && (
                                                            <div>
                                                                <Label className="text-sm font-medium text-muted-foreground">Sector</Label>
                                                                <p className="text-sm">{state.viewingCustomer.kraSector}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                <div className="grid grid-cols-2 gap-4">
                                                    {state.viewingCustomer.kraRegisteredAt && (
                                                        <div>
                                                            <Label className="text-sm font-medium text-muted-foreground">Registered</Label>
                                                            <p className="text-sm">{formatDate(state.viewingCustomer.kraRegisteredAt.toString())}</p>
                                                        </div>
                                                    )}
                                                    {state.viewingCustomer.kraLastSync && (
                                                        <div>
                                                            <Label className="text-sm font-medium text-muted-foreground">Last Sync</Label>
                                                            <p className="text-sm">{formatDate(state.viewingCustomer.kraLastSync.toString())}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                                    <p className="text-sm">{formatDate(state.viewingCustomer.createdAt.toString())}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Last Purchase</Label>
                                    <p className="text-sm">
                                        {state.viewingCustomer.lastPurchase
                                            ? formatDate(state.viewingCustomer.lastPurchase.toString())
                                            : 'No purchases yet'
                                        }
                                    </p>
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

            {/* Delete Customer Dialog */}
            <Dialog open={state.showDeleteDialog} onOpenChange={(open) => setState(prev => ({ ...prev, showDeleteDialog: open }))}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Customer</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{state.deletingCustomer?.name}"?
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setState(prev => ({ ...prev, showDeleteDialog: false }))}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteCustomer}>
                            Delete Customer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>


        </div>
    );
}

// KRA Registration Form Component
interface KraRegistrationFormProps {
    customer: Customer;
    loading: boolean;
    onSubmit: (data: KraRegistrationData) => void;
    onCancel: () => void;
}

function KraRegistrationForm({ customer, loading, onSubmit, onCancel }: KraRegistrationFormProps) {
    const { user } = useAuth();
    const [formData, setFormData] = useState<KraRegistrationData>({
        merchantPin: user?.merchant?.taxIdentifier || '',
        branchId: '00', // Default branch ID
        customerPin: customer.taxIdentifier || '',
        customerName: customer.name,
        customerAddress: customer.address || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="merchantPin">Merchant PIN *</Label>
                    <Input
                        id="merchantPin"
                        value={formData.merchantPin}
                        onChange={(e) => setFormData(prev => ({ ...prev, merchantPin: e.target.value }))}
                        placeholder="P000607989R"
                        required
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="branchId">Branch ID *</Label>
                    <Input
                        id="branchId"
                        value={formData.branchId}
                        onChange={(e) => setFormData(prev => ({ ...prev, branchId: e.target.value }))}
                        placeholder="00"
                        required
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="customerPin">Customer PIN *</Label>
                    <Input
                        id="customerPin"
                        value={formData.customerPin}
                        onChange={(e) => setFormData(prev => ({ ...prev, customerPin: e.target.value }))}
                        placeholder="P123456789X"
                        required
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="customerName">Customer Name *</Label>
                    <Input
                        id="customerName"
                        value={formData.customerName}
                        onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                        required
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="customerAddress">Customer Address</Label>
                    <Input
                        id="customerAddress"
                        value={formData.customerAddress}
                        onChange={(e) => setFormData(prev => ({ ...prev, customerAddress: e.target.value }))}
                        placeholder="123 Main Street, Nairobi"
                    />
                </div>
            </div>

            <DialogFooter>
                <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                    Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading ? 'Registering...' : 'Register with KRA'}
                </Button>
            </DialogFooter>
        </form>
    );
}

// KRA Sync Form Component
interface KraSyncFormProps {
    customer: Customer;
    loading: boolean;
    onSubmit: (data: { merchantPin: string; branchId: string }) => void;
    onCancel: () => void;
}

function KraSyncForm({ customer, loading, onSubmit, onCancel }: KraSyncFormProps) {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        merchantPin: user?.merchant?.taxIdentifier || '',
        branchId: '00', // Default branch ID
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-md">
                <p className="text-sm text-blue-800">
                    This will fetch the latest customer information from KRA using their PIN: <strong>{customer.kraPin}</strong>
                </p>
            </div>

            <div className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="syncMerchantPin">Merchant PIN *</Label>
                    <Input
                        id="syncMerchantPin"
                        value={formData.merchantPin}
                        onChange={(e) => setFormData(prev => ({ ...prev, merchantPin: e.target.value }))}
                        placeholder="P000607989R"
                        required
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="syncBranchId">Branch ID *</Label>
                    <Input
                        id="syncBranchId"
                        value={formData.branchId}
                        onChange={(e) => setFormData(prev => ({ ...prev, branchId: e.target.value }))}
                        placeholder="00"
                        required
                    />
                </div>
            </div>

            <DialogFooter>
                <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                    Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading ? 'Syncing...' : 'Sync from KRA'}
                </Button>
            </DialogFooter>
        </form>
    );
} 