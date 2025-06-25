import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, RefreshCw, Shield, CheckCircle, AlertCircle, Building, MapPin, User, Monitor, FileText, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { getErrorMessage } from '@/lib/utils/error-utils';
import type { DeviceResponseDto, UpdateDeviceDto, BranchResponseDto, DeviceTypeResponseDto, KraVscuInitDeviceDto } from '@/lib/sdk';

interface DeviceFormData {
    name: string;
    serialNumber: string;
    deviceTypeId: string;
    branchId: string;
    model: string;
    manufacturer: string;
    isActive: boolean;
}

export default function DeviceEditPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [device, setDevice] = useState<DeviceResponseDto | null>(null);
    const [branches, setBranches] = useState<BranchResponseDto[]>([]);
    const [deviceTypes, setDeviceTypes] = useState<DeviceTypeResponseDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [kraInitializing, setKraInitializing] = useState(false);
    const [kraEligible, setKraEligible] = useState(false);
    const [checkingEligibility, setCheckingEligibility] = useState(false);

    const [formData, setFormData] = useState<DeviceFormData>({
        name: '',
        serialNumber: '',
        deviceTypeId: '',
        branchId: '',
        model: '',
        manufacturer: '',
        isActive: true,
    });

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

    // Load device data
    const loadDevice = async () => {
        if (!id) return;

        try {
            setLoading(true);

            const merchantId = getMerchantId();
            if (!merchantId) {
                throw new Error('Merchant ID not found');
            }

            // Load device, branches, and device types
            const [deviceData, branchesData, deviceTypesData] = await Promise.all([
                devicesService.deviceControllerFindOne(id),
                branchesService.branchControllerFindAll(merchantId),
                devicesService.deviceControllerFindActiveDeviceTypes()
            ]);

            setDevice(deviceData);
            setBranches(branchesData);
            setDeviceTypes(deviceTypesData);

            // Set form data
            setFormData({
                name: deviceData.name,
                serialNumber: deviceData.serialNumber,
                deviceTypeId: deviceData.deviceTypeId,
                branchId: deviceData.branchId,
                model: deviceData.model || '',
                manufacturer: deviceData.manufacturer || '',
                isActive: deviceData.isActive,
            });

        } catch (error: any) {
            console.error('Failed to load device:', error);
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    // Check KRA eligibility
    const checkKraEligibility = async () => {
        try {
            setCheckingEligibility(true);
            const eligibility = await devicesService.deviceControllerCheckKraEligibility();
            setKraEligible(eligibility.eligible);
            if (!eligibility.eligible && eligibility.reason) {
                toast.info(eligibility.reason);
            }
        } catch (error: any) {
            console.error('Failed to check KRA eligibility:', error);
            setKraEligible(false);
        } finally {
            setCheckingEligibility(false);
        }
    };

    useEffect(() => {
        if (user && id) {
            loadDevice();
            checkKraEligibility();
        }
    }, [user, id]);

    // Handle update device
    const handleUpdateDevice = async () => {
        if (!device) return;

        try {
            setSaving(true);

            const updateData: UpdateDeviceDto = {
                name: formData.name,
                serialNumber: formData.serialNumber,
                deviceTypeId: formData.deviceTypeId,
                branchId: formData.branchId,
                model: formData.model || undefined,
                manufacturer: formData.manufacturer || undefined,
                isActive: formData.isActive,
            };

            await devicesService.deviceControllerUpdate(device.id, updateData);
            toast.success('Device updated successfully');

            // Reload device data
            await loadDevice();
        } catch (error: any) {
            console.error('Failed to update device:', error);
            toast.error(getErrorMessage(error));
        } finally {
            setSaving(false);
        }
    };

    // Handle KRA VSCU initialization
    const handleKraInitialization = async () => {
        if (!device) return;

        try {
            setKraInitializing(true);

            const initData: KraVscuInitDeviceDto = {};

            await devicesService.deviceControllerInitializeKraVscu(device.id, initData);
            toast.success('KRA VSCU initialized successfully');

            // Reload device data
            await loadDevice();
        } catch (error: any) {
            console.error('Failed to initialize KRA VSCU:', error);

            // Debug logging to see error structure
            console.log('🔍 [Debug] Error object structure:', {
                error,
                errorType: typeof error,
                errorConstructor: error.constructor.name,
                errorMessage: error.message,
                errorBody: error.body,
                errorResponse: error.response,
                errorResponseData: error.response?.data,
                kraResultCode: error.kraResultCode,
                kraResultMessage: error.kraResultMessage,
                bodyKraResultCode: error.body?.kraResultCode,
                bodyKraResultMessage: error.body?.kraResultMessage,
                responseDataKraResultCode: error.response?.data?.kraResultCode,
                responseDataKraResultMessage: error.response?.data?.kraResultMessage,
                responseDataMessage: error.response?.data?.message,
                responseDataStructure: error.response?.data ? Object.keys(error.response.data) : 'No response data',
            });

            toast.error(getErrorMessage(error));
        } finally {
            setKraInitializing(false);
        }
    };

    // Get KRA status
    const getKraStatus = async () => {
        if (!device) return;

        try {
            const status = await devicesService.deviceControllerGetKraVscuStatus(device.id);
            console.log('KRA Status:', status);
            toast.success('KRA status retrieved successfully');
        } catch (error: any) {
            console.error('Failed to get KRA status:', error);
            toast.error(getErrorMessage(error));
        }
    };

    // Get branch name by ID
    const getBranchName = (branchId: string) => {
        const branch = branches.find(b => b.id === branchId);
        return branch ? branch.name : 'Unknown Branch';
    };

    // Get device type name by ID
    const getDeviceTypeName = (deviceTypeId: string) => {
        const deviceType = deviceTypes.find(dt => dt.id === deviceTypeId);
        return deviceType ? deviceType.name : 'Unknown Type';
    };

    // Get current branch KRA details
    const getCurrentBranch = () => {
        return branches.find(b => b.id === device?.branchId);
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-muted-foreground">Please log in to edit devices</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading device...</p>
                </div>
            </div>
        );
    }

    if (!device) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-muted-foreground">Device not found</p>
                    <Button variant="outline" onClick={() => navigate('/devices')} className="mt-4">
                        Back to Devices
                    </Button>
                </div>
            </div>
        );
    }

    const currentBranch = getCurrentBranch();
    const merchantTin = user?.merchant?.taxIdentifier;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={() => navigate('/devices')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Devices
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Edit Device</h1>
                        <p className="text-muted-foreground">
                            Update device settings and manage KRA VSCU integration
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => loadDevice()}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                    <Button onClick={handleUpdateDevice} disabled={saving}>
                        {saving ? (
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4 mr-2" />
                        )}
                        Save Changes
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Device Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Device Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Device Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Enter device name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="serialNumber">Serial Number *</Label>
                                <Input
                                    id="serialNumber"
                                    value={formData.serialNumber}
                                    onChange={(e) => setFormData(prev => ({ ...prev, serialNumber: e.target.value }))}
                                    placeholder="Enter serial number"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Branch *</Label>
                                <Select
                                    value={formData.branchId}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, branchId: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select branch" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {branches.map((branch) => (
                                            <SelectItem key={branch.id} value={branch.id}>
                                                {branch.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Device Type *</Label>
                                <Select
                                    value={formData.deviceTypeId}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, deviceTypeId: value }))}
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
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="manufacturer">Manufacturer</Label>
                                <Input
                                    id="manufacturer"
                                    value={formData.manufacturer}
                                    onChange={(e) => setFormData(prev => ({ ...prev, manufacturer: e.target.value }))}
                                    placeholder="Enter manufacturer"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="model">Model</Label>
                                <Input
                                    id="model"
                                    value={formData.model}
                                    onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                                    placeholder="Enter model"
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="isActive"
                                checked={formData.isActive}
                                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                            />
                            <Label htmlFor="isActive">Device Active</Label>
                        </div>
                    </CardContent>
                </Card>

                {/* Device Status */}
                <Card>
                    <CardHeader>
                        <CardTitle>Device Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Device Type</Label>
                                <p className="text-sm">{getDeviceTypeName(device.deviceTypeId)}</p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Branch</Label>
                                <p className="text-sm">{getBranchName(device.branchId)}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                                <div>
                                    <Badge
                                        variant={device.isActive ? 'default' : 'outline'}
                                        className={device.isActive ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'border-orange-200 bg-orange-50 text-orange-800 hover:bg-orange-100 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-200 dark:hover:bg-orange-900'}
                                    >
                                        {device.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Last Synced</Label>
                                <p className="text-sm">
                                    {device.lastSyncedAt
                                        ? new Date(device.lastSyncedAt).toLocaleDateString() + ' ' + new Date(device.lastSyncedAt).toLocaleTimeString()
                                        : 'Never'
                                    }
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                                <p className="text-sm">{new Date(device.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Last Updated</Label>
                                <p className="text-sm">{new Date(device.updatedAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* KRA Device Information */}
            {checkingEligibility ? (
                <Card>
                    <CardContent className="flex items-center justify-center py-8">
                        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                        <span>Checking KRA eligibility...</span>
                    </CardContent>
                </Card>
            ) : kraEligible ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            KRA Device Information
                            <Badge variant="default" className="bg-green-100 text-green-800">
                                Available
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {device.kraVscuInitialized ? (
                            /* KRA Status Display */
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                    <div>
                                        <p className="text-sm font-medium text-green-800">KRA Device Initialized</p>
                                        <p className="text-sm text-green-700">
                                            This device is successfully registered with the KRA VSCU system.
                                        </p>
                                    </div>
                                </div>

                                {/* Business Information */}
                                {device.kraVscuInitResponse?.data?.info && (
                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                                <Building className="h-4 w-4" />
                                                Business Information
                                            </h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label className="text-xs font-medium text-muted-foreground">Taxpayer Name</Label>
                                                    <p className="text-sm font-medium">{device.kraVscuInitResponse.data.info.taxprNm || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <Label className="text-xs font-medium text-muted-foreground">Business Activity</Label>
                                                    <p className="text-sm">{device.kraVscuInitResponse.data.info.bsnsActv || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <Label className="text-xs font-medium text-muted-foreground">TIN</Label>
                                                    <p className="text-sm font-mono">{device.kraVscuInitResponse.data.info.tin || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <Label className="text-xs font-medium text-muted-foreground">VAT Type Code</Label>
                                                    <p className="text-sm font-mono">{device.kraVscuInitResponse.data.info.vatTyCd || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                                <MapPin className="h-4 w-4" />
                                                Branch Information
                                            </h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label className="text-xs font-medium text-muted-foreground">Branch Name</Label>
                                                    <p className="text-sm font-medium">{device.kraVscuInitResponse.data.info.bhfNm || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <Label className="text-xs font-medium text-muted-foreground">Branch ID</Label>
                                                    <p className="text-sm font-mono">{device.kraVscuInitResponse.data.info.bhfId || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <Label className="text-xs font-medium text-muted-foreground">Branch Open Date</Label>
                                                    <p className="text-sm">
                                                        {device.kraVscuInitResponse.data.info.bhfOpenDt
                                                            ? new Date(device.kraVscuInitResponse.data.info.bhfOpenDt.slice(0, 4) + '-' +
                                                                device.kraVscuInitResponse.data.info.bhfOpenDt.slice(4, 6) + '-' +
                                                                device.kraVscuInitResponse.data.info.bhfOpenDt.slice(6, 8)).toLocaleDateString()
                                                            : 'N/A'
                                                        }
                                                    </p>
                                                </div>
                                                <div>
                                                    <Label className="text-xs font-medium text-muted-foreground">Headquarters</Label>
                                                    <p className="text-sm">{device.kraVscuInitResponse.data.info.hqYn === 'Y' ? 'Yes' : 'No'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                                <MapPin className="h-4 w-4" />
                                                Location Information
                                            </h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label className="text-xs font-medium text-muted-foreground">Province</Label>
                                                    <p className="text-sm">{device.kraVscuInitResponse.data.info.prvncNm || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <Label className="text-xs font-medium text-muted-foreground">District</Label>
                                                    <p className="text-sm">{device.kraVscuInitResponse.data.info.dstrtNm || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <Label className="text-xs font-medium text-muted-foreground">Sector</Label>
                                                    <p className="text-sm">{device.kraVscuInitResponse.data.info.sctrNm || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <Label className="text-xs font-medium text-muted-foreground">Location Description</Label>
                                                    <p className="text-sm">{device.kraVscuInitResponse.data.info.locDesc || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                                <User className="h-4 w-4" />
                                                Manager Information
                                            </h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label className="text-xs font-medium text-muted-foreground">Manager Name</Label>
                                                    <p className="text-sm font-medium">{device.kraVscuInitResponse.data.info.mgrNm || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <Label className="text-xs font-medium text-muted-foreground">Manager Email</Label>
                                                    <p className="text-sm">{device.kraVscuInitResponse.data.info.mgrEmail || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <Label className="text-xs font-medium text-muted-foreground">Manager Phone</Label>
                                                    <p className="text-sm font-mono">{device.kraVscuInitResponse.data.info.mgrTelNo || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                                <Monitor className="h-4 w-4" />
                                                Device & Technical Information
                                            </h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label className="text-xs font-medium text-muted-foreground">KRA Device ID</Label>
                                                    <p className="text-sm font-mono">{device.kraVscuInitResponse.data.info.dvcId || device.kraVscuDvcId || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <Label className="text-xs font-medium text-muted-foreground">Device Serial</Label>
                                                    <p className="text-sm font-mono">{device.serialNumber}</p>
                                                </div>
                                                <div>
                                                    <Label className="text-xs font-medium text-muted-foreground">SDC ID</Label>
                                                    <p className="text-sm font-mono">{device.kraVscuInitResponse.data.info.sdcId || device.kraVscuSdcId || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <Label className="text-xs font-medium text-muted-foreground">MRC Number</Label>
                                                    <p className="text-sm font-mono">{device.kraVscuInitResponse.data.info.mrcNo || device.kraVscuMrcNo || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <Label className="text-xs font-medium text-muted-foreground">CMC Key</Label>
                                                    <p className="text-sm font-mono">{device.kraVscuInitResponse.data.info.cmcKey || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <Label className="text-xs font-medium text-muted-foreground">Sign Key</Label>
                                                    <p className="text-sm font-mono">{device.kraVscuInitResponse.data.info.signKey ? '••••••••' : 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                                <FileText className="h-4 w-4" />
                                                Invoice Tracking
                                            </h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label className="text-xs font-medium text-muted-foreground">Last Sale Invoice No</Label>
                                                    <p className="text-sm font-mono">{device.kraVscuInitResponse.data.info.lastSaleInvcNo || '0'}</p>
                                                </div>
                                                <div>
                                                    <Label className="text-xs font-medium text-muted-foreground">Last Purchase Invoice No</Label>
                                                    <p className="text-sm font-mono">{device.kraVscuInitResponse.data.info.lastPchsInvcNo || '0'}</p>
                                                </div>
                                                <div>
                                                    <Label className="text-xs font-medium text-muted-foreground">Last Sale Receipt No</Label>
                                                    <p className="text-sm font-mono">{device.kraVscuInitResponse.data.info.lastSaleRcptNo || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <Label className="text-xs font-medium text-muted-foreground">Last Copy Invoice No</Label>
                                                    <p className="text-sm font-mono">{device.kraVscuInitResponse.data.info.lastCopyInvcNo || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <Label className="text-xs font-medium text-muted-foreground">Last Training Invoice No</Label>
                                                    <p className="text-sm font-mono">{device.kraVscuInitResponse.data.info.lastTrainInvcNo || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <Label className="text-xs font-medium text-muted-foreground">Last Proforma Invoice No</Label>
                                                    <p className="text-sm font-mono">{device.kraVscuInitResponse.data.info.lastProfrmInvcNo || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                                <Clock className="h-4 w-4" />
                                                Status Information
                                            </h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label className="text-xs font-medium text-muted-foreground">Last KRA Sync</Label>
                                                    <p className="text-sm">
                                                        {device.kraVscuLastSyncAt
                                                            ? new Date(device.kraVscuLastSyncAt).toLocaleDateString() + ' ' + new Date(device.kraVscuLastSyncAt).toLocaleTimeString()
                                                            : 'Never'
                                                        }
                                                    </p>
                                                </div>
                                                <div>
                                                    <Label className="text-xs font-medium text-muted-foreground">Initialization Date</Label>
                                                    <p className="text-sm">
                                                        {device.kraVscuInitResponse?.resultDt
                                                            ? new Date(device.kraVscuInitResponse.resultDt.slice(0, 4) + '-' +
                                                                device.kraVscuInitResponse.resultDt.slice(4, 6) + '-' +
                                                                device.kraVscuInitResponse.resultDt.slice(6, 8) + ' ' +
                                                                device.kraVscuInitResponse.resultDt.slice(8, 10) + ':' +
                                                                device.kraVscuInitResponse.resultDt.slice(10, 12) + ':' +
                                                                device.kraVscuInitResponse.resultDt.slice(12, 14)).toLocaleString()
                                                            : 'N/A'
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={getKraStatus}>
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Refresh Status
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            /* KRA Initialization Section */
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <AlertCircle className="h-5 w-5 text-blue-600" />
                                    <div>
                                        <p className="text-sm font-medium text-blue-800">KRA Device Not Initialized</p>
                                        <p className="text-sm text-blue-700">
                                            Initialize this device with KRA VSCU system to enable tax compliance features.
                                        </p>
                                    </div>
                                </div>

                                {/* Prerequisites Check */}
                                <div className="space-y-3">
                                    <h4 className="text-sm font-medium">Prerequisites:</h4>

                                    <div className="flex items-center gap-2">
                                        {merchantTin ? (
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                        ) : (
                                            <AlertCircle className="h-4 w-4 text-red-600" />
                                        )}
                                        <span className="text-sm">
                                            Merchant TIN: {merchantTin ? (
                                                <span className="font-mono text-green-700">{merchantTin}</span>
                                            ) : (
                                                <span className="text-red-700">Not configured</span>
                                            )}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {currentBranch?.kraVscuBhfId ? (
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                        ) : (
                                            <AlertCircle className="h-4 w-4 text-red-600" />
                                        )}
                                        <span className="text-sm">
                                            Branch KRA ID: {currentBranch?.kraVscuBhfId ? (
                                                <span className="font-mono text-green-700">{currentBranch.kraVscuBhfId}</span>
                                            ) : (
                                                <span className="text-red-700">Not configured</span>
                                            )}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        <span className="text-sm">
                                            Device Serial: <span className="font-mono text-green-700">{device.serialNumber}</span>
                                        </span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t">
                                    <Button
                                        onClick={handleKraInitialization}
                                        disabled={kraInitializing || !merchantTin || !currentBranch?.kraVscuBhfId}
                                        className="w-full"
                                        size="lg"
                                    >
                                        {kraInitializing ? (
                                            <>
                                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                                Initializing with KRA...
                                            </>
                                        ) : (
                                            <>
                                                <Shield className="h-4 w-4 mr-2" />
                                                Initialize KRA Device
                                            </>
                                        )}
                                    </Button>
                                    {(!merchantTin || !currentBranch?.kraVscuBhfId) && (
                                        <p className="text-xs text-muted-foreground mt-2 text-center">
                                            Please ensure Merchant TIN and Branch KRA ID are configured before initialization.
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ) : null}
        </div>
    );
} 