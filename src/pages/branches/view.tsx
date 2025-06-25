import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, RefreshCw, Users, MapPin, Phone, Mail, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { branchesService, devicesService } from '@/services/sdk';
import type {
    BranchResponseDto,
    DeviceResponseDto,
    DeviceTypeResponseDto
} from '@/lib/sdk';

export default function ViewBranchPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [branch, setBranch] = useState<BranchResponseDto | null>(null);
    const [devices, setDevices] = useState<DeviceResponseDto[]>([]);
    const [deviceTypes, setDeviceTypes] = useState<DeviceTypeResponseDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingDevices, setLoadingDevices] = useState(true);

    // Check if merchant is from Kenya
    const isKenyanMerchant = user?.merchant?.country === 'KE';

    // Load branch data
    const loadBranch = async () => {
        if (!id) return;

        try {
            setLoading(true);
            const branchData = await branchesService.branchControllerFindOne(id);
            setBranch(branchData);
        } catch (error: any) {
            console.error('Failed to load branch:', error);
            toast.error(error.message || 'Failed to load branch');
        } finally {
            setLoading(false);
        }
    };

    // Load devices for this branch
    const loadDevices = async () => {
        if (!id) return;

        try {
            setLoadingDevices(true);
            // Get merchantId from user context
            const merchantId = user?.merchantId || user?.merchant?.id;
            if (!merchantId) {
                throw new Error('Merchant ID not found');
            }
            const devicesData = await devicesService.deviceControllerFindAll(merchantId, id);
            setDevices(devicesData);
        } catch (error: any) {
            console.error('Failed to load devices:', error);
            toast.error('Failed to load devices');
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
            toast.error('Failed to load device types');
        }
    };

    useEffect(() => {
        if (user && id) {
            loadBranch();
            loadDevices();
            loadDeviceTypes();
        }
    }, [user, id]);

    const getDeviceTypeName = (deviceTypeId: string) => {
        const deviceType = deviceTypes.find(dt => dt.id === deviceTypeId);
        return deviceType ? deviceType.name : 'Unknown Type';
    };

    const getStatusColor = (isActive: boolean) => {
        return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-muted-foreground">Please log in to view branches</p>
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
                        <h1 className="text-3xl font-bold tracking-tight">{branch.name}</h1>
                        <p className="text-muted-foreground">
                            Branch details and device information
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => navigate(`/branches/${id}/edit`)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Branch
                    </Button>
                </div>
            </div>

            {/* Status and Key Info */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Badge className={getStatusColor(branch.isActive)}>
                                    {branch.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm font-medium">Status</p>
                                <div className="flex gap-1">
                                    {branch.isHeadOffice && (
                                        <Badge variant="outline" className="text-xs">Head Office</Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Users className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">Devices</p>
                                <p className="text-sm text-muted-foreground">{devices.length} devices</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <MapPin className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">Branch Code</p>
                                <p className="text-sm text-muted-foreground font-mono">{branch.code}</p>
                            </div>
                        </div>

                        {isKenyanMerchant && (
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <Badge variant="outline" className="text-xs">KRA</Badge>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">KRA Branch ID</p>
                                    <p className="text-sm text-muted-foreground">
                                        {branch.kraVscuBhfId ? (
                                            <code className="bg-muted px-1 py-0.5 rounded">{branch.kraVscuBhfId}</code>
                                        ) : (
                                            'Not configured'
                                        )}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Branch Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            Branch Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Name</p>
                            <p className="text-lg font-semibold">{branch.name}</p>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Code</p>
                            <p className="font-mono text-sm bg-muted px-2 py-1 rounded inline-block">{branch.code}</p>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Address</p>
                            <p className="text-sm">{branch.address}</p>
                        </div>

                        {(branch.latitude && branch.longitude) && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Coordinates</p>
                                <p className="text-sm font-mono">
                                    {branch.latitude}, {branch.longitude}
                                </p>
                            </div>
                        )}

                        <Separator />

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    Created
                                </p>
                                <p className="text-sm">{new Date(branch.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    Last Updated
                                </p>
                                <p className="text-sm">{new Date(branch.updatedAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Contact Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Phone className="h-5 w-5" />
                            Contact Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                <Phone className="h-4 w-4" />
                                Phone
                            </p>
                            <p className="text-sm font-mono">{branch.contactPhone}</p>
                        </div>

                        {branch.contactEmail && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                    <Mail className="h-4 w-4" />
                                    Email
                                </p>
                                <p className="text-sm">{branch.contactEmail}</p>
                            </div>
                        )}

                        {isKenyanMerchant && (
                            <>
                                <Separator />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">KRA Integration</p>
                                    <div className="mt-2">
                                        {branch.kraVscuBhfId ? (
                                            <div className="flex items-center gap-2">
                                                <Badge variant="default" className="bg-green-100 text-green-800">
                                                    Configured
                                                </Badge>
                                                <span className="text-sm">
                                                    Branch ID: <code className="bg-muted px-1 py-0.5 rounded">{branch.kraVscuBhfId}</code>
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-muted-foreground">
                                                    Not Configured
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    KRA VSCU integration not set up
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                        <Separator />

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Status</p>
                                <Badge variant={branch.isActive ? 'default' : 'secondary'}>
                                    {branch.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Type</p>
                                <Badge variant={branch.isHeadOffice ? 'default' : 'outline'}>
                                    {branch.isHeadOffice ? 'Head Office' : 'Branch'}
                                </Badge>
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
                            Devices assigned to this branch
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={loadDevices} size="sm">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                        <Button onClick={() => navigate(`/branches/${id}/edit`)} variant="outline">
                            <Edit className="h-4 w-4 mr-2" />
                            Manage Devices
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
                            <Button
                                onClick={() => navigate(`/branches/${id}/edit`)}
                                variant="outline"
                                className="mt-4"
                            >
                                Add Devices
                            </Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Device Name</TableHead>
                                    <TableHead>Serial Number</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Manufacturer</TableHead>
                                    <TableHead>Model</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>KRA Status</TableHead>
                                    <TableHead>Created</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {devices.map((device) => (
                                    <TableRow key={device.id}>
                                        <TableCell>
                                            <div className="font-medium">{device.name}</div>
                                        </TableCell>
                                        <TableCell>
                                            <code className="text-sm bg-muted px-1 py-0.5 rounded">{device.serialNumber}</code>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {getDeviceTypeName(device.deviceTypeId)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{device.manufacturer || 'Not specified'}</TableCell>
                                        <TableCell>{device.model || 'Not specified'}</TableCell>
                                        <TableCell>
                                            <Badge variant={device.isActive ? 'default' : 'secondary'}>
                                                {device.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {device.kraVscuInitialized ? (
                                                <Badge variant="default" className="bg-green-100 text-green-800">
                                                    KRA Initialized
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-muted-foreground">
                                                    Not Initialized
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {new Date(device.createdAt).toLocaleDateString()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
} 