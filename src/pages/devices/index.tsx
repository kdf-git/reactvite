import { useState, useEffect } from 'react';
import { Plus, Search, MoreHorizontal, Edit, Trash2, Smartphone, Eye, Wifi, WifiOff, Shield, CheckCircle, AlertCircle } from 'lucide-react';
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
import { devicesService, branchesService } from '@/services/sdk';
import type { DeviceResponseDto, CreateDeviceDto, UpdateDeviceDto, BranchResponseDto, DeviceTypeResponseDto } from '@/lib/sdk';
import { useNavigate } from 'react-router-dom';

// Update interfaces to match the API DTOs
interface Device extends DeviceResponseDto { }

interface DeviceFormData {
    merchantId: string;
    branchId: string;
    name: string;
    serialNumber: string;
    deviceTypeId: string;
    model: string;
    manufacturer: string;
    isActive: boolean;
}

interface DevicesPageState {
    devices: Device[];
    branches: BranchResponseDto[];
    deviceTypes: DeviceTypeResponseDto[];
    loading: boolean;
    error: string | null;
    filters: {
        search: string;
        branchId?: string;
        deviceTypeId?: string;
        isActive?: boolean;
    };
    showCreateDialog: boolean;
    showDeleteDialog: boolean;
    showViewDialog: boolean;
    deletingDevice: Device | null;
    viewingDevice: Device | null;
}

const initialFormData: DeviceFormData = {
    merchantId: '',
    branchId: '',
    name: '',
    serialNumber: '',
    deviceTypeId: '',
    model: '',
    manufacturer: '',
    isActive: true,
};



export default function DevicesPage() {
    const { user } = useAuth();
    const [state, setState] = useState<DevicesPageState>({
        devices: [],
        branches: [],
        deviceTypes: [],
        loading: true,
        error: null,
        filters: {
            search: '',
        },
        showCreateDialog: false,
        showDeleteDialog: false,
        showViewDialog: false,
        deletingDevice: null,
        viewingDevice: null,
    });

    const [createForm, setCreateForm] = useState<DeviceFormData>(initialFormData);

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

    // Check if merchant is from Kenya
    const isKenyanMerchant = user?.merchant?.country === 'KE';

    // Load devices from API
    const loadDevices = async () => {
        try {
            setState(prev => ({ ...prev, loading: true, error: null }));

            const merchantId = getMerchantId();
            if (!merchantId) {
                throw new Error('Merchant ID not found. Please ensure you are logged in.');
            }

            // Load devices, branches, and device types
            const [devicesData, branchesData, deviceTypesData] = await Promise.all([
                devicesService.deviceControllerFindAll(merchantId, ''),
                branchesService.branchControllerFindAll(merchantId),
                devicesService.deviceControllerFindActiveDeviceTypes()
            ]);

            // Apply client-side filters
            let filteredDevices = [...devicesData];

            if (state.filters.search) {
                filteredDevices = filteredDevices.filter(device =>
                    device.name.toLowerCase().includes(state.filters.search.toLowerCase()) ||
                    device.serialNumber.toLowerCase().includes(state.filters.search.toLowerCase()) ||
                    (device.deviceType?.name && device.deviceType.name.toLowerCase().includes(state.filters.search.toLowerCase())) ||
                    (device.model && device.model.toLowerCase().includes(state.filters.search.toLowerCase())) ||
                    (device.manufacturer && device.manufacturer.toLowerCase().includes(state.filters.search.toLowerCase()))
                );
            }

            if (state.filters.branchId) {
                filteredDevices = filteredDevices.filter(device =>
                    device.branchId === state.filters.branchId
                );
            }

            if (state.filters.deviceTypeId) {
                filteredDevices = filteredDevices.filter(device =>
                    device.deviceTypeId === state.filters.deviceTypeId
                );
            }

            if (state.filters.isActive !== undefined) {
                filteredDevices = filteredDevices.filter(device =>
                    device.isActive === state.filters.isActive
                );
            }

            setState(prev => ({
                ...prev,
                devices: filteredDevices,
                branches: branchesData,
                deviceTypes: deviceTypesData,
                loading: false,
            }));
        } catch (error: any) {
            console.error('Failed to load devices:', error);
            setState(prev => ({
                ...prev,
                error: error.message || 'Failed to load devices',
                loading: false,
            }));
            toast.error(error.message || 'Failed to load devices');
        }
    };

    useEffect(() => {
        if (user) {
            loadDevices();
        }
    }, [user, state.filters]);

    // Handle create device
    const handleCreateDevice = async () => {
        try {
            const merchantId = getMerchantId();
            if (!merchantId) {
                throw new Error('Merchant ID not found');
            }

            const createData: CreateDeviceDto = {
                merchantId,
                branchId: createForm.branchId,
                name: createForm.name,
                serialNumber: createForm.serialNumber,
                deviceTypeId: createForm.deviceTypeId,
                model: createForm.model || undefined,
                manufacturer: createForm.manufacturer || undefined,
                isActive: createForm.isActive,
            };

            await devicesService.deviceControllerCreate(createData);
            toast.success('Device created successfully');
            setState(prev => ({ ...prev, showCreateDialog: false }));
            setCreateForm({ ...initialFormData, merchantId });
            loadDevices();
        } catch (error: any) {
            console.error('Failed to create device:', error);
            toast.error(error.message || 'Failed to create device');
        }
    };

    // Handle delete device
    const handleDeleteDevice = async () => {
        if (!state.deletingDevice) return;

        try {
            await devicesService.deviceControllerRemove(state.deletingDevice.id);
            toast.success('Device deleted successfully');
            setState(prev => ({ ...prev, showDeleteDialog: false, deletingDevice: null }));
            loadDevices();
        } catch (error: any) {
            console.error('Failed to delete device:', error);
            toast.error(error.message || 'Failed to delete device');
        }
    };

    // Handle toggle device status
    const handleToggleStatus = async (device: Device) => {
        try {
            await devicesService.deviceControllerToggleStatus(device.id);
            toast.success(`Device ${device.isActive ? 'deactivated' : 'activated'} successfully`);
            loadDevices();
        } catch (error: any) {
            console.error('Failed to toggle device status:', error);
            toast.error(error.message || 'Failed to update device status');
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

    // Get branch name by ID
    const getBranchName = (branchId: string) => {
        const branch = state.branches.find(b => b.id === branchId);
        return branch ? branch.name : 'Unknown Branch';
    };

    // Format last synced time
    const formatLastSynced = (lastSyncedAt?: string) => {
        if (!lastSyncedAt) return 'Never';
        const date = new Date(lastSyncedAt);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    // Show loading or error if user is not available
    if (!user) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-muted-foreground">Please log in to view devices</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Devices</h1>
                    <p className="text-muted-foreground">
                        Manage hardware devices across your branches
                    </p>
                </div>
                <Button onClick={() => {
                    const merchantId = getMerchantId();
                    if (merchantId) {
                        setCreateForm({ ...initialFormData, merchantId });
                        setState(prev => ({ ...prev, showCreateDialog: true }));
                    }
                }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Device
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
                                    placeholder="Search devices..."
                                    value={state.filters.search}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
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
                                                {branch.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Device Type</Label>
                                <Select
                                    value={state.filters.deviceTypeId || 'all'}
                                    onValueChange={(value) =>
                                        handleFilterChange('deviceTypeId', value === 'all' ? undefined : value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        {state.deviceTypes.map((type) => (
                                            <SelectItem key={type.id} value={type.id}>
                                                {type.name}
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
                                <Button variant="outline" onClick={loadDevices}>
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

            {/* Devices Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Devices ({state.devices.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Device</TableHead>
                                <TableHead>Serial Number</TableHead>
                                <TableHead>Branch</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Last Synced</TableHead>
                                <TableHead>Status</TableHead>
                                {isKenyanMerchant && <TableHead>KRA Status</TableHead>}
                                <TableHead className="w-12"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {state.loading ? (
                                <TableRow>
                                    <TableCell colSpan={isKenyanMerchant ? 8 : 7} className="text-center py-8">
                                        Loading devices...
                                    </TableCell>
                                </TableRow>
                            ) : state.devices.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={isKenyanMerchant ? 8 : 7} className="text-center py-8">
                                        No devices found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                state.devices.map((device) => (
                                    <TableRow key={device.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                                    <Smartphone className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="font-medium">{device.name}</div>
                                                    {device.manufacturer && device.model && (
                                                        <div className="text-sm text-muted-foreground">
                                                            {device.manufacturer} {device.model}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <code className="text-sm font-medium">{device.serialNumber}</code>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">{getBranchName(device.branchId)}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{device.deviceType?.name || 'Unknown'}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {device.lastSyncedAt ? (
                                                    <Wifi className="h-4 w-4 text-green-600" />
                                                ) : (
                                                    <WifiOff className="h-4 w-4 text-red-600" />
                                                )}
                                                <span className="text-sm">
                                                    {formatLastSynced(device.lastSyncedAt)}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={device.isActive ? 'default' : 'outline'}
                                                className={device.isActive ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'border-orange-200 bg-orange-50 text-orange-800 hover:bg-orange-100 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-200 dark:hover:bg-orange-900'}
                                            >
                                                {device.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        {isKenyanMerchant && (
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {device.kraVscuInitialized ? (
                                                        <>
                                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                                            <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
                                                                <Shield className="h-3 w-3 mr-1" />
                                                                Initialized
                                                            </Badge>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <AlertCircle className="h-4 w-4 text-orange-600" />
                                                            <Badge variant="outline" className="border-orange-200 bg-orange-50 text-orange-800 hover:bg-orange-100">
                                                                Not Initialized
                                                            </Badge>
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                        )}
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
                                                            setState(prev => ({ ...prev, showViewDialog: true, viewingDevice: device }));
                                                        }}
                                                    >
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            navigate(`/devices/${device.id}/edit`);
                                                        }}
                                                    >
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleToggleStatus(device)}
                                                    >
                                                        <Smartphone className="mr-2 h-4 w-4" />
                                                        {device.isActive ? 'Deactivate' : 'Activate'}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => setState(prev => ({ ...prev, showDeleteDialog: true, deletingDevice: device }))}
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

            {/* Create Device Dialog */}
            <Dialog open={state.showCreateDialog} onOpenChange={(open) => setState(prev => ({ ...prev, showCreateDialog: open }))}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Add New Device</DialogTitle>
                        <DialogDescription>
                            Register a new hardware device for your branch operations.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="branch">Branch *</Label>
                                <Select
                                    value={createForm.branchId}
                                    onValueChange={(value) => setCreateForm(prev => ({ ...prev, branchId: value }))}
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
                            <div className="grid gap-2">
                                <Label htmlFor="deviceType">Device Type *</Label>
                                <Select
                                    value={createForm.deviceTypeId}
                                    onValueChange={(value) => setCreateForm(prev => ({ ...prev, deviceTypeId: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select device type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {state.deviceTypes.map((type) => (
                                            <SelectItem key={type.id} value={type.id}>
                                                {type.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Device Name *</Label>
                                <Input
                                    id="name"
                                    value={createForm.name}
                                    onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Enter device name"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="serialNumber">Serial Number *</Label>
                                <Input
                                    id="serialNumber"
                                    value={createForm.serialNumber}
                                    onChange={(e) => setCreateForm(prev => ({ ...prev, serialNumber: e.target.value }))}
                                    placeholder="Enter serial number"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="manufacturer">Manufacturer</Label>
                                <Input
                                    id="manufacturer"
                                    value={createForm.manufacturer}
                                    onChange={(e) => setCreateForm(prev => ({ ...prev, manufacturer: e.target.value }))}
                                    placeholder="Enter manufacturer"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="model">Model</Label>
                                <Input
                                    id="model"
                                    value={createForm.model}
                                    onChange={(e) => setCreateForm(prev => ({ ...prev, model: e.target.value }))}
                                    placeholder="Enter model"
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
                        <Button onClick={handleCreateDevice}>Add Device</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Device Dialog */}
            <Dialog open={state.showViewDialog} onOpenChange={(open) => setState(prev => ({ ...prev, showViewDialog: open }))}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Device Details</DialogTitle>
                    </DialogHeader>
                    {state.viewingDevice && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Device Name</Label>
                                    <p className="text-sm">{state.viewingDevice.name}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Serial Number</Label>
                                    <p className="text-sm font-mono">{state.viewingDevice.serialNumber}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Device Type</Label>
                                    <p className="text-sm">{state.viewingDevice.deviceType?.name || 'Unknown'}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Branch</Label>
                                    <p className="text-sm">{getBranchName(state.viewingDevice.branchId)}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Manufacturer</Label>
                                    <p className="text-sm">{state.viewingDevice.manufacturer || 'Not specified'}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Model</Label>
                                    <p className="text-sm">{state.viewingDevice.model || 'Not specified'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                                    <div>
                                        <Badge
                                            variant={state.viewingDevice.isActive ? 'default' : 'outline'}
                                            className={state.viewingDevice.isActive ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'border-orange-200 bg-orange-50 text-orange-800 hover:bg-orange-100 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-200 dark:hover:bg-orange-900'}
                                        >
                                            {state.viewingDevice.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Last Synced</Label>
                                    <p className="text-sm">{formatLastSynced(state.viewingDevice.lastSyncedAt)}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                                    <p className="text-sm">{new Date(state.viewingDevice.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Last Updated</Label>
                                    <p className="text-sm">{new Date(state.viewingDevice.updatedAt).toLocaleDateString()}</p>
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

            {/* Delete Device Dialog */}
            <Dialog open={state.showDeleteDialog} onOpenChange={(open) => setState(prev => ({ ...prev, showDeleteDialog: open }))}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Device</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{state.deletingDevice?.name}"?
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setState(prev => ({ ...prev, showDeleteDialog: false }))}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteDevice}>
                            Delete Device
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
} 