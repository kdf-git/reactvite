import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    CreditCard,
    AlertTriangle,
    CheckCircle,
    Clock,
    ChevronRight,
    Calendar,
    Shield,
    Building
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatSubscriptionCurrency } from '@/utils/subscription-currency';
import { subscriptionService } from '@/services/sdk';
import { format } from 'date-fns';

interface SubscriptionStatusCardProps {
    className?: string;
}

interface SubscriptionData {
    status: 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'SUSPENDED' | 'EXPIRED';
    subscriptionPlan: {
        name: string;
        currency?: string;
        taxIntegrationType?: 'NONE' | 'KRA' | 'MALAYSIA_EINVOICE';
        taxIntegrationPrice?: number;
    };
    currentCost: number;
    merchant: {
        currency: string;
        currencySymbol: string;
        country?: string;
    };
    nextBillingDate: string;
    daysUntilNextBilling?: number;
    trialDaysRemaining?: number;
    isTrialActive?: boolean;
}

export function SubscriptionStatusCard({ className }: SubscriptionStatusCardProps) {
    const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadSubscriptionData = async () => {
            try {
                const data = await subscriptionService.getMySubscription();
                setSubscription(data);
            } catch (error) {
                console.error('Error loading subscription:', error);
            } finally {
                setLoading(false);
            }
        };

        loadSubscriptionData();
    }, []);

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return {
                    color: 'bg-green-100 text-green-800',
                    icon: CheckCircle,
                    iconColor: 'text-green-600',
                    bgColor: 'bg-green-50',
                };
            case 'TRIAL':
                return {
                    color: 'bg-blue-100 text-blue-800',
                    icon: Clock,
                    iconColor: 'text-blue-600',
                    bgColor: 'bg-blue-50',
                };
            case 'PAST_DUE':
                return {
                    color: 'bg-orange-100 text-orange-800',
                    icon: AlertTriangle,
                    iconColor: 'text-orange-600',
                    bgColor: 'bg-orange-50',
                };
            case 'SUSPENDED':
            case 'EXPIRED':
                return {
                    color: 'bg-red-100 text-red-800',
                    icon: AlertTriangle,
                    iconColor: 'text-red-600',
                    bgColor: 'bg-red-50',
                };
            default:
                return {
                    color: 'bg-gray-100 text-gray-800',
                    icon: Clock,
                    iconColor: 'text-gray-600',
                    bgColor: 'bg-gray-50',
                };
        }
    };

    const getTaxIntegrationBadge = (type?: string) => {
        switch (type) {
            case 'KRA':
                return (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <Shield className="mr-1 h-3 w-3" />
                        Kenya (KRA)
                    </Badge>
                );
            case 'MALAYSIA_EINVOICE':
                return (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        <Building className="mr-1 h-3 w-3" />
                        Malaysia E-Invoice
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline" className="text-muted-foreground">
                        No Tax Integration
                    </Badge>
                );
        }
    };

    if (loading) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Subscription Status
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="animate-pulse space-y-3">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-4 bg-muted rounded w-1/2"></div>
                        <div className="h-8 bg-muted rounded"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!subscription) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Subscription Status
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-4">
                        <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No subscription found</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const statusConfig = getStatusConfig(subscription.status);
    const StatusIcon = statusConfig.icon;

    return (
        <Card className={className}>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Subscription Status
                    </div>
                    <Badge className={statusConfig.color}>
                        {subscription.status}
                    </Badge>
                </CardTitle>
                <CardDescription className="space-y-2">
                    <span>{subscription.subscriptionPlan.name}</span>
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Status Alert */}
                {subscription.status === 'PAST_DUE' && (
                    <div className={`flex items-center gap-2 p-3 rounded-lg ${statusConfig.bgColor}`}>
                        <StatusIcon className={`h-4 w-4 ${statusConfig.iconColor}`} />
                        <span className="text-sm font-medium">Payment overdue - action required</span>
                    </div>
                )}

                {subscription.isTrialActive && subscription.trialDaysRemaining && (
                    <div className={`flex items-center gap-2 p-3 rounded-lg ${statusConfig.bgColor}`}>
                        <StatusIcon className={`h-4 w-4 ${statusConfig.iconColor}`} />
                        <span className="text-sm font-medium">
                            {subscription.trialDaysRemaining} days left in trial
                        </span>
                    </div>
                )}

                {/* Tax Integration Status for Kenya */}
                {subscription.merchant.country === 'KE' && subscription.subscriptionPlan.taxIntegrationType === 'KRA' && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
                        <Shield className="h-4 w-4 text-green-600" />
                        <div className="flex-1">
                            <span className="text-sm font-medium text-green-900">KRA Tax Integration Active</span>
                            <p className="text-xs text-green-700">VSCU compliance enabled for Kenya Revenue Authority</p>
                        </div>
                    </div>
                )}

                {/* Tax Integration Status for Malaysia */}
                {subscription.merchant.country === 'MY' && subscription.subscriptionPlan.taxIntegrationType === 'MALAYSIA_EINVOICE' && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200">
                        <Building className="h-4 w-4 text-blue-600" />
                        <div className="flex-1">
                            <span className="text-sm font-medium text-blue-900">Malaysia E-Invoice Integration Active</span>
                            <p className="text-xs text-blue-700">Digital invoice compliance enabled for Malaysia Revenue Authority</p>
                        </div>
                    </div>
                )}

                {/* Subscription Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-muted-foreground">Monthly Cost</p>
                        <p className="font-semibold">
                            {formatSubscriptionCurrency(subscription.currentCost, subscription)}
                        </p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Next Billing</p>
                        <p className="font-semibold">
                            {format(new Date(subscription.nextBillingDate), 'MMM dd')}
                        </p>
                    </div>
                </div>

                {/* Tax Integration Cost Breakdown */}
                {subscription.subscriptionPlan.taxIntegrationType &&
                    subscription.subscriptionPlan.taxIntegrationType !== 'NONE' &&
                    subscription.subscriptionPlan.taxIntegrationPrice &&
                    subscription.subscriptionPlan.taxIntegrationPrice > 0 && (
                        <div className="text-xs text-muted-foreground border-t pt-2">
                            <div className="flex justify-between">
                                <span>Tax Integration Fee:</span>
                                <span>{subscription.merchant.currencySymbol}{subscription.subscriptionPlan.taxIntegrationPrice}/month</span>
                            </div>
                        </div>
                    )}

                {/* Billing Progress */}
                {subscription.status === 'ACTIVE' && subscription.daysUntilNextBilling !== undefined && (
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                            <span>Next billing in {subscription.daysUntilNextBilling} days</span>
                            <span>{Math.round((30 - subscription.daysUntilNextBilling) / 30 * 100)}%</span>
                        </div>
                        <Progress
                            value={Math.max(0, 100 - (subscription.daysUntilNextBilling / 30) * 100)}
                            className="h-2"
                        />
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                    {subscription.status === 'PAST_DUE' ? (
                        <Button size="sm" className="flex-1" asChild>
                            <Link to="/subscription/payments/create">
                                <CreditCard className="mr-2 h-3 w-3" />
                                Make Payment
                            </Link>
                        </Button>
                    ) : (
                        <Button variant="outline" size="sm" className="flex-1" asChild>
                            <Link to="/subscription">
                                Manage Subscription
                                <ChevronRight className="ml-2 h-3 w-3" />
                            </Link>
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
} 