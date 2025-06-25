import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    CreditCard,
    Calendar,
    AlertTriangle,
    CheckCircle,
    Clock,
    DollarSign,
    Package,
    Users,
    Building,
    Plus,
    Receipt,
    AlertCircle,
    TrendingUp,
    Zap,
    Shield,
    Settings
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { formatSubscriptionCurrency } from '@/utils/subscription-currency';
import { subscriptionService } from '@/services/sdk';
import { format, differenceInDays } from 'date-fns';
import { toast } from 'sonner';

interface SubscriptionPlan {
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
}

interface MerchantSubscription {
    id: string;
    status: 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'SUSPENDED' | 'EXPIRED';
    billingCycle: 'MONTHLY' | 'YEARLY';
    startDate: string;
    endDate?: string;
    trialEndDate?: string;
    nextBillingDate: string;
    deviceCount?: number;
    subscriptionPlan: SubscriptionPlan;
    merchant: {
        id: string;
        name: string;
        contactEmail: string;
        currency: string;
        currencySymbol: string;
        country: string;
    };
    invoices?: {
        id: string;
        invoiceNumber: string;
        totalAmount: number;
        currency: string;
        status: string;
        dueDate: string;
        createdAt: string;
    }[];
    currentCost: number;
    daysUntilNextBilling?: number;
    isTrialActive?: boolean;
    trialDaysRemaining?: number;
}

interface SubscriptionPayment {
    id: string;
    paymentNumber: string;
    amount: number;
    currency: string;
    paymentType: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'FAILED';
    paymentReference?: string;
    paymentDate?: string;
    description: string;
    reviewedByUser?: {
        displayName: string;
    };
    reviewNotes?: string;
    createdAt: string;
}

export default function SubscriptionPage() {
    const { user } = useAuth();
    const [subscription, setSubscription] = useState<MerchantSubscription | null>(null);
    const [payments, setPayments] = useState<SubscriptionPayment[]>([]);
    const [loading, setLoading] = useState(true);
    const [formattedCost, setFormattedCost] = useState<string>('');
    const [formattedPayments, setFormattedPayments] = useState<{ [key: string]: string }>({});
    const navigate = useNavigate();

    // Load subscription data from API
    useEffect(() => {
        const loadSubscriptionData = async () => {
            try {
                setLoading(true);

                // Load subscription and payments concurrently
                const [subscriptionData, paymentsData] = await Promise.allSettled([
                    subscriptionService.getMySubscription(),
                    subscriptionService.getMyPayments()
                ]);

                if (subscriptionData.status === 'fulfilled') {
                    setSubscription(subscriptionData.value);
                } else {
                    console.error('Failed to load subscription:', subscriptionData.reason);
                    toast.error('Failed to load subscription details');
                }

                if (paymentsData.status === 'fulfilled') {
                    setPayments(paymentsData.value);
                } else {
                    console.error('Failed to load payments:', paymentsData.reason);
                    toast.error('Failed to load payment history');
                }

            } catch (error) {
                console.error('Error loading subscription data:', error);
                toast.error('Failed to load subscription data');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            loadSubscriptionData();
        }
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading subscription details...</p>
                </div>
            </div>
        );
    }

    if (!subscription) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Subscription Found</h3>
                    <p className="text-muted-foreground mb-4">You don't have an active subscription.</p>
                    <Button>Contact Support</Button>
                </div>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-100 text-green-800';
            case 'TRIAL': return 'bg-blue-100 text-blue-800';
            case 'PAST_DUE': return 'bg-orange-100 text-orange-800';
            case 'SUSPENDED': return 'bg-red-100 text-red-800';
            case 'EXPIRED': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'bg-green-100 text-green-800';
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'REJECTED': return 'bg-red-100 text-red-800';
            case 'COMPLETED': return 'bg-green-100 text-green-800';
            case 'FAILED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Subscription Management</h1>
                    <p className="text-muted-foreground">
                        Manage your subscription plan and payment history
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" asChild>
                        <Link to="/subscription/payments/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Make Payment
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Status Alerts */}
            {subscription.status === 'PAST_DUE' && (
                <Alert className="border-orange-200 bg-orange-50">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Payment Overdue</AlertTitle>
                    <AlertDescription>
                        Your subscription payment is overdue. Please make a payment to avoid service interruption.
                    </AlertDescription>
                </Alert>
            )}

            {subscription.status === 'TRIAL' && subscription.trialDaysRemaining && subscription.trialDaysRemaining > 0 && (
                <Alert className="border-blue-200 bg-blue-50">
                    <Clock className="h-4 w-4" />
                    <AlertTitle>Trial Period Active</AlertTitle>
                    <AlertDescription>
                        You have {subscription.trialDaysRemaining} days remaining in your trial period.
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Subscription Overview */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>Current Subscription</span>
                            <Badge className={getStatusColor(subscription.status)}>
                                {subscription.status}
                            </Badge>
                        </CardTitle>
                        <CardDescription>
                            {subscription.subscriptionPlan.name}{subscription.subscriptionPlan.description ? ` - ${subscription.subscriptionPlan.description}` : ''}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Plan Details */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Monthly Cost</label>
                                <p className="text-lg font-semibold">
                                    {formatSubscriptionCurrency(subscription.currentCost, subscription)}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Billing Cycle</label>
                                <p className="text-lg font-semibold">
                                    {subscription.billingCycle === 'MONTHLY' ? 'Monthly' : 'Yearly'}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Devices</label>
                                <p className="text-lg font-semibold">
                                    {subscription.deviceCount || 0} / {subscription.subscriptionPlan.maxDevices || 'Unlimited'}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Next Billing</label>
                                <p className="text-lg font-semibold">
                                    {format(new Date(subscription.nextBillingDate), 'MMM dd')}
                                </p>
                            </div>
                        </div>

                        {/* Billing Progress */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Next billing in {subscription.daysUntilNextBilling || 0} days</span>
                                <span>{format(new Date(subscription.nextBillingDate), 'MMM dd, yyyy')}</span>
                            </div>
                            <Progress
                                value={Math.max(0, 100 - ((subscription.daysUntilNextBilling || 0) / 30) * 100)}
                                className="h-2"
                            />
                        </div>

                        {/* Features */}
                        <div>
                            <h4 className="font-medium mb-3">Plan Features</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {subscription.subscriptionPlan.features && subscription.subscriptionPlan.features.length > 0 ? (
                                    subscription.subscriptionPlan.features.map((feature, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                            <span className="text-sm">{feature}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground col-span-2">
                                        Feature information not available
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button className="w-full" asChild>
                            <Link to="/subscription/payments/create">
                                <CreditCard className="mr-2 h-4 w-4" />
                                Make Payment
                            </Link>
                        </Button>
                        <Button variant="outline" className="w-full" asChild>
                            <Link to="/subscription/invoices">
                                <Receipt className="mr-2 h-4 w-4" />
                                View Invoices
                            </Link>
                        </Button>
                        <Button variant="outline" className="w-full" asChild>
                            <Link to="/devices">
                                <Package className="mr-2 h-4 w-4" />
                                Manage Devices
                            </Link>
                        </Button>
                        <Button variant="outline" className="w-full">
                            <Settings className="mr-2 h-4 w-4" />
                            Upgrade Plan
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Payments */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Payments</CardTitle>
                    <CardDescription>
                        Your payment history and status updates
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {payments.length === 0 ? (
                        <div className="text-center py-8">
                            <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No Payments Yet</h3>
                            <p className="text-muted-foreground mb-4">Make your first subscription payment to get started.</p>
                            <Button asChild>
                                <Link to="/subscription/payments/create">
                                    Make Payment
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {payments.map((payment) => (
                                <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => navigate(`/subscription/payments/${payment.id}`)}>
                                    <div className="flex items-center space-x-4">
                                        <div className="p-2 rounded-full bg-blue-50">
                                            <CreditCard className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium">{payment.paymentNumber}</h4>
                                            <p className="text-sm text-muted-foreground">
                                                {payment.description}
                                            </p>
                                            {payment.paymentReference && (
                                                <p className="text-xs text-muted-foreground">
                                                    Ref: {payment.paymentReference}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">
                                            {formatSubscriptionCurrency(
                                                payment.amount,
                                                {
                                                    subscriptionPlan: { currency: payment.currency },
                                                    merchant: { currency: payment.currency }
                                                }
                                            )}
                                        </p>
                                        <Badge className={getPaymentStatusColor(payment.status)}>
                                            {payment.status}
                                        </Badge>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {format(new Date(payment.createdAt), 'MMM dd, yyyy')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            <div className="pt-4 border-t">
                                <Button variant="outline" className="w-full" asChild>
                                    <Link to="/subscription/payments">
                                        View All Payments
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
} 