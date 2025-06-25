import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, MoreHorizontal, Edit, Trash2, RefreshCw, Shield, CheckCircle, AlertCircle } from 'lucide-react';
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
import { branchesService, devicesService } from '@/services/sdk';
import { getErrorMessage } from '@/lib/utils/error-utils';
import type {
    BranchResponseDto,
    UpdateBranchDto,
    DeviceResponseDto,
    CreateDeviceDto,
    UpdateDeviceDto,
    DeviceTypeResponseDto
} from '@/lib/sdk';

interface BranchFormData {
    name: string;
    code: string;
    address: string;
    contactPhone: string;
    contactEmail: string;
    isActive: boolean;
    isHeadOffice: boolean;
    latitude?: number;
    longitude?: number;
    kraVscuBhfId?: string;
}

interface DeviceFormData {
    name: string;
    serialNumber: string;
    deviceTypeId: string;
    model: string;
    manufacturer: string;
    isActive: boolean;
}

const initialBranchFormData: BranchFormData = {
    name: '',
    code: '',
    address: '',
    contactPhone: '',
    contactEmail: '',
    isActive: true,
    isHeadOffice: false,
    latitude: undefined,
    longitude: undefined,
    kraVscuBhfId: '',
};

const initialDeviceFormData: DeviceFormData = {
    name: '',
    serialNumber: '',
    deviceTypeId: '',
    model: '',
    manufacturer: '',
    isActive: true,
};

export default function EditBranchPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [branch, setBranch] = useState<BranchResponseDto | null>(null);
    const [branchForm, setBranchForm] = useState<BranchFormData>(initialBranchFormData);
    const [devices, setDevices] = useState<DeviceResponseDto[]>([]);
    const [deviceTypes, setDeviceTypes] = useState<DeviceTypeResponseDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [loadingDevices, setLoadingDevices] = useState(true);

    // Device management states
    const [showAddDeviceDialog, setShowAddDeviceDialog] = useState(false);
    const [showEditDeviceDialog, setShowEditDeviceDialog] = useState(false);
    const [showDeleteDeviceDialog, setShowDeleteDeviceDialog] = useState(false);
    const [deviceForm, setDeviceForm] = useState<DeviceFormData>(initialDeviceFormData);
    const [editingDevice, setEditingDevice] = useState<DeviceResponseDto | null>(null);
    const [deletingDevice, setDeletingDevice] = useState<DeviceResponseDto | null>(null);
    const [deviceSaving, setDeviceSaving] = useState(false);

    // Check if merchant is from Kenya
    const isKenyanMerchant = user?.merchant?.country === 'KE';

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

    // Load branch data
    const loadBranch = async () => {
        if (!id) return;

        try {
            setLoading(true);
            const branchData = await branchesService.branchControllerFindOne(id);
            setBranch(branchData);
            setBranchForm({
                name: branchData.name,
                code: branchData.code,
                address: branchData.address,
                contactPhone: branchData.contactPhone,
                contactEmail: branchData.contactEmail || '',
                isActive: branchData.isActive,
                isHeadOffice: branchData.isHeadOffice,
                latitude: branchData.latitude,
                longitude: branchData.longitude,
                kraVscuBhfId: branchData.kraVscuBhfId || '',
            });
        } catch (error: any) {
            console.error('Failed to load branch:', error);
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    // Load devices for this branch
    const loadDevices = async () => {
        if (!id) return;

        try {
            setLoadingDevices(true);
            const merchantId = getMerchantId();
            if (!merchantId) {
                throw new Error('Merchant ID not found');
            }
            const devicesData = await devicesService.deviceControllerFindAll(merchantId, id);
            setDevices(devicesData);
        } catch (error: any) {
            console.error('Failed to load devices:', error);
            toast.error(getErrorMessage(error));
        } finally {
            setLoadingDevices(false);
        }
    };

    // Load device types
    const loadDeviceTypes = async () => {
        try {
            const deviceTypesData = await devicesService.deviceControllerFindActiveDeviceTypes();
            setDeviceTypes(deviceTypesData);
        } catch (error: any) {
            console.error('Failed to load device types:', error);
            toast.error(getErrorMessage(error));
        }
    };

    useEffect(() => {
        if (user && id) {
            loadBranch();
            loadDevices();
            loadDeviceTypes();
        }
    }, [user, id]);

    // Handle update branch
    const handleUpdateBranch = async () => {
        if (!branch) return;

        try {
            setSaving(true);
            const updateData: UpdateBranchDto = {
                name: branchForm.name,
                code: branchForm.code,
                address: branchForm.address,
                contactPhone: branchForm.contactPhone,
                contactEmail: branchForm.contactEmail || undefined,
                isActive: branchForm.isActive,
                isHeadOffice: branchForm.isHeadOffice,
                latitude: branchForm.latitude,
                longitude: branchForm.longitude,
                kraVscuBhfId: branchForm.kraVscuBhfId || undefined,
            };

            await branchesService.branchControllerUpdate(branch.id, updateData);
            toast.success('Branch updated successfully');
            await loadBranch(); // Reload to get updated data
        } catch (error: any) {
            console.error('Failed to update branch:', error);
            toast.error(getErrorMessage(error));
        } finally {
            setSaving(false);
        }
    };

    // Device management functions
    const handleAddDevice = async () => {
        if (!deviceForm.name || !deviceForm.serialNumber || !deviceForm.deviceTypeId) {
            toast.error('Please fill in all required device fields');
            return;
        }

        // Check for duplicate serial numbers in the current device list
        const existingDevice = devices.find(device =>
            device.serialNumber.toLowerCase() === deviceForm.serialNumber.toLowerCase()
        );

        if (existingDevice) {
            toast.error(`A device with serial number "${deviceForm.serialNumber}" already exists in this branch. Please use a different serial number.`);
            return;
        }

        try {
            setDeviceSaving(true);
            const merchantId = getMerchantId();
            if (!merchantId || !id) {
                throw new Error('Missing required IDs');
            }

            const createData: CreateDeviceDto = {
                merchantId,
                branchId: id,
                deviceTypeId: deviceForm.deviceTypeId,
                name: deviceForm.name,
                serialNumber: deviceForm.serialNumber,
                model: deviceForm.model || undefined,
                manufacturer: deviceForm.manufacturer || undefined,
                isActive: deviceForm.isActive,
            };

            await devicesService.deviceControllerCreate(createData);
            toast.success('Device added successfully');
            setDeviceForm(initialDeviceFormData);
            setShowAddDeviceDialog(false);
            await loadDevices();
        } catch (error: any) {
            console.error('Failed to add device:', error);

            // Handle specific error types
            if (error.message && error.message.includes('Unique constraint failed')) {
                if (error.message.includes('serialNumber')) {
                    toast.error('A device with this serial number already exists. Please use a different serial number.');
                } else {
                    toast.error('A device with these details already exists. Please check your input.');
                }
            } else if (error.response?.status === 400) {
                toast.error('Invalid device information provided. Please check all fields.');
            } else if (error.response?.status === 403) {
                toast.error('You do not have permission to add devices to this branch.');
            } else if (error.response?.status === 404) {
                toast.error('Branch or device type not found. Please refresh and try again.');
            } else {
                toast.error(getErrorMessage(error));
            }
        } finally {
            setDeviceSaving(false);
        }
    };

    const handleEditDevice = async () => {
        if (!editingDevice) return;

        // Check for duplicate serial numbers (excluding the current device being edited)
        const existingDevice = devices.find(device =>
            device.id !== editingDevice.id &&
            device.serialNumber.toLowerCase() === deviceForm.serialNumber.toLowerCase()
        );

        if (existingDevice) {
            toast.error(`Another device in this branch already uses serial number "${deviceForm.serialNumber}". Please use a different serial number.`);
            return;
        }

        try {
            setDeviceSaving(true);
            const updateData: UpdateDeviceDto = {
                name: deviceForm.name,
                serialNumber: deviceForm.serialNumber,
                deviceTypeId: deviceForm.deviceTypeId,
                model: deviceForm.model || undefined,
                manufacturer: deviceForm.manufacturer || undefined,
                isActive: deviceForm.isActive,
            };

            await devicesService.deviceControllerUpdate(editingDevice.id, updateData);
            toast.success('Device updated successfully');
            setEditingDevice(null);
            setDeviceForm(initialDeviceFormData);
            setShowEditDeviceDialog(false);
            await loadDevices();
        } catch (error: any) {
            console.error('Failed to update device:', error);

            // Handle specific error types
            if (error.message && error.message.includes('Unique constraint failed')) {
                if (error.message.includes('serialNumber')) {
                    toast.error('Another device already uses this serial number. Please use a different serial number.');
                } else {
                    toast.error('A device with these details already exists. Please check your input.');
                }
            } else if (error.response?.status === 400) {
                toast.error('Invalid device information provided. Please check all fields.');
            } else if (error.response?.status === 403) {
                toast.error('You do not have permission to update this device.');
            } else if (error.response?.status === 404) {
                toast.error('Device not found. It may have been deleted.');
            } else {
                toast.error(getErrorMessage(error));
            }
        } finally {
            setDeviceSaving(false);
        }
    };

    const handleDeleteDevice = async () => {
        if (!deletingDevice) return;

        try {
            await devicesService.deviceControllerRemove(deletingDevice.id);
            toast.success('Device deleted successfully');
            setDeletingDevice(null);
            setShowDeleteDeviceDialog(false);
            await loadDevices();
        } catch (error: any) {
            console.error('Failed to delete device:', error);
            toast.error(getErrorMessage(error));
        }
    };

    const handleToggleDeviceStatus = async (device: DeviceResponseDto) => {
        try {
            await devicesService.deviceControllerToggleStatus(device.id);
            toast.success(`Device ${device.isActive ? 'deactivated' : 'activated'} successfully`);
            await loadDevices();
        } catch (error: any) {
            console.error('Failed to toggle device status:', error);
            toast.error(getErrorMessage(error));
        }
    };

    const getDeviceTypeName = (deviceTypeId: string) => {
        const deviceType = deviceTypes.find(dt => dt.id === deviceTypeId);
        return deviceType ? deviceType.name : 'Unknown Type';
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-muted-foreground">Please log in to edit branches</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading branch...</p>
                </div>
            </div>
        );
    }

    if (!branch) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-muted-foreground">Branch not found</p>
                    <Button variant="outline" onClick={() => navigate('/branches')} className="mt-4">
                        Back to Branches
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={() => navigate('/branches')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Branches
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Edit Branch</h1>
                        <p className="text-muted-foreground">
                            Update branch information and manage devices
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => navigate(`/branches/${id}/view`)}>
                        View Details
                    </Button>
                    <Button onClick={handleUpdateBranch} disabled={saving}>
                        {saving ? (
                            <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Branch Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Branch Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Branch Name *</Label>
                                <Input
                                    id="name"
                                    value={branchForm.name}
                                    onChange={(e) => setBranchForm(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Enter branch name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="code">Branch Code *</Label>
                                <Input
                                    id="code"
                                    value={branchForm.code}
                                    onChange={(e) => setBranchForm(prev => ({ ...prev, code: e.target.value }))}
                                    placeholder="Enter branch code"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Address *</Label>
                            <Textarea
                                id="address"
                                value={branchForm.address}
                                onChange={(e) => setBranchForm(prev => ({ ...prev, address: e.target.value }))}
                                placeholder="Enter branch address"
                                rows={2}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="contactPhone">Contact Phone *</Label>
                                <Input
                                    id="contactPhone"
                                    value={branchForm.contactPhone}
                                    onChange={(e) => setBranchForm(prev => ({ ...prev, contactPhone: e.target.value }))}
                                    placeholder="+254712345678"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contactEmail">Contact Email</Label>
                                <Input
                                    id="contactEmail"
                                    type="email"
                                    value={branchForm.contactEmail}
                                    onChange={(e) => setBranchForm(prev => ({ ...prev, contactEmail: e.target.value }))}
                                    placeholder="branch@company.com"
                                />
                            </div>
                        </div>

                        {isKenyanMerchant && (
                            <div className="space-y-2">
                                <Label htmlFor="kraVscuBhfId">KRA Branch ID (for tax integration)</Label>
                                <Input
                                    id="kraVscuBhfId"
                                    value={branchForm.kraVscuBhfId}
                                    onChange={(e) => setBranchForm(prev => ({ ...prev, kraVscuBhfId: e.target.value }))}
                                    placeholder="e.g., 00 for main branch"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Required for KRA VSCU device integration. Contact KRA for your branch ID.
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="latitude">Latitude</Label>
                                <Input
                                    id="latitude"
                                    type="number"
                                    step="any"
                                    value={branchForm.latitude || ''}
                                    onChange={(e) => setBranchForm(prev => ({ ...prev, latitude: e.target.value ? parseFloat(e.target.value) : undefined }))}
                                    placeholder="-1.2921"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="longitude">Longitude</Label>
                                <Input
                                    id="longitude"
                                    type="number"
                                    step="any"
                                    value={branchForm.longitude || ''}
                                    onChange={(e) => setBranchForm(prev => ({ ...prev, longitude: e.target.value ? parseFloat(e.target.value) : undefined }))}
                                    placeholder="36.8219"
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="isActive"
                                checked={branchForm.isActive}
                                onCheckedChange={(checked) => setBranchForm(prev => ({ ...prev, isActive: checked }))}
                            />
                            <Label htmlFor="isActive">Branch Active</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="isHeadOffice"
                                checked={branchForm.isHeadOffice}
                                onCheckedChange={(checked) => setBranchForm(prev => ({ ...prev, isHeadOffice: checked }))}
                            />
                            <Label htmlFor="isHeadOffice">Head Office</Label>
                        </div>
                    </CardContent>
                </Card>

                {/* Branch Status */}
                <Card>
                    <CardHeader>
                        <CardTitle>Branch Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Current Status</Label>
                                <div>
                                    <Badge variant={branch.isActive ? 'default' : 'secondary'}>
                                        {branch.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                    {branch.isHeadOffice && (
                                        <Badge variant="outline" className="ml-2">Head Office</Badge>
                                    )}
                                </div>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Device Count</Label>
                                <p className="text-sm">{devices.length} devices</p>
                            </div>
                        </div>

                        {isKenyanMerchant && (
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">KRA Integration</Label>
                                <p className="text-sm">
                                    {branch.kraVscuBhfId ? (
                                        <>Configured: <code className="bg-muted px-1 py-0.5 rounded">{branch.kraVscuBhfId}</code></>
                                    ) : (
                                        <span className="text-muted-foreground">Not configured</span>
                                    )}
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                                <p className="text-sm">{new Date(branch.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Last Updated</Label>
                                <p className="text-sm">{new Date(branch.updatedAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Devices Section */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Branch Devices ({devices.length})</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Manage devices assigned to this branch
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={loadDevices} size="sm">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                        <Button onClick={() => setShowAddDeviceDialog(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Device
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {loadingDevices ? (
                        <div className="text-center py-8">
                            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-4" />
                            <p className="text-muted-foreground">Loading devices...</p>
                        </div>
                    ) : devices.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <p>No devices assigned to this branch</p>
                            <p className="text-sm">Add devices to start managing them</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Device Name</TableHead>
                                    <TableHead>Serial Number</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Manufacturer</TableHead>
                                    <TableHead>Status</TableHead>
                                    {isKenyanMerchant && <TableHead>KRA Status</TableHead>}
                                    <TableHead className="w-12"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {devices.map((device) => (
                                    <TableRow key={device.id}>
                                        <TableCell>
                                            <div className="font-medium">{device.name}</div>
                                            {device.model && (
                                                <div className="text-sm text-muted-foreground">{device.model}</div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <code className="text-sm">{device.serialNumber}</code>
                                        </TableCell>
                                        <TableCell>{getDeviceTypeName(device.deviceTypeId)}</TableCell>
                                        <TableCell>{device.manufacturer || 'Not specified'}</TableCell>
                                        <TableCell>
                                            <Badge variant={device.isActive ? 'default' : 'secondary'}>
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
                                                        onClick={() => navigate(`/devices/${device.id}/edit`)}
                                                    >
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit Device
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setEditingDevice(device);
                                                            setDeviceForm({
                                                                name: device.name,
                                                                serialNumber: device.serialNumber,
                                                                deviceTypeId: device.deviceTypeId,
                                                                model: device.model || '',
                                                                manufacturer: device.manufacturer || '',
                                                                isActive: device.isActive,
                                                            });
                                                            setShowEditDeviceDialog(true);
                                                        }}
                                                    >
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Quick Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleToggleDeviceStatus(device)}
                                                    >
                                                        <RefreshCw className="mr-2 h-4 w-4" />
                                                        {device.isActive ? 'Deactivate' : 'Activate'}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setDeletingDevice(device);
                                                            setShowDeleteDeviceDialog(true);
                                                        }}
                                                        className="text-destructive"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
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

            {/* Add Device Dialog */}
            <Dialog open={showAddDeviceDialog} onOpenChange={setShowAddDeviceDialog}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Add Device</DialogTitle>
                        <DialogDescription>
                            Add a new device to this branch.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="deviceName">Device Name *</Label>
                                <Input
                                    id="deviceName"
                                    value={deviceForm.name}
                                    onChange={(e) => setDeviceForm(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Enter device name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="serialNumber">Serial Number *</Label>
                                <Input
                                    id="serialNumber"
                                    value={deviceForm.serialNumber}
                                    onChange={(e) => setDeviceForm(prev => ({ ...prev, serialNumber: e.target.value }))}
                                    placeholder="Enter serial number"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Device Type *</Label>
                            <Select
                                value={deviceForm.deviceTypeId}
                                onValueChange={(value) => setDeviceForm(prev => ({ ...prev, deviceTypeId: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select device type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {deviceTypes.map((type) => (
                                        <SelectItem key={type.id} value={type.id}>
                                            {type.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="manufacturer">Manufacturer</Label>
                                <Input
                                    id="manufacturer"
                                    value={deviceForm.manufacturer}
                                    onChange={(e) => setDeviceForm(prev => ({ ...prev, manufacturer: e.target.value }))}
                                    placeholder="Enter manufacturer"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="model">Model</Label>
                                <Input
                                    id="model"
                                    value={deviceForm.model}
                                    onChange={(e) => setDeviceForm(prev => ({ ...prev, model: e.target.value }))}
                                    placeholder="Enter model"
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="deviceActive"
                                checked={deviceForm.isActive}
                                onCheckedChange={(checked) => setDeviceForm(prev => ({ ...prev, isActive: checked }))}
                            />
                            <Label htmlFor="deviceActive">Device Active</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddDeviceDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAddDevice}
                            disabled={!deviceForm.name || !deviceForm.serialNumber || !deviceForm.deviceTypeId || deviceSaving}
                        >
                            {deviceSaving ? (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Adding...
                                </>
                            ) : (
                                'Add Device'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Device Dialog */}
            <Dialog open={showEditDeviceDialog} onOpenChange={setShowEditDeviceDialog}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Quick Edit Device</DialogTitle>
                        <DialogDescription>
                            Update basic device information.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="editDeviceName">Device Name *</Label>
                                <Input
                                    id="editDeviceName"
                                    value={deviceForm.name}
                                    onChange={(e) => setDeviceForm(prev => ({ ...prev, name: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="editSerialNumber">Serial Number *</Label>
                                <Input
                                    id="editSerialNumber"
                                    value={deviceForm.serialNumber}
                                    onChange={(e) => setDeviceForm(prev => ({ ...prev, serialNumber: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Device Type *</Label>
                            <Select
                                value={deviceForm.deviceTypeId}
                                onValueChange={(value) => setDeviceForm(prev => ({ ...prev, deviceTypeId: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select device type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {deviceTypes.map((type) => (
                                        <SelectItem key={type.id} value={type.id}>
                                            {type.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="editManufacturer">Manufacturer</Label>
                                <Input
                                    id="editManufacturer"
                                    value={deviceForm.manufacturer}
                                    onChange={(e) => setDeviceForm(prev => ({ ...prev, manufacturer: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="editModel">Model</Label>
                                <Input
                                    id="editModel"
                                    value={deviceForm.model}
                                    onChange={(e) => setDeviceForm(prev => ({ ...prev, model: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="editDeviceActive"
                                checked={deviceForm.isActive}
                                onCheckedChange={(checked) => setDeviceForm(prev => ({ ...prev, isActive: checked }))}
                            />
                            <Label htmlFor="editDeviceActive">Device Active</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowEditDeviceDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleEditDevice}
                            disabled={!deviceForm.name || !deviceForm.serialNumber || !deviceForm.deviceTypeId || deviceSaving}
                        >
                            {deviceSaving ? (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                'Update Device'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Device Dialog */}
            <Dialog open={showDeleteDeviceDialog} onOpenChange={setShowDeleteDeviceDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Device</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{deletingDevice?.name}"?
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteDeviceDialog(false)}>
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