import { useState, useEffect } from 'react';
import { Plus, Search, MoreHorizontal, Edit, Trash2, Users, Eye, CreditCard, Send } from 'lucide-react';
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
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { staffService, branchesService } from '@/services/sdk';
import type {
    StaffResponseDto,
    CreateStaffDto,
    UpdateStaffDto,
    PositionResponseDto,
    DepartmentResponseDto,
    BranchResponseDto,
    KraStaffSubmissionResponseDto
} from '@/lib/sdk';

interface Staff extends StaffResponseDto { }

interface StaffFormData {
    branchId: string;
    positionId: string;
    departmentId: string;
    name: string;
    cardNo: string;
    phoneNo: string;
    email: string;
    isActive: boolean;
}

interface StaffPageState {
    staff: Staff[];
    branches: BranchResponseDto[];
    positions: PositionResponseDto[];
    departments: DepartmentResponseDto[];
    loading: boolean;
    error: string | null;
    filters: {
        search: string;
        branchId?: string;
        isActive?: boolean;
    };
    showCreateDialog: boolean;
    showEditDialog: boolean;
    showDeleteDialog: boolean;
    showViewDialog: boolean;
    editingStaff: Staff | null;
    deletingStaff: Staff | null;
    viewingStaff: Staff | null;
}

const initialFormData: StaffFormData = {
    branchId: 'all',
    positionId: '',
    departmentId: '',
    name: '',
    cardNo: '',
    phoneNo: '',
    email: '',
    isActive: true,
};

export default function StaffPage() {
    const { user } = useAuth();
    const [state, setState] = useState<StaffPageState>({
        staff: [],
        branches: [],
        positions: [],
        departments: [],
        loading: true,
        error: null,
        filters: {
            search: '',
        },
        showCreateDialog: false,
        showEditDialog: false,
        showDeleteDialog: false,
        showViewDialog: false,
        editingStaff: null,
        deletingStaff: null,
        viewingStaff: null,
    });

    const [createForm, setCreateForm] = useState<StaffFormData>(initialFormData);
    const [editForm, setEditForm] = useState<StaffFormData>(initialFormData);

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

    // Load initial data
    const loadData = async () => {
        try {
            setState(prev => ({ ...prev, loading: true, error: null }));

            const merchantId = getMerchantId();
            if (!merchantId) {
                throw new Error('Merchant ID not found. Please ensure you are logged in.');
            }

            // Load all required data
            const [staffData, branchesData, positionsData, departmentsData] = await Promise.all([
                staffService.staffControllerFindAllStaff(''),
                branchesService.branchControllerFindAll(merchantId),
                staffService.staffControllerFindAllPositions(),
                staffService.staffControllerFindAllDepartments(),
            ]);

            setState(prev => ({
                ...prev,
                staff: staffData,
                branches: branchesData,
                positions: positionsData,
                departments: departmentsData,
                loading: false,
            }));
        } catch (error: any) {
            console.error('Failed to load data:', error);
            setState(prev => ({
                ...prev,
                error: error.message || 'Failed to load data',
                loading: false,
            }));
            toast.error(error.message || 'Failed to load data');
        }
    };

    useEffect(() => {
        if (user) {
            loadData();
        }
    }, [user]);

    // Handle create staff
    const handleCreateStaff = async () => {
        try {
            const merchantId = getMerchantId();
            if (!merchantId) {
                throw new Error('Merchant ID not found');
            }

            const createData: CreateStaffDto = {
                merchantId,
                branchId: createForm.branchId === 'all' ? undefined : createForm.branchId,
                positionId: createForm.positionId,
                departmentId: createForm.departmentId,
                name: createForm.name,
                cardNo: createForm.cardNo,
                phoneNo: createForm.phoneNo || undefined,
                email: createForm.email || undefined,
                isActive: createForm.isActive,
            };

            await staffService.staffControllerCreateStaff(createData);
            toast.success('Staff member created successfully');
            setState(prev => ({ ...prev, showCreateDialog: false }));
            setCreateForm(initialFormData);
            loadData();
        } catch (error: any) {
            console.error('Failed to create staff:', error);
            toast.error(error.message || 'Failed to create staff member');
        }
    };

    // Handle update staff
    const handleUpdateStaff = async () => {
        if (!state.editingStaff) return;

        try {
            const updateData: UpdateStaffDto = {
                branchId: editForm.branchId === 'all' ? undefined : editForm.branchId,
                positionId: editForm.positionId,
                departmentId: editForm.departmentId,
                name: editForm.name,
                cardNo: editForm.cardNo,
                phoneNo: editForm.phoneNo || undefined,
                email: editForm.email || undefined,
                isActive: editForm.isActive,
            };

            await staffService.staffControllerUpdateStaff(state.editingStaff.id, updateData);
            toast.success('Staff member updated successfully');
            setState(prev => ({ ...prev, showEditDialog: false, editingStaff: null }));
            setEditForm(initialFormData);
            loadData();
        } catch (error: any) {
            console.error('Failed to update staff:', error);
            toast.error(error.message || 'Failed to update staff member');
        }
    };

    // Handle delete staff
    const handleDeleteStaff = async () => {
        if (!state.deletingStaff) return;

        try {
            await staffService.staffControllerDeleteStaff(state.deletingStaff.id);
            toast.success('Staff member deleted successfully');
            setState(prev => ({ ...prev, showDeleteDialog: false, deletingStaff: null }));
            loadData();
        } catch (error: any) {
            console.error('Failed to delete staff:', error);
            toast.error(error.message || 'Failed to delete staff member');
        }
    };

    // Handle toggle staff status
    const handleToggleStatus = async (staff: Staff) => {
        try {
            await staffService.staffControllerToggleStaffStatus(staff.id);
            toast.success(`Staff member ${staff.isActive ? 'deactivated' : 'activated'} successfully`);
            loadData();
        } catch (error: any) {
            console.error('Failed to toggle staff status:', error);
            toast.error(error.message || 'Failed to update staff status');
        }
    };

    // Handle KRA staff submission
    const handleKraSubmission = async (staff: Staff) => {
        try {
            // Call the KRA submission SDK method
            const result: KraStaffSubmissionResponseDto = await staffService.staffControllerSubmitStaffToKra(staff.id);
            toast.success(`Staff member "${staff.name}" successfully submitted to KRA VSCU`);
            loadData(); // Reload data to show updated KRA status
        } catch (error: any) {
            console.error('Failed to submit staff to KRA:', error);
            toast.error(error.message || 'Failed to submit staff to KRA');
        }
    };

    // Filter staff based on search and filters
    const filteredStaff = state.staff.filter(staff => {
        const matchesSearch = !state.filters.search ||
            staff.name.toLowerCase().includes(state.filters.search.toLowerCase()) ||
            staff.cardNo.toLowerCase().includes(state.filters.search.toLowerCase()) ||
            (staff.phoneNo && staff.phoneNo.includes(state.filters.search)) ||
            (staff.email && staff.email.toLowerCase().includes(state.filters.search.toLowerCase()));

        const matchesBranch = !state.filters.branchId || staff.branchId === state.filters.branchId;
        const matchesStatus = state.filters.isActive === undefined || staff.isActive === state.filters.isActive;

        return matchesSearch && matchesBranch && matchesStatus;
    });

    // Show loading or error if user is not available
    if (!user) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-muted-foreground">Please log in to view staff</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
                    <p className="text-muted-foreground">
                        Manage staff members and their device access cards
                    </p>
                </div>
                <Button onClick={() => setState(prev => ({ ...prev, showCreateDialog: true }))}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Staff Member
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
                                    placeholder="Search by name, card number, phone, or email..."
                                    value={state.filters.search}
                                    onChange={(e) => setState(prev => ({
                                        ...prev,
                                        filters: { ...prev.filters, search: e.target.value }
                                    }))}
                                    className="pl-8"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                            <div>
                                <Label>Branch</Label>
                                <Select
                                    value={state.filters.branchId || 'all'}
                                    onValueChange={(value) =>
                                        setState(prev => ({
                                            ...prev,
                                            filters: { ...prev.filters, branchId: value === 'all' ? undefined : value }
                                        }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
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

                            <div>
                                <Label>Status</Label>
                                <Select
                                    value={state.filters.isActive?.toString() || 'all'}
                                    onValueChange={(value) =>
                                        setState(prev => ({
                                            ...prev,
                                            filters: { ...prev.filters, isActive: value === 'all' ? undefined : value === 'true' }
                                        }))
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
                                <Button variant="outline" onClick={loadData}>
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

            {/* Staff Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Staff Members ({filteredStaff.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Staff Member</TableHead>
                                <TableHead>Card Number</TableHead>
                                <TableHead>Position</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Branch</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>KRA Status</TableHead>
                                <TableHead className="w-12"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {state.loading ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8">
                                        Loading staff members...
                                    </TableCell>
                                </TableRow>
                            ) : filteredStaff.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8">
                                        No staff members found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredStaff.map((staff) => (
                                    <TableRow key={staff.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                                    <Users className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="font-medium">{staff.name}</div>
                                                    {staff.phoneNo && (
                                                        <div className="text-sm text-muted-foreground">
                                                            {staff.phoneNo}
                                                        </div>
                                                    )}
                                                    {staff.email && (
                                                        <div className="text-sm text-muted-foreground">
                                                            {staff.email}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                                                <code className="text-sm font-medium">{staff.cardNo}</code>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{staff.position.name}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
                                                {staff.department.name}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {staff.branch ? staff.branch.name : 'All Branches'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={staff.isActive ? 'default' : 'outline'}
                                                className={staff.isActive ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'border-orange-200 bg-orange-50 text-orange-800 hover:bg-orange-100 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-200 dark:hover:bg-orange-900'}
                                            >
                                                {staff.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={(staff as any).kraSubmitted ? 'default' : 'outline'}
                                                className={(staff as any).kraSubmitted ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' : 'border-gray-200 bg-gray-50 text-gray-800 hover:bg-gray-100'}
                                            >
                                                {(staff as any).kraSubmitted ? 'Submitted' : 'Not Submitted'}
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
                                                            setState(prev => ({ ...prev, showViewDialog: true, viewingStaff: staff }));
                                                        }}
                                                    >
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setState(prev => ({ ...prev, showEditDialog: true, editingStaff: staff }));
                                                            setEditForm({
                                                                branchId: staff.branchId || 'all',
                                                                positionId: staff.positionId,
                                                                departmentId: staff.departmentId,
                                                                name: staff.name,
                                                                cardNo: staff.cardNo,
                                                                phoneNo: staff.phoneNo || '',
                                                                email: staff.email || '',
                                                                isActive: staff.isActive,
                                                            });
                                                        }}
                                                    >
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleToggleStatus(staff)}
                                                    >
                                                        <Users className="mr-2 h-4 w-4" />
                                                        {staff.isActive ? 'Deactivate' : 'Activate'}
                                                    </DropdownMenuItem>
                                                    {/* Only show KRA submission for active staff who haven't been submitted yet */}
                                                    {staff.isActive && !(staff as any).kraSubmitted && (
                                                        <DropdownMenuItem
                                                            onClick={() => handleKraSubmission(staff)}
                                                        >
                                                            <Send className="mr-2 h-4 w-4" />
                                                            Submit to KRA
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => setState(prev => ({ ...prev, showDeleteDialog: true, deletingStaff: staff }))}
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

            {/* Create Staff Dialog */}
            <Dialog open={state.showCreateDialog} onOpenChange={(open) => setState(prev => ({ ...prev, showCreateDialog: open }))}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Add New Staff Member</DialogTitle>
                        <DialogDescription>
                            Create a new staff member with device access card.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Full Name *</Label>
                                <Input
                                    id="name"
                                    value={createForm.name}
                                    onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Enter full name"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="cardNo">Card Number *</Label>
                                <Input
                                    id="cardNo"
                                    value={createForm.cardNo}
                                    onChange={(e) => setCreateForm(prev => ({ ...prev, cardNo: e.target.value }))}
                                    placeholder="7-16 character card number"
                                    maxLength={16}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Position *</Label>
                                <Select
                                    value={createForm.positionId}
                                    onValueChange={(value) => setCreateForm(prev => ({ ...prev, positionId: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select position" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {state.positions.map((position) => (
                                            <SelectItem key={position.id} value={position.id}>
                                                {position.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label>Department *</Label>
                                <Select
                                    value={createForm.departmentId}
                                    onValueChange={(value) => setCreateForm(prev => ({ ...prev, departmentId: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select department" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {state.departments.map((department) => (
                                            <SelectItem key={department.id} value={department.id}>
                                                {department.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>Branch (Optional)</Label>
                            <Select
                                value={createForm.branchId}
                                onValueChange={(value) => setCreateForm(prev => ({ ...prev, branchId: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select branch or leave empty for all branches" />
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

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="phoneNo">Phone Number</Label>
                                <Input
                                    id="phoneNo"
                                    value={createForm.phoneNo}
                                    onChange={(e) => setCreateForm(prev => ({ ...prev, phoneNo: e.target.value }))}
                                    placeholder="Enter phone number"
                                />
                            </div>

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
                        <Button onClick={handleCreateStaff}>Add Staff Member</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Staff Dialog */}
            <Dialog open={state.showEditDialog} onOpenChange={(open) => setState(prev => ({ ...prev, showEditDialog: open }))}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Edit Staff Member</DialogTitle>
                        <DialogDescription>
                            Update staff member information and access card.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="editName">Full Name *</Label>
                                <Input
                                    id="editName"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="editCardNo">Card Number *</Label>
                                <Input
                                    id="editCardNo"
                                    value={editForm.cardNo}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, cardNo: e.target.value }))}
                                    maxLength={16}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Position *</Label>
                                <Select
                                    value={editForm.positionId}
                                    onValueChange={(value) => setEditForm(prev => ({ ...prev, positionId: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {state.positions.map((position) => (
                                            <SelectItem key={position.id} value={position.id}>
                                                {position.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label>Department *</Label>
                                <Select
                                    value={editForm.departmentId}
                                    onValueChange={(value) => setEditForm(prev => ({ ...prev, departmentId: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {state.departments.map((department) => (
                                            <SelectItem key={department.id} value={department.id}>
                                                {department.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>Branch</Label>
                            <Select
                                value={editForm.branchId}
                                onValueChange={(value) => setEditForm(prev => ({ ...prev, branchId: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
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

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="editPhoneNo">Phone Number</Label>
                                <Input
                                    id="editPhoneNo"
                                    value={editForm.phoneNo}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, phoneNo: e.target.value }))}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="editEmail">Email</Label>
                                <Input
                                    id="editEmail"
                                    type="email"
                                    value={editForm.email}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                                />
                            </div>
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
                        <Button onClick={handleUpdateStaff}>Update Staff Member</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Staff Dialog */}
            <Dialog open={state.showViewDialog} onOpenChange={(open) => setState(prev => ({ ...prev, showViewDialog: open }))}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Staff Member Details</DialogTitle>
                    </DialogHeader>
                    {state.viewingStaff && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                                    <p className="text-sm">{state.viewingStaff.name}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Card Number</Label>
                                    <p className="text-sm font-mono">{state.viewingStaff.cardNo}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Position</Label>
                                    <p className="text-sm">{state.viewingStaff.position.name}</p>
                                    {state.viewingStaff.position.description && (
                                        <p className="text-xs text-muted-foreground">{state.viewingStaff.position.description}</p>
                                    )}
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Department</Label>
                                    <p className="text-sm">{state.viewingStaff.department.name}</p>
                                    {state.viewingStaff.department.description && (
                                        <p className="text-xs text-muted-foreground">{state.viewingStaff.department.description}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Branch Assignment</Label>
                                <p className="text-sm">{state.viewingStaff.branch ? state.viewingStaff.branch.name : 'All Branches'}</p>
                            </div>

                            {(state.viewingStaff.phoneNo || state.viewingStaff.email) && (
                                <div className="grid grid-cols-2 gap-4">
                                    {state.viewingStaff.phoneNo && (
                                        <div>
                                            <Label className="text-sm font-medium text-muted-foreground">Phone Number</Label>
                                            <p className="text-sm">{state.viewingStaff.phoneNo}</p>
                                        </div>
                                    )}
                                    {state.viewingStaff.email && (
                                        <div>
                                            <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                                            <p className="text-sm">{state.viewingStaff.email}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                                    <div>
                                        <Badge
                                            variant={state.viewingStaff.isActive ? 'default' : 'outline'}
                                            className={state.viewingStaff.isActive ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'border-orange-200 bg-orange-50 text-orange-800 hover:bg-orange-100 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-200 dark:hover:bg-orange-900'}
                                        >
                                            {state.viewingStaff.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                                    <p className="text-sm">{new Date(state.viewingStaff.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">KRA Status</Label>
                                    <div>
                                        <Badge
                                            variant={(state.viewingStaff as any).kraSubmitted ? 'default' : 'outline'}
                                            className={(state.viewingStaff as any).kraSubmitted ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' : 'border-gray-200 bg-gray-50 text-gray-800 hover:bg-gray-100'}
                                        >
                                            {(state.viewingStaff as any).kraSubmitted ? 'Submitted to KRA' : 'Not Submitted to KRA'}
                                        </Badge>
                                    </div>
                                </div>
                                {(state.viewingStaff as any).kraSubmittedAt && (
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">KRA Submitted At</Label>
                                        <p className="text-sm">{new Date((state.viewingStaff as any).kraSubmittedAt).toLocaleString()}</p>
                                    </div>
                                )}
                            </div>

                            {(state.viewingStaff as any).kraUserId && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">KRA User ID</Label>
                                        <p className="text-sm font-mono">{(state.viewingStaff as any).kraUserId}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">KRA User Name</Label>
                                        <p className="text-sm">{(state.viewingStaff as any).kraUserName}</p>
                                    </div>
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

            {/* Delete Staff Dialog */}
            <Dialog open={state.showDeleteDialog} onOpenChange={(open) => setState(prev => ({ ...prev, showDeleteDialog: open }))}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Staff Member</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{state.deletingStaff?.name}"?
                            This action cannot be undone and will revoke their device access.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setState(prev => ({ ...prev, showDeleteDialog: false }))}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteStaff}>
                            Delete Staff Member
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
} 