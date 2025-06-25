import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    ArrowLeft,
    CreditCard,
    Upload,
    DollarSign,
    CalendarDays,
    Building2,
    AlertCircle,
    CheckCircle,
    Receipt,
    Banknote,
    Smartphone,
    Building,
    FileText,
    Package,
    Users,
    Loader2,
    Mail,
    Phone,
    Globe
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label as UILabel } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { formatSubscriptionCurrency } from '@/utils/subscription-currency';
import { subscriptionService } from '@/services/sdk';
import { toast } from 'sonner';
import { format, addMonths, addYears } from 'date-fns';

const paymentSchema = z.object({
    amount: z.number().min(0.01, 'Amount must be greater than 0'),
    paymentType: z.enum(['DIRECT_DEPOSIT', 'CREDIT_CARD', 'BANK_TRANSFER', 'MOBILE_MONEY', 'PAYPAL', 'OTHER']),
    paymentReference: z.string().optional(),
    paymentDate: z.string().optional(),
    description: z.string().optional(),
    notes: z.string().optional(),
    proofOfPaymentUrl: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface MerchantSubscription {
    id: string;
    status: string;
    subscriptionPlan: {
        id: string;
        name: string;
        description?: string;
        basePrice: number;
        devicePrice?: number;
        freeDevices?: number;
        taxIntegrationPrice?: number;
        currency: string;
        billingCycle: 'MONTHLY' | 'YEARLY';
        features?: string[];
        maxDevices?: number;
    };
    deviceCount?: number;
    nextBillingDate: string;
    lastBillingDate?: string;
    currentCost: number;
    merchant: {
        id: string;
        name: string;
        contactEmail: string;
        currency: string;
        currencySymbol: string;
        country?: string;
        phone?: string;
        address?: string;
    };
}

const paymentTypeOptions = [
    { value: 'DIRECT_DEPOSIT', label: 'Direct Deposit', icon: Banknote },
    { value: 'BANK_TRANSFER', label: 'Bank Transfer', icon: Building2 },
    { value: 'MOBILE_MONEY', label: 'Mobile Money', icon: Smartphone },
    { value: 'CREDIT_CARD', label: 'Credit Card', icon: CreditCard },
    { value: 'OTHER', label: 'Other', icon: Receipt },
];

export default function CreatePaymentPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [subscription, setSubscription] = useState<MerchantSubscription | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [paymentPeriod, setPaymentPeriod] = useState<{ start: string; end: string; label: string } | null>(null);

    const form = useForm<PaymentFormData>({
        resolver: zodResolver(paymentSchema),
        defaultValues: {
            amount: 0,
            paymentType: 'DIRECT_DEPOSIT',
            paymentReference: '',
            paymentDate: format(new Date(), 'yyyy-MM-dd'),
            description: '',
            notes: '',
            proofOfPaymentUrl: '',
        }
    });

    // Load subscription data
    useEffect(() => {
        const loadSubscriptionData = async () => {
            try {
                setLoading(true);
                const data = await subscriptionService.getMySubscription();
                setSubscription(data);

                // Pre-populate amount
                form.setValue('amount', data.currentCost);

                // Calculate payment period
                const period = calculatePaymentPeriod(data);
                setPaymentPeriod(period);

                // Set default description
                form.setValue('description', `${period.label} subscription payment for ${data.subscriptionPlan.name}`);
            } catch (error) {
                console.error('Failed to load subscription:', error);
                toast.error('Failed to load subscription details');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            loadSubscriptionData();
        }
    }, [user, form]);

    const calculatePaymentPeriod = (subscription: MerchantSubscription): { start: string; end: string; label: string } => {
        const plan = subscription.subscriptionPlan;
        const nextBilling = new Date(subscription.nextBillingDate);
        const lastBilling = subscription.lastBillingDate ? new Date(subscription.lastBillingDate) : null;

        let periodStart: Date;
        let periodEnd: Date;

        if (lastBilling) {
            // Payment for the upcoming billing period
            periodStart = lastBilling;
            periodEnd = nextBilling;
        } else {
            // First payment - calculate from next billing date backwards
            if (plan.billingCycle === 'YEARLY') {
                periodStart = addYears(nextBilling, -1);
                periodEnd = nextBilling;
            } else {
                // Default to monthly if billingCycle is undefined or not yearly
                periodStart = addMonths(nextBilling, -1);
                periodEnd = nextBilling;
            }
        }

        const label = plan.billingCycle === 'YEARLY' ? 'Annual' : 'Monthly';

        return {
            start: format(periodStart, 'yyyy-MM-dd'),
            end: format(periodEnd, 'yyyy-MM-dd'),
            label
        };
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setUploadedFile(file);
            // In a real implementation, you would upload to Firebase Storage here
            // and set the URL in the form
            const mockUrl = `https://storage.googleapis.com/proof-${Date.now()}.jpg`;
            form.setValue('proofOfPaymentUrl', mockUrl);
            toast.success('Proof of payment uploaded successfully');
        }
    };

    const onSubmit = async (data: PaymentFormData) => {
        if (!subscription) {
            toast.error('Subscription not found');
            return;
        }

        setSubmitting(true);
        try {
            await subscriptionService.createPayment(data);
            toast.success('Payment submitted successfully and is pending admin approval');
            navigate('/subscription');
        } catch (error) {
            console.error('Error creating payment:', error);
            toast.error('Failed to create payment');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto py-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading subscription details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!subscription) {
        return (
            <div className="container mx-auto py-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Subscription Found</h3>
                        <p className="text-muted-foreground mb-4">You don't have an active subscription.</p>
                        <Button onClick={() => navigate('/subscription')}>Contact Support</Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/subscription')}
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Subscription
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Receipt className="h-8 w-8 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Make Subscription Payment</h1>
                    <p className="text-muted-foreground">Submit your subscription payment for admin approval</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Payment Form */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Payment Details</CardTitle>
                        <CardDescription>
                            Fill in your payment information. All payments require admin approval.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                {/* Subscription Info Display */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Subscription Plan</label>
                                        <p className="font-medium">{subscription.subscriptionPlan.name}</p>
                                        {subscription.subscriptionPlan.description && (
                                            <p className="text-sm text-muted-foreground">{subscription.subscriptionPlan.description}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Billing Cycle</label>
                                        <p className="font-medium capitalize">{subscription.subscriptionPlan.billingCycle?.toLowerCase() || 'monthly'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Payment Amount</label>
                                        <p className="font-bold text-lg">
                                            {formatSubscriptionCurrency(subscription.currentCost, subscription)}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Payment Period</label>
                                        <p className="font-medium">
                                            {paymentPeriod && `${format(new Date(paymentPeriod.start), 'MMM dd, yyyy')} - ${format(new Date(paymentPeriod.end), 'MMM dd, yyyy')}`}
                                        </p>
                                    </div>
                                </div>

                                <Separator />

                                {/* Amount */}
                                <FormField
                                    control={form.control}
                                    name="amount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Payment Amount *</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        placeholder="0.00"
                                                        className="pl-9"
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormDescription>
                                                Recommended amount: {formatSubscriptionCurrency(subscription.currentCost, subscription)}
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Payment Type */}
                                <FormField
                                    control={form.control}
                                    name="paymentType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Payment Method *</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select payment method" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {paymentTypeOptions.map((option) => {
                                                        const Icon = option.icon;
                                                        return (
                                                            <SelectItem key={option.value} value={option.value}>
                                                                <div className="flex items-center gap-2">
                                                                    <Icon className="h-4 w-4" />
                                                                    {option.label}
                                                                </div>
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Payment Reference */}
                                <FormField
                                    control={form.control}
                                    name="paymentReference"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Payment Reference</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Transaction ID, confirmation number, etc."
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Reference number or ID from the payment system
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Payment Date */}
                                <FormField
                                    control={form.control}
                                    name="paymentDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Payment Date</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <CalendarDays className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        type="date"
                                                        className="pl-9"
                                                        {...field}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormDescription>
                                                When was this payment made? Leave blank for current date.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Proof of Payment Upload */}
                                <div className="space-y-2">
                                    <UILabel>Proof of Payment</UILabel>
                                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                                        <div className="text-center">
                                            <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                            <div className="text-sm">
                                                <label className="cursor-pointer text-primary hover:underline">
                                                    Click to upload
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*,.pdf"
                                                        onChange={handleFileUpload}
                                                    />
                                                </label>
                                                <span className="text-muted-foreground"> or drag and drop</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                PNG, JPG, PDF up to 10MB
                                            </p>
                                            {uploadedFile && (
                                                <div className="mt-3 flex items-center justify-center gap-2 text-green-600">
                                                    <CheckCircle className="h-4 w-4" />
                                                    <span className="text-sm">{uploadedFile.name}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Upload a screenshot or photo of your payment receipt
                                    </p>
                                </div>

                                {/* Description */}
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Payment description..."
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Notes */}
                                <FormField
                                    control={form.control}
                                    name="notes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Additional Notes</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Any additional information about this payment..."
                                                    className="resize-none"
                                                    rows={3}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Submit Buttons */}
                                <div className="flex gap-3">
                                    <Button type="submit" disabled={submitting}>
                                        {submitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                <Receipt className="mr-2 h-4 w-4" />
                                                Submit Payment
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => navigate('/subscription')}
                                        disabled={submitting}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                {/* Subscription Info Sidebar */}
                <div className="space-y-4">
                    {/* Business Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Business Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Business Name</label>
                                <p className="text-sm font-medium">{subscription.merchant.name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Contact Email</label>
                                <p className="text-sm flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    {subscription.merchant.contactEmail}
                                </p>
                            </div>
                            {subscription.merchant.phone && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                                    <p className="text-sm flex items-center gap-1">
                                        <Phone className="h-3 w-3" />
                                        {subscription.merchant.phone}
                                    </p>
                                </div>
                            )}
                            {subscription.merchant.country && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Country</label>
                                    <p className="text-sm flex items-center gap-1">
                                        <Globe className="h-3 w-3" />
                                        {subscription.merchant.country}
                                    </p>
                                </div>
                            )}
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Currency</label>
                                <p className="text-sm">{subscription.merchant.currency} ({subscription.merchant.currencySymbol})</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Subscription Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5" />
                                Subscription Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Plan</label>
                                    <p className="text-sm font-medium">{subscription.subscriptionPlan.name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                                    <div className="flex items-center gap-1">
                                        <div className={`w-2 h-2 rounded-full ${subscription.status === 'ACTIVE' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                        <p className="text-sm capitalize">{subscription.status?.toLowerCase() || 'unknown'}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Payment Amount</label>
                                <p className="text-lg font-bold text-green-600">
                                    {formatSubscriptionCurrency(subscription.currentCost, subscription)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Per {subscription.subscriptionPlan.billingCycle?.toLowerCase() || 'monthly'}
                                </p>
                            </div>

                            {paymentPeriod && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Payment Period</label>
                                    <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-md">
                                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                            {paymentPeriod.label} Payment
                                        </p>
                                        <p className="text-xs text-blue-700 dark:text-blue-300">
                                            {format(new Date(paymentPeriod.start), 'MMM dd, yyyy')} - {format(new Date(paymentPeriod.end), 'MMM dd, yyyy')}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="pt-2 border-t">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Base Price:</span>
                                    <span>{subscription.subscriptionPlan.currency} {subscription.subscriptionPlan.basePrice.toFixed(2)}</span>
                                </div>
                                {subscription.deviceCount && subscription.subscriptionPlan.freeDevices && subscription.deviceCount > subscription.subscriptionPlan.freeDevices && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Devices ({subscription.deviceCount - subscription.subscriptionPlan.freeDevices} billable):
                                        </span>
                                        <span>
                                            {subscription.subscriptionPlan.currency} {((subscription.deviceCount - subscription.subscriptionPlan.freeDevices) * (subscription.subscriptionPlan.devicePrice || 0)).toFixed(2)}
                                        </span>
                                    </div>
                                )}
                                {subscription.subscriptionPlan.taxIntegrationPrice && subscription.subscriptionPlan.taxIntegrationPrice > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Tax Integration:</span>
                                        <span>{subscription.subscriptionPlan.currency} {subscription.subscriptionPlan.taxIntegrationPrice.toFixed(2)}</span>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Next Billing Date</label>
                                <p className="text-sm flex items-center gap-1">
                                    <CalendarDays className="h-3 w-3" />
                                    {format(new Date(subscription.nextBillingDate), 'MMM dd, yyyy')}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Alert */}
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            All payments require admin approval. You will receive an email notification once your payment is reviewed.
                        </AlertDescription>
                    </Alert>
                </div>
            </div>
        </div>
    );
} 