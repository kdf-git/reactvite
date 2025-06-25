import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, UserCheck, UserMinus, Key, Check, ChevronsUpDown, Shield, ShieldCheck } from 'lucide-react';
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
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { adminService } from '@/services/sdk';
import { User } from '@/lib/sdk/models/User';
import { AdminCreateUserDto } from '@/lib/sdk/models/AdminCreateUserDto';
import { AdminUpdateUserDto } from '@/lib/sdk/models/AdminUpdateUserDto';
import { getInitials } from '@/lib/utils';

// Define a safer user type for our component
interface SafeUser {
    id: string;
    email: string;
    displayName?: string;
    avatar?: string;
    isActive: boolean;
    emailVerified: boolean;
    provider?: string;
    roles: string[];
    merchantId?: string;
    merchant?: {
        id: string;
        name: string;
    };
    createdAt: string;
}

interface UsersPageState {
    users: SafeUser[];
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
        emailVerified?: boolean;
        role?: string;
        provider?: string;
        merchantId?: string;
    };
    selectedUsers: string[];
    showCreateDialog: boolean;
    showEditDialog: boolean;
    showDeleteDialog: boolean;
    showPasswordDialog: boolean;
    editingUser: SafeUser | null;
    deletingUser: SafeUser | null;
    passwordUser: SafeUser | null;
}

export default function UsersPage() {
    const [searchParams] = useSearchParams();
    const { user: currentUser } = useAuth();
    const [merchants, setMerchants] = useState<{ id: string; name: string }[]>([]);
    const [roles, setRoles] = useState<{ id: string; name: string; description?: string }[]>([]);
    const [state, setState] = useState<UsersPageState>({
        users: [],
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
        selectedUsers: [],
        showCreateDialog: false,
        showEditDialog: false,
        showDeleteDialog: false,
        showPasswordDialog: false,
        editingUser: null,
        deletingUser: null,
        passwordUser: null,
    });

    const [createForm, setCreateForm] = useState<AdminCreateUserDto>({
        email: '',
        password: '',
        displayName: '',
        isActive: true,
        emailVerified: false,
        provider: 'local',
        roles: ['user'],
    });

    const [editForm, setEditForm] = useState<AdminUpdateUserDto>({});
    const [newPassword, setNewPassword] = useState('');
    const [createMerchantOpen, setCreateMerchantOpen] = useState(false);
    const [editMerchantOpen, setEditMerchantOpen] = useState(false);
    const [filterMerchantOpen, setFilterMerchantOpen] = useState(false);

    // Merchant selector component
    const MerchantSelector = ({
        value,
        onValueChange,
        open,
        onOpenChange,
        placeholder = "Select merchant..."
    }: {
        value?: string;
        onValueChange: (value: string | undefined) => void;
        open: boolean;
        onOpenChange: (open: boolean) => void;
        placeholder?: string;
    }) => {
        const selectedMerchant = merchants.find(m => m.id === value);

        return (
            <Popover open={open} onOpenChange={onOpenChange}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between"
                    >
                        {selectedMerchant ? selectedMerchant.name : value === null ? "No Merchant" : placeholder}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                    <Command>
                        <CommandInput placeholder="Search merchants..." />
                        <CommandEmpty>No merchant found.</CommandEmpty>
                        <CommandGroup>
                            <CommandItem
                                value="none"
                                onSelect={() => {
                                    onValueChange(undefined);
                                    onOpenChange(false);
                                }}
                            >
                                <Check
                                    className={`mr-2 h-4 w-4 ${value === undefined ? "opacity-100" : "opacity-0"}`}
                                />
                                No Merchant
                            </CommandItem>
                            {merchants.map((merchant) => (
                                <CommandItem
                                    key={merchant.id}
                                    value={merchant.name}
                                    onSelect={() => {
                                        onValueChange(merchant.id);
                                        onOpenChange(false);
                                    }}
                                >
                                    <Check
                                        className={`mr-2 h-4 w-4 ${value === merchant.id ? "opacity-100" : "opacity-0"}`}
                                    />
                                    {merchant.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </Command>
                </PopoverContent>
            </Popover>
        );
    };

    // Load merchants for dropdown
    const loadMerchants = async () => {
        try {
            const response = await adminService.getSimpleMerchantsList();
            setMerchants(response);
        } catch (error) {
            console.error('Failed to load merchants:', error);
        }
    };

    // Load roles for dropdown
    const loadRoles = async () => {
        try {
            const rolesData = await adminService.getAllRoles();
            setRoles(rolesData);
        } catch (error) {
            console.error('Failed to load roles:', error);
            toast.error('Failed to load roles');
            setRoles([]);
        }
    };

    // Helper function to safely convert API user to SafeUser
    const convertToSafeUser = (apiUser: any): SafeUser => ({
        id: apiUser.id || '',
        email: apiUser.email || '',
        displayName: typeof apiUser.displayName === 'string' ? apiUser.displayName : apiUser.displayName?.value || '',
        avatar: typeof apiUser.avatar === 'string' ? apiUser.avatar : apiUser.avatar?.url || '',
        isActive: Boolean(apiUser.isActive),
        emailVerified: Boolean(apiUser.emailVerified),
        provider: typeof apiUser.provider === 'string' ? apiUser.provider : apiUser.provider?.value || 'local',
        roles: Array.isArray(apiUser.roles) ? apiUser.roles : [],
        merchantId: apiUser.merchantId || undefined,
        merchant: apiUser.merchant || apiUser.Merchant || undefined,
        createdAt: apiUser.createdAt || new Date().toISOString(),
    });

    // Load users
    const loadUsers = async () => {
        try {
            setState(prev => ({ ...prev, loading: true, error: null }));

            const response = await adminService.getAllUsers({
                page: state.pagination.page,
                limit: state.pagination.limit,
                ...state.filters,
            }) as any;

            const safeUsers = (response.data || []).map(convertToSafeUser);

            setState(prev => ({
                ...prev,
                users: safeUsers,
                pagination: {
                    page: response.page || 1,
                    limit: response.limit || 10,
                    total: response.total || 0,
                    totalPages: response.totalPages || 0,
                    hasNext: response.hasNext || false,
                    hasPrev: response.hasPrev || false,
                },
                loading: false,
            }));
        } catch (error) {
            setState(prev => ({
                ...prev,
                error: 'Failed to load users',
                loading: false,
            }));
            toast.error('Failed to load users');
        }
    };

    useEffect(() => {
        loadUsers();
    }, [state.pagination.page, state.pagination.limit, state.filters]);

    useEffect(() => {
        loadMerchants();
        loadRoles();
    }, []);

    // Handle URL parameters
    useEffect(() => {
        const merchantId = searchParams.get('merchantId');
        if (merchantId) {
            setState(prev => ({
                ...prev,
                filters: { ...prev.filters, merchantId },
            }));
        }
    }, [searchParams]);

    // Create user
    const handleCreateUser = async () => {
        try {
            await adminService.createUser(createForm);
            toast.success('User created successfully');
            setState(prev => ({ ...prev, showCreateDialog: false }));
            setCreateForm({
                email: '',
                password: '',
                displayName: '',
                isActive: true,
                emailVerified: false,
                provider: 'local',
                roles: ['user'],
            });
            loadUsers();
        } catch (error) {
            toast.error('Failed to create user');
        }
    };

    // Update user
    const handleUpdateUser = async () => {
        if (!state.editingUser) return;

        try {
            await adminService.updateUser(state.editingUser.id, editForm);
            toast.success('User updated successfully');
            setState(prev => ({ ...prev, showEditDialog: false, editingUser: null }));
            setEditForm({});
            loadUsers();
        } catch (error) {
            toast.error('Failed to update user');
        }
    };

    // Delete user
    const handleDeleteUser = async () => {
        if (!state.deletingUser) return;

        // Prevent self-deletion
        if (currentUser && state.deletingUser.email === currentUser.email) {
            toast.error('You cannot delete your own account');
            setState(prev => ({ ...prev, showDeleteDialog: false, deletingUser: null }));
            return;
        }

        try {
            await adminService.deleteUser(state.deletingUser.id);
            toast.success('User deleted successfully');
            setState(prev => ({ ...prev, showDeleteDialog: false, deletingUser: null }));
            loadUsers();
        } catch (error) {
            toast.error('Failed to delete user');
        }
    };

    // Toggle user status
    const handleToggleUserStatus = async (user: SafeUser) => {
        // Prevent self-suspension
        if (currentUser && user.email === currentUser.email && user.isActive) {
            toast.error('You cannot suspend your own account');
            return;
        }

        try {
            await adminService.toggleUserStatus(user.id, { isActive: !user.isActive });
            toast.success(`User ${!user.isActive ? 'activated' : 'suspended'} successfully`);
            loadUsers();
        } catch (error) {
            toast.error('Failed to update user status');
        }
    };

    // Reset password
    const handleResetPassword = async () => {
        if (!state.passwordUser || !newPassword) return;

        try {
            await adminService.resetUserPassword(state.passwordUser.id, { newPassword });
            toast.success('Password reset successfully');
            setState(prev => ({ ...prev, showPasswordDialog: false, passwordUser: null }));
            setNewPassword('');
        } catch (error) {
            toast.error('Failed to reset password');
        }
    };

    // Promote user to admin
    const handlePromoteToAdmin = async (user: SafeUser) => {
        if (user.roles.includes('admin')) return;

        try {
            await adminService.updateUser(user.id, { roles: ['admin'] });
            toast.success('User promoted to admin successfully');
            loadUsers();
        } catch (error) {
            toast.error('Failed to promote user');
        }
    };

    // Demote user from admin
    const handleDemoteFromAdmin = async (user: SafeUser) => {
        if (!user.roles.includes('admin')) return;

        // Prevent self-demotion
        if (currentUser && user.email === currentUser.email) {
            toast.error('You cannot demote yourself from admin');
            return;
        }

        try {
            await adminService.updateUser(user.id, { roles: ['user'] });
            toast.success('User demoted from admin successfully');
            loadUsers();
        } catch (error) {
            toast.error('Failed to demote user');
        }
    };

    // Bulk status update
    const handleBulkStatusUpdate = async (isActive: boolean) => {
        if (state.selectedUsers.length === 0) return;

        // Check if current user is in selection and trying to suspend
        if (!isActive && currentUser) {
            const currentUserInSelection = state.users.find(user =>
                state.selectedUsers.includes(user.id) && user.email === currentUser.email
            );

            if (currentUserInSelection) {
                toast.error('Cannot suspend your own account. Please deselect yourself first.');
                return;
            }
        }

        try {
            await adminService.bulkUpdateUserStatus({
                userIds: state.selectedUsers,
                isActive,
            });
            toast.success(`${state.selectedUsers.length} users ${isActive ? 'activated' : 'suspended'} successfully`);
            setState(prev => ({ ...prev, selectedUsers: [] }));
            loadUsers();
        } catch (error) {
            toast.error('Failed to update users');
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
        // Handle special case for merchant filter
        if (key === 'merchantId' && value === 'none') {
            value = null; // This will filter for users with no merchant
        }

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

    // Handle user selection
    const handleUserSelection = (userId: string, checked: boolean) => {
        setState(prev => ({
            ...prev,
            selectedUsers: checked
                ? [...prev.selectedUsers, userId]
                : prev.selectedUsers.filter(id => id !== userId),
        }));
    };

    // Handle select all
    const handleSelectAll = (checked: boolean) => {
        setState(prev => ({
            ...prev,
            selectedUsers: checked ? state.users.map(user => user.id) : [],
        }));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Users</h1>
                    <p className="text-muted-foreground">
                        Manage user accounts and permissions
                    </p>
                </div>
                <Button onClick={() => setState(prev => ({ ...prev, showCreateDialog: true }))}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add User
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
                                    placeholder="Search by email or name..."
                                    value={state.filters.search}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
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
                                <Label>Email Verified</Label>
                                <Select
                                    value={state.filters.emailVerified?.toString() || 'all'}
                                    onValueChange={(value) =>
                                        handleFilterChange('emailVerified', value === 'all' ? undefined : value === 'true')
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="true">Verified</SelectItem>
                                        <SelectItem value="false">Unverified</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Role</Label>
                                <Select
                                    value={state.filters.role || 'all'}
                                    onValueChange={(value) =>
                                        handleFilterChange('role', value === 'all' ? undefined : value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Roles</SelectItem>
                                        {roles.map((role) => (
                                            <SelectItem key={role.id} value={role.name}>
                                                {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Merchant</Label>
                                <Popover open={filterMerchantOpen} onOpenChange={setFilterMerchantOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={filterMerchantOpen}
                                            className="w-full justify-between"
                                        >
                                            {state.filters.merchantId === null ? "No Merchant" :
                                                state.filters.merchantId ?
                                                    merchants.find(m => m.id === state.filters.merchantId)?.name || "Unknown Merchant" :
                                                    "All Merchants"}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0">
                                        <Command>
                                            <CommandInput placeholder="Search merchants..." />
                                            <CommandEmpty>No merchant found.</CommandEmpty>
                                            <CommandGroup>
                                                <CommandItem
                                                    value="all"
                                                    onSelect={() => {
                                                        handleFilterChange('merchantId', undefined);
                                                        setFilterMerchantOpen(false);
                                                    }}
                                                >
                                                    <Check
                                                        className={`mr-2 h-4 w-4 ${!state.filters.merchantId ? "opacity-100" : "opacity-0"}`}
                                                    />
                                                    All Merchants
                                                </CommandItem>
                                                <CommandItem
                                                    value="none"
                                                    onSelect={() => {
                                                        handleFilterChange('merchantId', null);
                                                        setFilterMerchantOpen(false);
                                                    }}
                                                >
                                                    <Check
                                                        className={`mr-2 h-4 w-4 ${state.filters.merchantId === null ? "opacity-100" : "opacity-0"}`}
                                                    />
                                                    No Merchant
                                                </CommandItem>
                                                {merchants.map((merchant) => (
                                                    <CommandItem
                                                        key={merchant.id}
                                                        value={merchant.name}
                                                        onSelect={() => {
                                                            handleFilterChange('merchantId', merchant.id);
                                                            setFilterMerchantOpen(false);
                                                        }}
                                                    >
                                                        <Check
                                                            className={`mr-2 h-4 w-4 ${state.filters.merchantId === merchant.id ? "opacity-100" : "opacity-0"}`}
                                                        />
                                                        {merchant.name}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div>
                                <Label>Provider</Label>
                                <Select
                                    value={state.filters.provider || 'all'}
                                    onValueChange={(value) =>
                                        handleFilterChange('provider', value === 'all' ? undefined : value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="local">Local</SelectItem>
                                        <SelectItem value="google">Google</SelectItem>
                                        <SelectItem value="github">GitHub</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Bulk Actions */}
            {state.selectedUsers.length > 0 && (
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground">
                                {state.selectedUsers.length} user(s) selected
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleBulkStatusUpdate(true)}
                            >
                                <UserCheck className="mr-2 h-4 w-4" />
                                Activate
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleBulkStatusUpdate(false)}
                            >
                                <UserMinus className="mr-2 h-4 w-4" />
                                Suspend
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Users Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Users ({state.pagination.total})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">
                                    <Checkbox
                                        checked={state.selectedUsers.length === state.users.length && state.users.length > 0}
                                        onCheckedChange={handleSelectAll}
                                    />
                                </TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Roles</TableHead>
                                <TableHead>Merchant</TableHead>
                                <TableHead>Provider</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="w-12"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {state.loading ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8">
                                        Loading users...
                                    </TableCell>
                                </TableRow>
                            ) : state.users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8">
                                        No users found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                state.users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <Checkbox
                                                checked={state.selectedUsers.includes(user.id)}
                                                onCheckedChange={(checked) => handleUserSelection(user.id, checked as boolean)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={user.avatar || undefined} />
                                                    <AvatarFallback>
                                                        {getInitials(user.displayName || user.email)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium">
                                                        {user.displayName || 'No name'}
                                                        {currentUser && user.email === currentUser.email && (
                                                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">You</span>
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">{user.email}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Badge variant={user.isActive ? 'default' : 'secondary'}>
                                                    {user.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                                {user.emailVerified && (
                                                    <Badge variant="outline">Verified</Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                {user.roles.map((role) => (
                                                    <Badge
                                                        key={role}
                                                        variant={role === 'admin' ? 'default' : 'outline'}
                                                        className="text-xs"
                                                    >
                                                        {role === 'admin' && <ShieldCheck className="mr-1 h-3 w-3" />}
                                                        {role}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {user.merchant ? (
                                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
                                                    {user.merchant.name}
                                                </Badge>
                                            ) : (
                                                <span className="text-muted-foreground text-sm">No merchant</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{user.provider || 'local'}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(user.createdAt).toLocaleDateString()}
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
                                                            setState(prev => ({ ...prev, showEditDialog: true, editingUser: user }));
                                                            setEditForm({
                                                                email: user.email,
                                                                displayName: user.displayName || '',
                                                                isActive: user.isActive,
                                                                emailVerified: user.emailVerified,
                                                                roles: user.roles,
                                                                merchantId: user.merchantId,
                                                            });
                                                        }}
                                                    >
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => setState(prev => ({ ...prev, showPasswordDialog: true, passwordUser: user }))}
                                                    >
                                                        <Key className="mr-2 h-4 w-4" />
                                                        Reset Password
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    {!user.roles.includes('admin') ? (
                                                        <DropdownMenuItem
                                                            onClick={() => handlePromoteToAdmin(user)}
                                                        >
                                                            <ShieldCheck className="mr-2 h-4 w-4" />
                                                            Promote to Admin
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        // Don't show demote option for current user
                                                        currentUser && user.email !== currentUser.email && (
                                                            <DropdownMenuItem
                                                                onClick={() => handleDemoteFromAdmin(user)}
                                                            >
                                                                <Shield className="mr-2 h-4 w-4" />
                                                                Demote from Admin
                                                            </DropdownMenuItem>
                                                        )
                                                    )}
                                                    {/* Don't show suspend option for current user, but allow activate */}
                                                    {!(currentUser && user.email === currentUser.email && user.isActive) && (
                                                        <DropdownMenuItem
                                                            onClick={() => handleToggleUserStatus(user)}
                                                        >
                                                            {user.isActive ? (
                                                                <>
                                                                    <UserMinus className="mr-2 h-4 w-4" />
                                                                    Suspend
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <UserCheck className="mr-2 h-4 w-4" />
                                                                    Activate
                                                                </>
                                                            )}
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                    {/* Don't show delete option for current user */}
                                                    {currentUser && user.email !== currentUser.email && (
                                                        <DropdownMenuItem
                                                            onClick={() => setState(prev => ({ ...prev, showDeleteDialog: true, deletingUser: user }))}
                                                            className="text-destructive"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    )}
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
                                {state.pagination.total} users
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

            {/* Create User Dialog */}
            <Dialog open={state.showCreateDialog} onOpenChange={(open) => setState(prev => ({ ...prev, showCreateDialog: open }))}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Create New User</DialogTitle>
                        <DialogDescription>
                            Add a new user to the system. They will receive login credentials via email.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={createForm.email}
                                onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                                placeholder="user@example.com"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={createForm.password}
                                onChange={(e) => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
                                placeholder="Enter password"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="displayName">Display Name</Label>
                            <Input
                                id="displayName"
                                value={createForm.displayName}
                                onChange={(e) => setCreateForm(prev => ({ ...prev, displayName: e.target.value }))}
                                placeholder="John Doe"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="merchant">Merchant</Label>
                            <MerchantSelector
                                value={createForm.merchantId}
                                onValueChange={(value) => setCreateForm(prev => ({ ...prev, merchantId: value }))}
                                open={createMerchantOpen}
                                onOpenChange={setCreateMerchantOpen}
                                placeholder="Select merchant"
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
                        <div className="grid gap-2">
                            <Label htmlFor="role">Role</Label>
                            <Select
                                value={createForm.roles?.[0] || 'user'}
                                onValueChange={(value) => setCreateForm(prev => ({ ...prev, roles: [value] }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map((role) => (
                                        <SelectItem key={role.id} value={role.name}>
                                            <div className="flex items-center">
                                                <span className="capitalize">{role.name}</span>
                                                {role.description && (
                                                    <span className="ml-2 text-xs text-muted-foreground">
                                                        - {role.description}
                                                    </span>
                                                )}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="emailVerified"
                                checked={createForm.emailVerified}
                                onCheckedChange={(checked) => setCreateForm(prev => ({ ...prev, emailVerified: checked }))}
                            />
                            <Label htmlFor="emailVerified">Email Verified</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setState(prev => ({ ...prev, showCreateDialog: false }))}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateUser}>Create User</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit User Dialog */}
            <Dialog open={state.showEditDialog} onOpenChange={(open) => setState(prev => ({ ...prev, showEditDialog: open }))}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>
                            Update user information and settings.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="editEmail">Email</Label>
                            <Input
                                id="editEmail"
                                type="email"
                                value={editForm.email || ''}
                                onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="editDisplayName">Display Name</Label>
                            <Input
                                id="editDisplayName"
                                value={editForm.displayName || ''}
                                onChange={(e) => setEditForm(prev => ({ ...prev, displayName: e.target.value }))}
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="editIsActive"
                                checked={editForm.isActive || false}
                                disabled={
                                    // Prevent current user from deactivating themselves
                                    currentUser &&
                                    state.editingUser?.email === currentUser.email &&
                                    editForm.isActive
                                }
                                onCheckedChange={(checked) => {
                                    // Prevent self-deactivation
                                    if (!checked && currentUser && state.editingUser?.email === currentUser.email) {
                                        toast.error('You cannot deactivate your own account');
                                        return;
                                    }
                                    setEditForm(prev => ({ ...prev, isActive: checked }));
                                }}
                            />
                            <Label
                                htmlFor="editIsActive"
                                className={
                                    currentUser &&
                                        state.editingUser?.email === currentUser.email &&
                                        editForm.isActive
                                        ? 'text-muted-foreground'
                                        : ''
                                }
                            >
                                Active
                                {currentUser &&
                                    state.editingUser?.email === currentUser.email &&
                                    editForm.isActive && (
                                        <span className="ml-1 text-xs">(cannot deactivate own account)</span>
                                    )}
                            </Label>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="editMerchant">Merchant</Label>
                            <MerchantSelector
                                value={editForm.merchantId}
                                onValueChange={(value) => setEditForm(prev => ({ ...prev, merchantId: value }))}
                                open={editMerchantOpen}
                                onOpenChange={setEditMerchantOpen}
                                placeholder="Select merchant"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="editRole">Role</Label>
                            <Select
                                value={editForm.roles?.[0] || 'user'}
                                onValueChange={(value) => {
                                    // Prevent self-demotion from admin
                                    if (currentUser && state.editingUser?.email === currentUser.email &&
                                        editForm.roles?.includes('admin') && value !== 'admin') {
                                        toast.error('You cannot remove your own admin role');
                                        return;
                                    }
                                    setEditForm(prev => ({ ...prev, roles: [value] }));
                                }}
                                disabled={
                                    // Prevent current user from changing their own admin role
                                    currentUser &&
                                    state.editingUser?.email === currentUser.email &&
                                    editForm.roles?.includes('admin')
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map((role) => (
                                        <SelectItem key={role.id} value={role.name}>
                                            <div className="flex items-center">
                                                <span className="capitalize">{role.name}</span>
                                                {role.description && (
                                                    <span className="ml-2 text-xs text-muted-foreground">
                                                        - {role.description}
                                                    </span>
                                                )}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {currentUser &&
                                state.editingUser?.email === currentUser.email &&
                                editForm.roles?.includes('admin') && (
                                    <p className="text-xs text-muted-foreground">
                                        You cannot change your own admin role
                                    </p>
                                )}
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="editEmailVerified"
                                checked={editForm.emailVerified || false}
                                onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, emailVerified: checked }))}
                            />
                            <Label htmlFor="editEmailVerified">Email Verified</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setState(prev => ({ ...prev, showEditDialog: false }))}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateUser}>Update User</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete User Dialog */}
            <Dialog open={state.showDeleteDialog} onOpenChange={(open) => setState(prev => ({ ...prev, showDeleteDialog: open }))}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete User</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {state.deletingUser?.displayName || state.deletingUser?.email}?
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setState(prev => ({ ...prev, showDeleteDialog: false }))}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteUser}>
                            Delete User
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reset Password Dialog */}
            <Dialog open={state.showPasswordDialog} onOpenChange={(open) => setState(prev => ({ ...prev, showPasswordDialog: open }))}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reset Password</DialogTitle>
                        <DialogDescription>
                            Enter a new password for {state.passwordUser?.displayName || state.passwordUser?.email}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setState(prev => ({ ...prev, showPasswordDialog: false }))}>
                            Cancel
                        </Button>
                        <Button onClick={handleResetPassword}>Reset Password</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
} 