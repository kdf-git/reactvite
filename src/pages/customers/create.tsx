import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
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
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useMerchantSettings } from '@/hooks/useMerchantSettings';
import { customersService, branchesService } from '@/services/sdk';
import type { CreateCustomerDto, BranchResponseDto } from '@/lib/sdk';

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

export default function CreateCustomerPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const merchantSettings = useMerchantSettings();
    const [formData, setFormData] = useState<CustomerFormData>(initialFormData);
    const [loading, setLoading] = useState(false);
    const [branches, setBranches] = useState<BranchResponseDto[]>([]);

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

    // Load branches
    useEffect(() => {
        const loadBranches = async () => {
            try {
                const merchantId = getMerchantId();
                if (!merchantId) return;

                const branchesData = await branchesService.branchControllerFindAll(merchantId);
                setBranches(branchesData);

                // Set default branch if only one exists
                if (branchesData.length === 1) {
                    setFormData(prev => ({ ...prev, branchId: branchesData[0].id }));
                }
            } catch (error: any) {
                console.error('Failed to load branches:', error);
                toast.error('Failed to load branches');
            }
        };

        if (user) {
            loadBranches();
        }
    }, [user]);

    // Handle create customer
    const handleCreateCustomer = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true);

            const merchantId = getMerchantId();
            if (!merchantId) {
                throw new Error('Merchant ID not found');
            }

            const createData: CreateCustomerDto = {
                merchantId,
                name: formData.name,
                contactPerson: formData.contactPerson || undefined,
                email: formData.email || undefined,
                phone: formData.phone,
                address: formData.address || undefined,
                city: formData.city || undefined,
                type: formData.type as any,
                taxIdentifier: formData.taxIdentifier || undefined,
                branchId: formData.branchId || undefined,
                creditLimit: formData.creditLimit || undefined,
                creditBalance: 0,
                notes: formData.notes || undefined,
                isActive: formData.isActive,
                customerCode: formData.customerCode || undefined,
                isLoyaltyEnabled: true,
                loyaltyPoints: 0,
            };

            await customersService.customerControllerCreate(createData);
            toast.success('Customer created successfully');
            navigate('/customers');
        } catch (error: any) {
            console.error('Failed to create customer:', error);
            toast.error(error.message || 'Failed to create customer');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/customers');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={handleCancel}>
                    <ArrowLeft className="h-4 w-4" />
                    Back to Customers
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Create New Customer</h1>
                    <p className="text-muted-foreground">
                        Add a new customer to your database
                    </p>
                </div>
            </div>

            {/* Create Customer Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Customer Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleCreateCustomer} className="space-y-6">
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
                            <Label htmlFor="branch">Branch *</Label>
                            <Select
                                value={formData.branchId || undefined}
                                onValueChange={(value) => setFormData(prev => ({ ...prev, branchId: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select branch" />
                                </SelectTrigger>
                                <SelectContent>
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
                                {loading ? 'Creating...' : 'Create Customer'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
} 