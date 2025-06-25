import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Download, Edit, Package, CheckCircle, Clock, XCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useMerchantSettings, formatCurrency } from '@/hooks/useMerchantSettings';
import { purchaseOrdersService } from '@/services/sdk';
import type { PurchaseOrderResponseDto } from '@/lib/sdk';

interface PurchaseOrder extends PurchaseOrderResponseDto { }

export default function PurchaseOrderViewPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const merchantSettings = useMerchantSettings();
    const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load purchase order details
    const loadPurchaseOrder = async () => {
        if (!id) {
            setError('Purchase order ID not provided');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const data = await purchaseOrdersService.purchaseOrderControllerFindOne(id);
            setPurchaseOrder(data);
        } catch (error: any) {
            console.error('Failed to load purchase order:', error);
            setError(error.message || 'Failed to load purchase order');
            toast.error(error.message || 'Failed to load purchase order');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPurchaseOrder();
    }, [id]);

    // Handle print
    const handlePrint = () => {
        window.print();
    };

    // Format date
    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    // Get status info
    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'DRAFT':
                return { color: 'bg-gray-100 text-gray-800', icon: Edit };
            case 'APPROVED':
                return { color: 'bg-blue-100 text-blue-800', icon: CheckCircle };
            case 'SENT':
                return { color: 'bg-purple-100 text-purple-800', icon: Send };
            case 'RECEIVED':
                return { color: 'bg-green-100 text-green-800', icon: Package };
            case 'PARTIALLY_RECEIVED':
                return { color: 'bg-yellow-100 text-yellow-800', icon: Clock };
            case 'CLOSED':
                return { color: 'bg-green-100 text-green-800', icon: CheckCircle };
            case 'CANCELLED':
                return { color: 'bg-red-100 text-red-800', icon: XCircle };
            default:
                return { color: 'bg-gray-100 text-gray-800', icon: Clock };
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-muted-foreground">Loading purchase order...</p>
                </div>
            </div>
        );
    }

    if (error || !purchaseOrder) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-destructive">{error || 'Purchase order not found'}</p>
                    <Button variant="outline" onClick={() => navigate('/purchase-orders')} className="mt-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Purchase Orders
                    </Button>
                </div>
            </div>
        );
    }

    const statusInfo = getStatusInfo(purchaseOrder.status);
    const StatusIcon = statusInfo.icon;

    return (
        <div className="space-y-6">
            {/* Header - Hidden in print */}
            <div className="flex items-center justify-between print:hidden">
                <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={() => navigate('/purchase-orders')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Purchase Order</h1>
                        <p className="text-muted-foreground">{purchaseOrder.poNumber}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handlePrint}>
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                    </Button>
                    <Button variant="outline" onClick={handlePrint}>
                        <Printer className="mr-2 h-4 w-4" />
                        Print
                    </Button>
                    <Button onClick={() => navigate(`/purchase-orders/edit/${purchaseOrder.id}`)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                    </Button>
                </div>
            </div>

            {/* Purchase Order Document */}
            <Card className="print:shadow-none print:border-none purchase-order-document">
                <CardContent className="p-8">
                    {/* Document Header */}
                    <div className="mb-8">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h1 className="text-3xl font-bold text-primary mb-2">PURCHASE ORDER</h1>
                                <div className="text-lg font-semibold">{purchaseOrder.poNumber}</div>
                            </div>
                            <div className="text-right">
                                <div className="mb-2">
                                    <Badge className={`${statusInfo.color} text-sm px-3 py-1`}>
                                        <StatusIcon className="mr-1 h-4 w-4" />
                                        {purchaseOrder.status.replace('_', ' ')}
                                    </Badge>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Date: {formatDate(purchaseOrder.orderDate)}
                                </div>
                            </div>
                        </div>

                        {/* Company and Vendor Information */}
                        <div className="grid grid-cols-2 gap-8 mb-8">
                            {/* From (Company) */}
                            <div>
                                <h3 className="font-semibold text-lg mb-3 text-primary">From:</h3>
                                <div className="space-y-1">
                                    <div className="font-medium">{user?.merchant?.name || 'Company Name'}</div>
                                    {purchaseOrder.branch && (
                                        <div className="text-sm text-muted-foreground">
                                            {purchaseOrder.branch.name}
                                        </div>
                                    )}
                                    {purchaseOrder.branch?.address && (
                                        <div className="text-sm text-muted-foreground">
                                            {purchaseOrder.branch.address}
                                        </div>
                                    )}
                                    {purchaseOrder.branch?.phone && (
                                        <div className="text-sm text-muted-foreground">
                                            Phone: {purchaseOrder.branch.phone}
                                        </div>
                                    )}
                                    {purchaseOrder.branch?.email && (
                                        <div className="text-sm text-muted-foreground">
                                            Email: {purchaseOrder.branch.email}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* To (Vendor) */}
                            <div>
                                <h3 className="font-semibold text-lg mb-3 text-primary">To:</h3>
                                <div className="space-y-1">
                                    <div className="font-medium">{purchaseOrder.vendor?.name || 'Vendor Name'}</div>
                                    {purchaseOrder.vendor?.contactPerson && (
                                        <div className="text-sm text-muted-foreground">
                                            Contact: {purchaseOrder.vendor.contactPerson}
                                        </div>
                                    )}
                                    {purchaseOrder.vendor?.address && (
                                        <div className="text-sm text-muted-foreground">
                                            {purchaseOrder.vendor.address}
                                        </div>
                                    )}
                                    {purchaseOrder.vendor?.phone && (
                                        <div className="text-sm text-muted-foreground">
                                            Phone: {purchaseOrder.vendor.phone}
                                        </div>
                                    )}
                                    {purchaseOrder.vendor?.email && (
                                        <div className="text-sm text-muted-foreground">
                                            Email: {purchaseOrder.vendor.email}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Order Details */}
                        <div className="grid grid-cols-2 gap-8 mb-8">
                            <div>
                                <h3 className="font-semibold text-lg mb-3 text-primary">Order Details:</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">PO Number:</span>
                                        <span className="font-medium">{purchaseOrder.poNumber}</span>
                                    </div>
                                    {purchaseOrder.referenceNumber && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Reference:</span>
                                            <span className="font-medium">{purchaseOrder.referenceNumber}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Order Date:</span>
                                        <span className="font-medium">{formatDate(purchaseOrder.orderDate)}</span>
                                    </div>
                                    {purchaseOrder.expectedDate && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Expected Date:</span>
                                            <span className="font-medium">{formatDate(purchaseOrder.expectedDate)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-3 text-primary">Payment Terms:</h3>
                                <div className="space-y-2">
                                    {purchaseOrder.paymentTerms && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Terms:</span>
                                            <span className="font-medium">{purchaseOrder.paymentTerms}</span>
                                        </div>
                                    )}
                                    {purchaseOrder.paymentMethod && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Method:</span>
                                            <span className="font-medium">{purchaseOrder.paymentMethod}</span>
                                        </div>
                                    )}
                                    {purchaseOrder.contactPerson && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Contact Person:</span>
                                            <span className="font-medium">{purchaseOrder.contactPerson}</span>
                                        </div>
                                    )}
                                    {purchaseOrder.contactPhone && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Contact Phone:</span>
                                            <span className="font-medium">{purchaseOrder.contactPhone}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Delivery Address */}
                        {purchaseOrder.deliveryAddress && (
                            <div className="mb-8">
                                <h3 className="font-semibold text-lg mb-3 text-primary">Delivery Address:</h3>
                                <div className="text-sm bg-muted p-3 rounded">
                                    {purchaseOrder.deliveryAddress}
                                </div>
                            </div>
                        )}
                    </div>

                    <Separator className="my-8" />

                    {/* Items Table */}
                    <div className="mb-8">
                        <h3 className="font-semibold text-lg mb-4 text-primary">Items Ordered:</h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">#</TableHead>
                                    <TableHead>Item Description</TableHead>
                                    <TableHead className="text-center">Qty</TableHead>
                                    <TableHead className="text-center">Unit</TableHead>
                                    <TableHead className="text-right">Unit Price</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {purchaseOrder.items?.map((item, index) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{index + 1}</TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{item.stockItem?.name || 'Unknown Item'}</div>
                                                {item.description && (
                                                    <div className="text-sm text-muted-foreground">{item.description}</div>
                                                )}
                                                {item.stockItem?.stockCode && (
                                                    <div className="text-xs text-muted-foreground">
                                                        Code: {item.stockItem.stockCode}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">{item.quantity}</TableCell>
                                        <TableCell className="text-center">
                                            {item.stockItem?.unitOfMeasure?.name ||
                                                item.stockItem?.unitOfMeasure?.code || 'Unit'}
                                        </TableCell>
                                        <TableCell className="text-right">{formatCurrency(item.unitCost, merchantSettings)}</TableCell>
                                        <TableCell className="text-right font-medium">
                                            {formatCurrency(item.totalAmount, merchantSettings)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <Separator className="my-8" />

                    {/* Totals */}
                    <div className="flex justify-end mb-8">
                        <div className="w-80">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span>Subtotal:</span>
                                    <span className="font-medium">{formatCurrency(purchaseOrder.subtotalAmount, merchantSettings)}</span>
                                </div>
                                {purchaseOrder.discountAmount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Discount:</span>
                                        <span>-{formatCurrency(purchaseOrder.discountAmount, merchantSettings)}</span>
                                    </div>
                                )}
                                {purchaseOrder.taxAmount > 0 && (
                                    <div className="flex justify-between">
                                        <span>Tax:</span>
                                        <span>{formatCurrency(purchaseOrder.taxAmount, merchantSettings)}</span>
                                    </div>
                                )}
                                {purchaseOrder.shippingAmount > 0 && (
                                    <div className="flex justify-between">
                                        <span>Shipping:</span>
                                        <span>{formatCurrency(purchaseOrder.shippingAmount, merchantSettings)}</span>
                                    </div>
                                )}
                                <Separator />
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total:</span>
                                    <span>{formatCurrency(purchaseOrder.totalAmount, merchantSettings)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notes and Terms */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {purchaseOrder.notes && (
                            <div>
                                <h3 className="font-semibold text-lg mb-3 text-primary">Notes:</h3>
                                <div className="text-sm bg-muted p-3 rounded whitespace-pre-wrap">
                                    {purchaseOrder.notes}
                                </div>
                            </div>
                        )}

                        {purchaseOrder.terms && (
                            <div>
                                <h3 className="font-semibold text-lg mb-3 text-primary">Terms & Conditions:</h3>
                                <div className="text-sm bg-muted p-3 rounded whitespace-pre-wrap">
                                    {purchaseOrder.terms}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="mt-12 pt-8 border-t">
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <h4 className="font-semibold mb-2">Prepared By:</h4>
                                <div className="border-b border-muted-foreground w-48 mb-2"></div>
                                <div className="text-sm text-muted-foreground">Signature & Date</div>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">Approved By:</h4>
                                <div className="border-b border-muted-foreground w-48 mb-2"></div>
                                <div className="text-sm text-muted-foreground">Signature & Date</div>
                            </div>
                        </div>
                    </div>

                    {/* Print Footer */}
                    <div className="mt-8 text-center text-xs text-muted-foreground print:block hidden">
                        <p>This is a computer-generated document. No signature is required.</p>
                        <p>Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 