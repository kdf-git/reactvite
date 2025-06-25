import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    ArrowLeft,
    Receipt,
    Building2,
    DollarSign,
    Calendar,
    User,
    CheckCircle,
    XCircle,
    Clock,
    Download,
    Printer,
    FileText,
    Phone,
    Mail,
    Globe,
    ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { subscriptionService } from '@/services/sdk';
import { format } from 'date-fns';
import { formatSubscriptionCurrency } from '@/utils/subscription-currency';

interface SubscriptionPayment {
    id: string;
    paymentNumber: string;
    amount: number;
    currency: string;
    paymentType: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'FAILED';
    paymentDate?: string;
    paymentReference?: string;
    reviewedAt?: string;
    reviewedByUser?: { displayName: string; email?: string };
    reviewNotes?: string;
    proofOfPaymentUrl?: string;
    description?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
    merchantSubscription?: {
        id: string;
        status: string;
        billingCycle: string;
        startDate: string;
        endDate?: string;
        nextBillingDate?: string;
        deviceCount?: number;
        subscriptionPlan: {
            id: string;
            name: string;
            description?: string;
            basePrice: number;
            currency: string;
            billingCycle?: string;
            features?: any;
            freeDevices?: number;
            devicePrice?: number;
            maxDevices?: number;
            taxIntegrationType?: string;
            taxIntegrationPrice?: number;
            country?: string;
            isActive?: boolean;
        };
    };
    merchant?: {
        id: string;
        name: string;
        contactEmail: string;
        currency: string;
        currencySymbol?: string;
        businessName?: string;
        address?: string;
        phone?: string;
        country?: string;
    };
}

export default function ViewPaymentPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [payment, setPayment] = useState<SubscriptionPayment | null>(null);

    useEffect(() => {
        if (id) {
            loadPayment();
        }
    }, [id]);

    const loadPayment = async () => {
        setLoading(true);
        try {
            // In a real implementation, you would have a getPaymentById endpoint for merchants
            // For now, we'll get all payments and find the specific one
            const payments = await subscriptionService.getMyPayments();
            const foundPayment = payments.find((p: any) => p.id === id);

            if (foundPayment) {
                setPayment(foundPayment);
            } else {
                toast.error('Payment not found');
                navigate('/subscription');
            }
        } catch (error: any) {
            console.error('Error loading payment:', error);
            toast.error('Failed to load payment details');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadProof = async () => {
        if (!payment?.proofOfPaymentUrl) return;

        try {
            window.open(payment.proofOfPaymentUrl, '_blank');
        } catch (error) {
            console.error('Error downloading proof of payment:', error);
            toast.error('Failed to download proof of payment');
        }
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            PENDING: { icon: Clock, className: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Pending Review' },
            APPROVED: { icon: CheckCircle, className: 'bg-green-100 text-green-800 border-green-200', label: 'Approved' },
            REJECTED: { icon: XCircle, className: 'bg-red-100 text-red-800 border-red-200', label: 'Rejected' },
            COMPLETED: { icon: CheckCircle, className: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Completed' },
            FAILED: { icon: XCircle, className: 'bg-red-100 text-red-800 border-red-200', label: 'Failed' }
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
        const IconComponent = config.icon;

        return (
            <Badge variant="outline" className={`${config.className} gap-1`}>
                <IconComponent className="h-3 w-3" />
                {config.label}
            </Badge>
        );
    };

    if (loading) {
        return (
            <div className="container mx-auto py-6">
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading payment details...</p>
                </div>
            </div>
        );
    }

    if (!payment) {
        return (
            <div className="container mx-auto py-6">
                <div className="text-center py-8">Payment not found</div>
            </div>
        );
    }

    return (
        <>
            {/* Print Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        .print-area, .print-area * {
                            visibility: visible;
                        }
                        .print-area {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                        }
                        .no-print {
                            display: none !important;
                        }
                        .page-break {
                            page-break-before: always;
                        }
                        .print-header {
                            margin-bottom: 2rem;
                        }
                        .print-footer {
                            position: fixed;
                            bottom: 0;
                            width: 100%;
                            text-align: center;
                            font-size: 12px;
                            color: #666;
                        }
                        .receipt-container {
                            max-width: 800px;
                            margin: 0 auto;
                            background: white;
                            padding: 2rem;
                        }
                    }
                `
            }} />

            <div className="container mx-auto py-6 space-y-6">
                {/* Action Header - Hidden in Print */}
                <div className="flex items-center justify-between no-print">
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
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={handlePrint}
                            className="gap-2"
                        >
                            <Printer className="h-4 w-4" />
                            Print Receipt
                        </Button>
                        {payment.proofOfPaymentUrl && (
                            <Button
                                variant="outline"
                                onClick={handleDownloadProof}
                                className="gap-2"
                            >
                                <Download className="h-4 w-4" />
                                Download Proof
                            </Button>
                        )}
                    </div>
                </div>

                {/* Professional Receipt */}
                <div className="print-area">
                    <Card className="receipt-container">
                        <CardContent className="p-8">
                            {/* Receipt Header */}
                            <div className="print-header">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="h-16 w-16 bg-primary rounded-lg flex items-center justify-center">
                                            <Receipt className="h-8 w-8 text-white" />
                                        </div>
                                        <div>
                                            <h1 className="text-3xl font-bold text-primary">PAYMENT RECEIPT</h1>
                                            <p className="text-muted-foreground">Kenya Fuel Station System</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold">{payment.paymentNumber}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {format(new Date(), 'MMM dd, yyyy HH:mm')}
                                        </div>
                                    </div>
                                </div>

                                {/* Status Badge */}
                                <div className="flex justify-center mb-6">
                                    <div className="text-center">
                                        {getStatusBadge(payment.status)}
                                        <div className="text-sm text-muted-foreground mt-1">Payment Status</div>
                                    </div>
                                </div>
                            </div>

                            <Separator className="mb-8" />

                            {/* Payment Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                {/* Payment Information */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        <DollarSign className="h-5 w-5" />
                                        Payment Information
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="bg-primary/5 p-4 rounded-lg">
                                            <div className="text-sm text-muted-foreground">Total Amount</div>
                                            <div className="text-3xl font-bold text-primary">
                                                {payment.currency} {payment.amount.toFixed(2)}
                                            </div>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div>
                                                <span className="font-medium">Payment Type:</span>
                                                <Badge variant="outline" className="ml-2">{payment.paymentType}</Badge>
                                            </div>
                                            {payment.paymentReference && (
                                                <div>
                                                    <span className="font-medium">Reference:</span>
                                                    <div className="text-muted-foreground font-mono bg-muted p-2 rounded mt-1">
                                                        {payment.paymentReference}
                                                    </div>
                                                </div>
                                            )}
                                            {payment.paymentDate && (
                                                <div>
                                                    <span className="font-medium">Payment Date:</span>
                                                    <div className="text-muted-foreground">
                                                        {format(new Date(payment.paymentDate), 'MMMM dd, yyyy')}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Transaction Details */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Transaction Details</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="font-medium">Transaction ID:</span>
                                            <span className="text-muted-foreground">{payment.id}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-medium">Created:</span>
                                            <span className="text-muted-foreground">
                                                {format(new Date(payment.createdAt), 'MMM dd, yyyy HH:mm')}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-medium">Last Updated:</span>
                                            <span className="text-muted-foreground">
                                                {format(new Date(payment.updatedAt), 'MMM dd, yyyy HH:mm')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Separator className="mb-8" />

                            {/* Subscription Details */}
                            {payment.merchantSubscription && (
                                <>
                                    <div className="mb-8">
                                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                            <DollarSign className="h-5 w-5" />
                                            Subscription & Plan Details
                                        </h3>
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                                            <div className="space-y-6">
                                                {/* Plan Overview */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <h4 className="font-semibold text-blue-900 mb-3">Plan Information</h4>
                                                        <div className="space-y-3 text-sm">
                                                            <div className="bg-blue-100 p-3 rounded-md">
                                                                <div className="font-semibold text-blue-900 text-lg">{payment.merchantSubscription.subscriptionPlan.name}</div>
                                                                {payment.merchantSubscription.subscriptionPlan.description && (
                                                                    <div className="text-blue-700 mt-1">{payment.merchantSubscription.subscriptionPlan.description}</div>
                                                                )}
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <div>
                                                                    <span className="font-medium text-blue-900">Plan Price:</span>
                                                                    <div className="text-blue-700 font-semibold text-lg">
                                                                        {payment.merchantSubscription.subscriptionPlan.currency} {payment.merchantSubscription.subscriptionPlan.basePrice?.toFixed(2)}
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <span className="font-medium text-blue-900">Billing Cycle:</span>
                                                                    <div>
                                                                        <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                                                            {payment.merchantSubscription.subscriptionPlan.billingCycle}
                                                                        </Badge>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <h4 className="font-semibold text-blue-900 mb-3">Subscription Period</h4>
                                                        <div className="space-y-3 text-sm">
                                                            <div className="bg-blue-100 p-3 rounded-md">
                                                                <div className="grid grid-cols-1 gap-2">
                                                                    <div>
                                                                        <span className="font-medium text-blue-900">Status:</span>
                                                                        <Badge variant="outline" className="ml-2 bg-green-100 text-green-800">
                                                                            {payment.merchantSubscription.status}
                                                                        </Badge>
                                                                    </div>
                                                                    <div>
                                                                        <span className="font-medium text-blue-900">Period:</span>
                                                                        <div className="text-blue-700 font-medium">
                                                                            {format(new Date(payment.merchantSubscription.startDate), 'MMM dd, yyyy')}
                                                                            {payment.merchantSubscription.endDate && (
                                                                                <> - {format(new Date(payment.merchantSubscription.endDate), 'MMM dd, yyyy')}</>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    {payment.merchantSubscription.nextBillingDate && (
                                                                        <div>
                                                                            <span className="font-medium text-blue-900">Next Billing:</span>
                                                                            <div className="text-blue-700 font-medium">
                                                                                {format(new Date(payment.merchantSubscription.nextBillingDate), 'MMM dd, yyyy')}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Plan Features & Details */}
                                                <div>
                                                    <h4 className="font-semibold text-blue-900 mb-3">Plan Features & Details</h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {/* Plan Configuration */}
                                                        <div>
                                                            <h5 className="font-medium text-blue-800 mb-2">Plan Configuration</h5>
                                                            <div className="bg-white border border-blue-200 rounded p-3">
                                                                <div className="space-y-2 text-sm">
                                                                    {payment.merchantSubscription.subscriptionPlan.freeDevices !== undefined && (
                                                                        <div className="flex justify-between">
                                                                            <span className="text-blue-700">Free Devices:</span>
                                                                            <span className="font-semibold text-blue-900">{payment.merchantSubscription.subscriptionPlan.freeDevices}</span>
                                                                        </div>
                                                                    )}
                                                                    {payment.merchantSubscription.subscriptionPlan.devicePrice !== undefined && (
                                                                        <div className="flex justify-between">
                                                                            <span className="text-blue-700">Additional Device Price:</span>
                                                                            <span className="font-semibold text-blue-900">{payment.merchantSubscription.subscriptionPlan.currency} {payment.merchantSubscription.subscriptionPlan.devicePrice?.toFixed(2)}/month</span>
                                                                        </div>
                                                                    )}
                                                                    {payment.merchantSubscription.subscriptionPlan.maxDevices && (
                                                                        <div className="flex justify-between">
                                                                            <span className="text-blue-700">Max Devices:</span>
                                                                            <span className="font-semibold text-blue-900">{payment.merchantSubscription.subscriptionPlan.maxDevices}</span>
                                                                        </div>
                                                                    )}
                                                                    {payment.merchantSubscription.deviceCount !== undefined && (
                                                                        <div className="flex justify-between">
                                                                            <span className="text-blue-700">Current Devices:</span>
                                                                            <span className="font-semibold text-blue-900">{payment.merchantSubscription.deviceCount}</span>
                                                                        </div>
                                                                    )}
                                                                    {payment.merchantSubscription.subscriptionPlan.taxIntegrationType && payment.merchantSubscription.subscriptionPlan.taxIntegrationType !== 'NONE' && (
                                                                        <div className="flex justify-between">
                                                                            <span className="text-blue-700">Tax Integration:</span>
                                                                            <span className="font-semibold text-green-600">{payment.merchantSubscription.subscriptionPlan.taxIntegrationType}</span>
                                                                        </div>
                                                                    )}
                                                                    {payment.merchantSubscription.subscriptionPlan.taxIntegrationPrice !== undefined && payment.merchantSubscription.subscriptionPlan.taxIntegrationPrice > 0 && (
                                                                        <div className="flex justify-between">
                                                                            <span className="text-blue-700">Tax Integration Fee:</span>
                                                                            <span className="font-semibold text-blue-900">{payment.merchantSubscription.subscriptionPlan.currency} {payment.merchantSubscription.subscriptionPlan.taxIntegrationPrice.toFixed(2)}/month</span>
                                                                        </div>
                                                                    )}
                                                                    {payment.merchantSubscription.subscriptionPlan.country && (
                                                                        <div className="flex justify-between">
                                                                            <span className="text-blue-700">Plan Region:</span>
                                                                            <span className="font-semibold text-blue-900">{payment.merchantSubscription.subscriptionPlan.country}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Features List */}
                                                        <div>
                                                            <h5 className="font-medium text-blue-800 mb-2">Included Features</h5>
                                                            <div className="bg-white border border-blue-200 rounded p-3">
                                                                {payment.merchantSubscription.subscriptionPlan.features && Array.isArray(payment.merchantSubscription.subscriptionPlan.features) ? (
                                                                    <ul className="space-y-1 text-sm">
                                                                        {payment.merchantSubscription.subscriptionPlan.features.map((feature, index) => (
                                                                            <li key={index} className="flex items-center gap-2 text-blue-700">
                                                                                <CheckCircle className="h-3 w-3 text-green-600" />
                                                                                {feature}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                ) : (
                                                                    <div className="text-sm text-blue-600">
                                                                        {payment.merchantSubscription.subscriptionPlan.features ?
                                                                            JSON.stringify(payment.merchantSubscription.subscriptionPlan.features) :
                                                                            'No specific features listed'
                                                                        }
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Payment Context */}
                                                <div className="pt-4 border-t border-blue-200">
                                                    <div className="bg-blue-100 p-3 rounded-md">
                                                        <div className="text-sm">
                                                            <span className="font-medium text-blue-900">Payment Coverage:</span>
                                                            <div className="text-blue-700 font-medium mt-1">
                                                                {payment.description || `${payment.merchantSubscription.subscriptionPlan.billingCycle} subscription payment for ${payment.merchantSubscription.subscriptionPlan.name} plan`}
                                                            </div>
                                                            <div className="text-xs text-blue-600 mt-1">
                                                                This payment covers the subscription period and all included features listed above.
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <Separator className="mb-8" />
                                </>
                            )}

                            {/* Business Details (if merchant info is available) */}
                            {payment.merchant && (
                                <>
                                    <div className="mb-8">
                                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                            <Building2 className="h-5 w-5" />
                                            Business Details
                                        </h3>
                                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="font-medium">Business Name:</span>
                                                    <div className="text-gray-700">{payment.merchant.businessName || payment.merchant.name}</div>
                                                </div>
                                                <div>
                                                    <span className="font-medium">Contact Email:</span>
                                                    <div className="text-gray-700 flex items-center gap-1">
                                                        <Mail className="h-3 w-3" />
                                                        {payment.merchant.contactEmail}
                                                    </div>
                                                </div>
                                                {payment.merchant.phone && (
                                                    <div>
                                                        <span className="font-medium">Phone:</span>
                                                        <div className="text-gray-700 flex items-center gap-1">
                                                            <Phone className="h-3 w-3" />
                                                            {payment.merchant.phone}
                                                        </div>
                                                    </div>
                                                )}
                                                {payment.merchant.country && (
                                                    <div>
                                                        <span className="font-medium">Country:</span>
                                                        <div className="text-gray-700 flex items-center gap-1">
                                                            <Globe className="h-3 w-3" />
                                                            {payment.merchant.country}
                                                        </div>
                                                    </div>
                                                )}
                                                {payment.merchant.address && (
                                                    <div className="md:col-span-2">
                                                        <span className="font-medium">Address:</span>
                                                        <div className="text-gray-700">{payment.merchant.address}</div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <Separator className="mb-8" />
                                </>
                            )}

                            {/* Description */}
                            {payment.description && (
                                <>
                                    <div className="mb-8">
                                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                            <FileText className="h-5 w-5" />
                                            Payment Description
                                        </h3>
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <div className="text-sm text-blue-900">
                                                {payment.description}
                                            </div>
                                        </div>
                                    </div>
                                    <Separator className="mb-8" />
                                </>
                            )}

                            {/* Review Information */}
                            {payment.reviewedAt && (
                                <>
                                    <div className="mb-8">
                                        <h3 className="text-lg font-semibold mb-4">Review Information</h3>
                                        <div className="bg-muted/50 p-4 rounded-lg">
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="font-medium">Reviewed By:</span>
                                                    <span className="text-muted-foreground">
                                                        {payment.reviewedByUser?.displayName || 'System Admin'}
                                                    </span>
                                                </div>
                                                {payment.reviewedByUser?.email && (
                                                    <div className="flex justify-between">
                                                        <span className="font-medium">Reviewer Email:</span>
                                                        <span className="text-muted-foreground">{payment.reviewedByUser.email}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between">
                                                    <span className="font-medium">Review Date:</span>
                                                    <span className="text-muted-foreground">
                                                        {format(new Date(payment.reviewedAt), 'MMM dd, yyyy HH:mm')}
                                                    </span>
                                                </div>
                                                {payment.reviewNotes && (
                                                    <div>
                                                        <span className="font-medium">Review Notes:</span>
                                                        <div className="text-muted-foreground bg-muted p-3 rounded mt-1">
                                                            {payment.reviewNotes}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <Separator className="mb-8" />
                                </>
                            )}

                            {/* Proof of Payment Section */}
                            {payment.proofOfPaymentUrl && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-6 print:border-gray-300 print:bg-white">
                                    <h4 className="font-semibold text-green-900 mb-3 print:text-black">Proof of Payment</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-green-800 print:text-gray-600">
                                                    Payment receipt or proof document attached
                                                </p>
                                                <p className="text-xs text-green-600 print:text-gray-500 mt-1">
                                                    This document serves as evidence of payment
                                                </p>
                                            </div>
                                            <div className="flex gap-2 print:hidden">
                                                <a
                                                    href={payment.proofOfPaymentUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                                                >
                                                    <ExternalLink className="h-4 w-4 mr-1" />
                                                    View
                                                </a>
                                                <a
                                                    href={payment.proofOfPaymentUrl}
                                                    download
                                                    className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 text-sm rounded hover:bg-green-200 transition-colors border border-green-300"
                                                >
                                                    <Download className="h-4 w-4 mr-1" />
                                                    Download
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Internal Notes */}
                            {payment.notes && (
                                <>
                                    <Separator className="mb-6" />
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold mb-3">Additional Notes</h3>
                                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-sm">
                                            {payment.notes}
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Footer */}
                            <div className="border-t pt-6 mt-8">
                                <div className="text-center text-sm text-muted-foreground">
                                    <p>This is an official payment receipt from Tracksol System</p>
                                    <p className="mt-1">For inquiries, please contact support with reference number: {payment.paymentNumber}</p>
                                    <p className="mt-2 text-xs">Generated on {format(new Date(), 'MMMM dd, yyyy HH:mm')}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Status Information - Hidden in Print */}
                {payment.status === 'PENDING' && (
                    <Card className="no-print">
                        <CardHeader>
                            <CardTitle>Payment Under Review</CardTitle>
                            <CardDescription>
                                Your payment is currently being reviewed by our admin team
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2 text-yellow-600">
                                <Clock className="h-4 w-4" />
                                <span className="text-sm">
                                    We'll notify you via email once your payment has been reviewed and processed.
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {payment.status === 'REJECTED' && (
                    <Card className="no-print border-red-200">
                        <CardHeader>
                            <CardTitle className="text-red-800">Payment Rejected</CardTitle>
                            <CardDescription>
                                Your payment was not approved. Please see the review notes above for details.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild>
                                <a href="/subscription/payments/create">
                                    Submit New Payment
                                </a>
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {payment.status === 'APPROVED' && (
                    <Card className="no-print border-green-200">
                        <CardHeader>
                            <CardTitle className="text-green-800">Payment Approved</CardTitle>
                            <CardDescription>
                                Your payment has been successfully approved and processed.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2 text-green-600">
                                <CheckCircle className="h-4 w-4" />
                                <span className="text-sm">
                                    Your subscription has been updated and is now active.
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
} 