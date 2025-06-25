import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Shield, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useMerchantSettings } from '@/hooks/useMerchantSettings';
import { customersService, branchesService, secureApi } from '@/services/sdk';
import { getErrorMessage } from '@/lib/utils/error-utils';
import type { UpdateCustomerDto, CustomerResponseDto, BranchResponseDto, RegisterKraCustomerDto } from '@/lib/sdk';

interface KraRegistrationData {
    merchantPin: string;
    branchId: string;
    customerPin: string;
    customerName: string;
    customerAddress: string;
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
    branchId: string;
    creditLimit: number;
    notes: string;
    isActive: boolean;
    customerCode: string;
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
    branchId: '',
    creditLimit: 0,
    notes: '',
    isActive: true,
    customerCode: '',
};

export default function EditCustomerPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const merchantSettings = useMerchantSettings();
    const [formData, setFormData] = useState<CustomerFormData>(initialFormData);
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [customer, setCustomer] = useState<CustomerResponseDto | null>(null);
    const [branches, setBranches] = useState<BranchResponseDto[]>([]);
    const [showKraSyncDialog, setShowKraSyncDialog] = useState(false);
    const [kraLoading, setKraLoading] = useState(false);

    // Load customer data
    useEffect(() => {
        const loadData = async () => {
            if (!id) return;

            try {
                setPageLoading(true);

                // Load customer and branches in parallel
                const [customerData, branchesData] = await Promise.all([
                    customersService.customerControllerFindOne(id),
                    branchesService.branchControllerFindAll(user?.merchantId || '')
                ]);

                setCustomer(customerData);
                setBranches(branchesData);

                // Set form data with customer information
                setFormData({
                    name: customerData.name,
                    contactPerson: customerData.contactPerson || '',
                    email: customerData.email || '',
                    phone: customerData.phone,
                    address: customerData.address || '',
                    city: customerData.city || '',
                    type: customerData.type as 'INDIVIDUAL' | 'BUSINESS',
                    taxIdentifier: customerData.taxIdentifier || '',
                    branchId: customerData.branchId || '',
                    creditLimit: customerData.creditLimit || 0,
                    notes: customerData.notes || '',
                    isActive: customerData.isActive,
                    customerCode: customerData.customerCode || '',
                });
            } catch (error) {
                console.error('Failed to load data:', error);
                toast.error(getErrorMessage(error));
            } finally {
                setPageLoading(false);
            }
        };

        loadData();
    }, [id]);

    // Handle update customer
    const handleUpdateCustomer = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!id) return;

        try {
            setLoading(true);

            const updateData: UpdateCustomerDto = {
                name: formData.name,
                contactPerson: formData.contactPerson || undefined,
                email: formData.email || undefined,
                phone: formData.phone,
                address: formData.address || undefined,
                city: formData.city || undefined,
                type: formData.type as UpdateCustomerDto.type,
                taxIdentifier: formData.taxIdentifier || undefined,
                branchId: formData.branchId || undefined,
                creditLimit: formData.creditLimit || undefined,
                creditBalance: customer?.creditBalance || 0,
                notes: formData.notes || undefined,
                isActive: formData.isActive,
                customerCode: formData.customerCode || undefined,
                isLoyaltyEnabled: customer?.isLoyaltyEnabled || true,
            };

            await customersService.customerControllerUpdate(id, updateData);
            toast.success('Customer updated successfully');
            navigate('/customers');
        } catch (error: any) {
            console.error('Failed to update customer:', error);
            toast.error(error.message || 'Failed to update customer');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/customers');
    };

    // KRA Integration Handlers
    const handleKraRegistration = async () => {
        if (!customer || !user?.merchant?.taxIdentifier || !customer.taxIdentifier) return;

        // Find the customer's assigned branch
        const assignedBranch = branches.find(branch => branch.id === customer.branchId);
        if (!assignedBranch) {
            toast.error('Customer must be assigned to a branch for KRA registration');
            return;
        }

        try {
            setKraLoading(true);

            // Prepare the DTO for KRA VSCU service using branch details
            const registerDto: RegisterKraCustomerDto = {
                tin: user.merchant.taxIdentifier,
                bhfId: assignedBranch.kraVscuBhfId || '00', // Use KRA branch ID instead of branch code
                customerPin: customer.taxIdentifier,
                customerName: customer.name,
                customerAddress: customer.address || '',
                customerPhone: customer.phone || undefined,
                customerEmail: customer.email || undefined,
            };

            // Call the KRA VSCU registration endpoint
            await secureApi.customers.customerControllerRegisterWithKra(customer.id, registerDto);

            // Reload the customer data to get updated KRA information
            const updatedCustomer = await customersService.customerControllerFindOne(customer.id);
            setCustomer(updatedCustomer);

            toast.success('Customer successfully registered with KRA');
        } catch (error: any) {
            console.error('KRA registration error:', error);
            toast.error(getErrorMessage(error));
        } finally {
            setKraLoading(false);
        }
    };


    if (pageLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-muted-foreground">Loading customer...</p>
                </div>
            </div>
        );
    }

    if (!customer) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-muted-foreground">Customer not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={handleCancel}>
                    <ArrowLeft className="h-4 w-4" />
                    Back to Customers
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Edit Customer</h1>
                    <p className="text-muted-foreground">
                        Update information for {customer.name}
                    </p>
                </div>
            </div>

            {/* Edit Customer Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Customer Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleUpdateCustomer} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Customer Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Enter customer name"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="type">Customer Type *</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(value: 'INDIVIDUAL' | 'BUSINESS') => setFormData(prev => ({ ...prev, type: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                                        <SelectItem value="BUSINESS">Business</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="branch">Branch</Label>
                            <Select
                                value={formData.branchId || "none"}
                                onValueChange={(value) => setFormData(prev => ({ ...prev, branchId: value === "none" ? "" : value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a branch" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No Branch</SelectItem>
                                    {branches.map((branch) => (
                                        <SelectItem key={branch.id} value={branch.id}>
                                            {branch.name} ({branch.code})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {formData.type === 'BUSINESS' && (
                            <div className="grid gap-2">
                                <Label htmlFor="contactPerson">Contact Person</Label>
                                <Input
                                    id="contactPerson"
                                    value={formData.contactPerson}
                                    onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                                    placeholder="Enter contact person name"
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone Number *</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                    placeholder="+254712345678"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                    placeholder="customer@example.com"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="address">Address</Label>
                                <Input
                                    id="address"
                                    value={formData.address}
                                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                    placeholder="Enter address"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="city">City</Label>
                                <Input
                                    id="city"
                                    value={formData.city}
                                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                                    placeholder="Enter city"
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="taxIdentifier">
                                {merchantSettings.country === 'KE' ? 'Customer PIN' : 'TIN'}
                            </Label>
                            <Input
                                id="taxIdentifier"
                                value={formData.taxIdentifier}
                                onChange={(e) => setFormData(prev => ({ ...prev, taxIdentifier: e.target.value }))}
                                placeholder={merchantSettings.country === 'KE' ? 'P051234567A' : 'Enter TIN'}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="creditLimit">Credit Limit ({merchantSettings.currency})</Label>
                            <Input
                                id="creditLimit"
                                type="number"
                                step="0.01"
                                value={formData.creditLimit}
                                onChange={(e) => setFormData(prev => ({ ...prev, creditLimit: parseFloat(e.target.value) || 0 }))}
                                placeholder="0.00"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="customerCode">Customer Code</Label>
                            <Input
                                id="customerCode"
                                value={formData.customerCode}
                                onChange={(e) => setFormData(prev => ({ ...prev, customerCode: e.target.value }))}
                                placeholder="Enter customer code (optional)"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                placeholder="Additional notes about the customer"
                                rows={3}
                            />
                        </div>

                        <div className="flex items-center">
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="isActive"
                                    checked={formData.isActive}
                                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                                />
                                <Label htmlFor="isActive">Active</Label>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4 pt-6">
                            <Button type="button" variant="outline" onClick={handleCancel} disabled={loading}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Updating...' : 'Update Customer'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* KRA Integration Section - Only for Kenyan merchants */}
            {merchantSettings.country === 'KE' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            KRA Integration
                            <Badge variant="default" className="bg-green-100 text-green-800">
                                Available
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {customer.kraRegistered ? (
                            /* KRA Status Display */
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                    <div>
                                        <p className="text-sm font-medium text-green-800">Customer Registered with KRA</p>
                                        <p className="text-sm text-green-700">
                                            This customer is successfully registered with the KRA VSCU system.
                                        </p>
                                    </div>
                                </div>

                                {/* KRA Information */}
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-xs font-medium text-muted-foreground">KRA PIN</Label>
                                            <p className="text-sm font-mono">{customer.kraPin || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <Label className="text-xs font-medium text-muted-foreground">KRA Customer Name</Label>
                                            <p className="text-sm">{customer.kraCustomerName || 'N/A'}</p>
                                        </div>
                                    </div>

                                    {customer.kraStatus && (
                                        <div>
                                            <Label className="text-xs font-medium text-muted-foreground">Taxpayer Status</Label>
                                            <p className="text-sm">{customer.kraStatus}</p>
                                        </div>
                                    )}

                                    {(customer.kraProvince || customer.kraDistrict || customer.kraSector) && (
                                        <div className="grid grid-cols-3 gap-4">
                                            {customer.kraProvince && (
                                                <div>
                                                    <Label className="text-xs font-medium text-muted-foreground">Province</Label>
                                                    <p className="text-sm">{customer.kraProvince}</p>
                                                </div>
                                            )}
                                            {customer.kraDistrict && (
                                                <div>
                                                    <Label className="text-xs font-medium text-muted-foreground">District</Label>
                                                    <p className="text-sm">{customer.kraDistrict}</p>
                                                </div>
                                            )}
                                            {customer.kraSector && (
                                                <div>
                                                    <Label className="text-xs font-medium text-muted-foreground">Sector</Label>
                                                    <p className="text-sm">{customer.kraSector}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        {customer.kraRegisteredAt && (
                                            <div>
                                                <Label className="text-xs font-medium text-muted-foreground">Registered</Label>
                                                <p className="text-sm">{new Date(customer.kraRegisteredAt).toLocaleDateString()}</p>
                                            </div>
                                        )}
                                        {customer.kraLastSync && (
                                            <div>
                                                <Label className="text-xs font-medium text-muted-foreground">Last Sync</Label>
                                                <p className="text-sm">{new Date(customer.kraLastSync).toLocaleDateString()}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowKraSyncDialog(true)}
                                        disabled={kraLoading}
                                    >
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Sync KRA Data
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            /* KRA Registration Section */
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <AlertCircle className="h-5 w-5 text-blue-600" />
                                    <div>
                                        <p className="text-sm font-medium text-blue-800">Customer Not Registered with KRA</p>
                                        <p className="text-sm text-blue-700">
                                            Register this customer with KRA VSCU system to enable tax compliance features.
                                        </p>
                                    </div>
                                </div>

                                {/* Prerequisites Check */}
                                <div className="space-y-3">
                                    <h4 className="text-sm font-medium">Prerequisites:</h4>

                                    <div className="flex items-center gap-2">
                                        {user?.merchant?.taxIdentifier ? (
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                        ) : (
                                            <AlertCircle className="h-4 w-4 text-red-600" />
                                        )}
                                        <span className="text-sm">
                                            Merchant TIN: {user?.merchant?.taxIdentifier ? (
                                                <span className="font-mono text-green-700">{user.merchant.taxIdentifier}</span>
                                            ) : (
                                                <span className="text-red-700">Not configured</span>
                                            )}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {customer.taxIdentifier ? (
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                        ) : (
                                            <AlertCircle className="h-4 w-4 text-red-600" />
                                        )}
                                        <span className="text-sm">
                                            Customer TIN: {customer.taxIdentifier ? (
                                                <span className="font-mono text-green-700">{customer.taxIdentifier}</span>
                                            ) : (
                                                <span className="text-red-700">Not provided</span>
                                            )}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {customer.branchId ? (
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                        ) : (
                                            <AlertCircle className="h-4 w-4 text-red-600" />
                                        )}
                                        <span className="text-sm">
                                            Branch Assignment: {customer.branchId ? (
                                                <span className="text-green-700">
                                                    {branches.find(b => b.id === customer.branchId)?.name || 'Assigned'}
                                                </span>
                                            ) : (
                                                <span className="text-red-700">Not assigned</span>
                                            )}
                                        </span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t">
                                    <Button
                                        onClick={handleKraRegistration}
                                        disabled={kraLoading || !user?.merchant?.taxIdentifier || !customer.taxIdentifier || !customer.branchId}
                                        className="w-full"
                                        size="lg"
                                    >
                                        {kraLoading ? (
                                            <>
                                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                                Registering with KRA...
                                            </>
                                        ) : (
                                            <>
                                                <Shield className="h-4 w-4 mr-2" />
                                                Register Customer with KRA
                                            </>
                                        )}
                                    </Button>
                                    {(!user?.merchant?.taxIdentifier || !customer.taxIdentifier || !customer.branchId) && (
                                        <p className="text-xs text-muted-foreground mt-2 text-center">
                                            Please ensure Merchant TIN, Customer TIN, and Branch Assignment are configured before registration.
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

        </div>
    );
}

// KRA Sync Form Component
interface KraSyncFormProps {
    customer: CustomerResponseDto;
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