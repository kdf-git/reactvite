import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { branchesService } from '@/services/sdk';
import { getErrorMessage } from '@/lib/utils/error-utils';

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

export default function CreateBranchPage() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [branchForm, setBranchForm] = useState<BranchFormData>(initialBranchFormData);
    const [saving, setSaving] = useState(false);

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

    const handleCreateBranch = async () => {
        try {
            setSaving(true);
            const merchantId = getMerchantId();
            if (!merchantId) {
                throw new Error('Merchant ID not found');
            }

            const createData = {
                ...branchForm,
                merchantId,
                latitude: branchForm.latitude || undefined,
                longitude: branchForm.longitude || undefined,
                kraVscuBhfId: branchForm.kraVscuBhfId || undefined,
            };

            await branchesService.branchControllerCreate(createData);
            toast.success('Branch created successfully!');
            navigate('/branches');
        } catch (error: any) {
            console.error('Failed to create branch:', error);
            toast.error(getErrorMessage(error));
        } finally {
            setSaving(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!branchForm.name.trim()) {
            toast.error('Branch name is required');
            return;
        }
        if (!branchForm.code.trim()) {
            toast.error('Branch code is required');
            return;
        }
        if (!branchForm.address.trim()) {
            toast.error('Address is required');
            return;
        }
        if (!branchForm.contactPhone.trim()) {
            toast.error('Contact phone is required');
            return;
        }

        handleCreateBranch();
    };

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
                        <h1 className="text-3xl font-bold tracking-tight">Create Branch</h1>
                        <p className="text-muted-foreground">
                            Add a new branch to your organization
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button onClick={handleSubmit} disabled={saving}>
                        {saving ? (
                            <>
                                <Save className="h-4 w-4 mr-2 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                Create Branch
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

                {/* Branch Preview */}
                <Card>
                    <CardHeader>
                        <CardTitle>Branch Preview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Initial Status</Label>
                                <div>
                                    <Badge variant={branchForm.isActive ? 'default' : 'secondary'}>
                                        {branchForm.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                    {branchForm.isHeadOffice && (
                                        <Badge variant="outline" className="ml-2">Head Office</Badge>
                                    )}
                                </div>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Devices</Label>
                                <p className="text-sm">0 devices (add after creation)</p>
                            </div>
                        </div>

                        {isKenyanMerchant && (
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">KRA Integration</Label>
                                <p className="text-sm">
                                    {branchForm.kraVscuBhfId ? (
                                        <>Will configure: <code className="bg-muted px-1 py-0.5 rounded">{branchForm.kraVscuBhfId}</code></>
                                    ) : (
                                        <span className="text-muted-foreground">Not configured</span>
                                    )}
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Location</Label>
                                <p className="text-sm">
                                    {branchForm.latitude && branchForm.longitude
                                        ? `${branchForm.latitude.toFixed(4)}, ${branchForm.longitude.toFixed(4)}`
                                        : 'Not specified'
                                    }
                                </p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Contact</Label>
                                <p className="text-sm">
                                    {branchForm.contactPhone || 'Not specified'}
                                </p>
                            </div>
                        </div>

                        <div className="pt-4 border-t space-y-3">
                            <h4 className="text-sm font-medium">Next Steps After Creation</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• Add devices to this branch</li>
                                <li>• Configure staff assignments</li>
                                <li>• Set up inventory allocation</li>
                                {isKenyanMerchant && <li>• Complete KRA device registration</li>}
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 