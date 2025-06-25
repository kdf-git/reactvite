import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Search,
    Filter,
    Download,
    Eye,
    Calendar,
    AlertCircle,
    CheckCircle,
    Clock,
    Database,
    RefreshCw,
    BarChart3,
    Settings,
    RotateCcw
} from 'lucide-react';
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { secureApi } from '@/services/sdk';
import { Separator } from '@/components/ui/separator';

// KRA Audit API Service using the secure API with proper authentication
const kraAuditService = {
    async getLogs(params: any) {
        return secureApi.kraVscu.kraVscuControllerGetAuditLogs(
            params.page,
            params.limit,
            params.deviceId,
            params.branchId,
            params.operation === 'all' ? undefined : params.operation,
            params.success === 'all' ? undefined : (params.success === 'true'),
            params.startDate,
            params.endDate
        );
    },

    async getStatistics(days: number) {
        return secureApi.kraVscu.kraVscuControllerGetAuditStatistics(days);
    },

    async getLogDetails(logId: string) {
        return secureApi.kraVscu.kraVscuControllerGetLogDetails(logId);
    },

    async retrySubmission(logId: string) {
        return secureApi.kraVscu.kraVscuControllerRetryKraSubmission(logId);
    }
};

interface KraLog {
    id: string;
    operation: string;
    endpoint: string;
    method: string;
    success: boolean;
    kraResultCode?: string;
    kraResultMessage?: string;
    durationMs?: number;
    requestStartedAt: string;
    requestEndedAt?: string;
    responseStatus?: number;
    errorMessage?: string;
    requestUrl?: string;
    requestPayload?: any;
    responseBody?: any;
    requestHeaders?: any;
    responseHeaders?: any;
    device?: {
        id: string;
        name: string;
        serialNumber: string;
    };
    branch?: {
        id: string;
        name: string;
        code: string;
    };
}

interface KraStatistics {
    summary: {
        totalCalls: number;
        successfulCalls: number;
        failedCalls: number;
        successRate: number;
        averageDurationMs: number;
    };
    callsByOperation: Array<{
        operation: string;
        _count: { id: number };
    }>;
    callsByDay: Array<{
        date: string;
        count: number;
        successful: number;
        failed: number;
    }>;
}

export default function KraAuditPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    // State management
    const [logs, setLogs] = useState<KraLog[]>([]);
    const [statistics, setStatistics] = useState<KraStatistics | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedLog, setSelectedLog] = useState<KraLog | null>(null);
    const [showLogDetails, setShowLogDetails] = useState(false);
    const [retryingLogId, setRetryingLogId] = useState<string | null>(null);

    // Filter state
    const [filters, setFilters] = useState({
        search: '',
        operation: 'all',
        success: 'all',
        deviceId: '',
        branchId: '',
        startDate: '',
        endDate: '',
        page: 1,
        limit: 50
    });

    // Check if user is a Kenyan merchant
    const isKenyanMerchant = user?.merchant?.country === 'KE';

    // Load data
    const loadData = async () => {
        if (!isKenyanMerchant) return;

        try {
            setLoading(true);
            const [logsResponse, statsResponse] = await Promise.all([
                kraAuditService.getLogs(filters),
                kraAuditService.getStatistics(30)
            ]);

            setLogs(logsResponse.logs || []);
            setStatistics(statsResponse);
        } catch (error: any) {
            console.error('Failed to load KRA audit data:', error);
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user && isKenyanMerchant) {
            loadData();
        } else if (user && !isKenyanMerchant) {
            setLoading(false); // Stop loading for non-Kenyan merchants
        }
    }, [user, isKenyanMerchant, filters]);

    // Handle filter changes
    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    };

    // Handle view log details
    const handleViewDetails = async (log: KraLog) => {
        try {
            const details = await kraAuditService.getLogDetails(log.id);
            setSelectedLog(details || log);
            setShowLogDetails(true);
        } catch (error: any) {
            console.error('Failed to load log details:', error);
            toast.error(getErrorMessage(error));
        }
    };

    // Handle retry submission
    const handleRetry = async (log: KraLog) => {
        if (log.success) {
            toast.error('Cannot retry a successful submission');
            return;
        }

        try {
            setRetryingLogId(log.id);
            const retryResult = await kraAuditService.retrySubmission(log.id);

            if (retryResult.success) {
                toast.success(`Successfully retried ${log.operation}`);
                // Reload the logs to show the new attempt
                await loadData();
            } else {
                toast.error(`Retry failed: ${retryResult.message}`);
            }
        } catch (error: any) {
            console.error('Failed to retry submission:', error);
            toast.error(getErrorMessage(error));
        } finally {
            setRetryingLogId(null);
        }
    };

    // Get status badge
    const getStatusBadge = (log: KraLog) => {
        if (log.success) {
            return (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Success
                </Badge>
            );
        } else {
            return (
                <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Failed
                </Badge>
            );
        }
    };

    // Get KRA result badge
    const getKraResultBadge = (log: KraLog) => {
        if (!log.kraResultCode) return null;

        const isSuccess = log.kraResultCode === '000';
        return (
            <Badge variant={isSuccess ? 'default' : 'destructive'}>
                KRA {log.kraResultCode}
            </Badge>
        );
    };

    // Format duration
    const formatDuration = (ms?: number) => {
        if (!ms) return 'N/A';
        if (ms < 1000) return `${ms}ms`;
        return `${(ms / 1000).toFixed(2)}s`;
    };

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    // Format operation name for display
    const formatOperationName = (operation: string) => {
        const operationMap: Record<string, string> = {
            'INIT_VSCU': 'Device Initialization',
            'SAVE_ITEMS': 'Save Items',
            'SAVE_SALES': 'Sales Transaction',
            'SAVE_PURCHASES': 'Purchase Transaction',
            'SAVE_STOCK_MASTER': 'Stock Master',
            'SAVE_STOCK_ITEMS': 'Stock Items',
            'SAVE_ITEM_COMPOSITION': 'Item Composition (BOM)',
            'UPDATE_IMPORT_ITEMS': 'Import Items Update',
            'SELECT_CODES': 'Get Classification Codes',
            'SELECT_ITEM_CLASS': 'Get Item Classifications',
            'SELECT_CUSTOMER': 'Get Customer Info',
            'SELECT_BRANCHES': 'Get Branches',
            'GET_BRANCHES': 'Get Branches',
            'SELECT_NOTICES': 'Get Notices',
            'GET_NOTICES': 'Get Notices',
            'SAVE_BRANCH_CUSTOMERS': 'Branch Customers',
            'SAVE_BRANCH_USERS': 'Branch Users',
            'SAVE_BRANCH_INSURANCES': 'Branch Insurances',
            'REGISTER_KRA_CUSTOMER': 'Register KRA Customer',
            'SYNC_KRA_CUSTOMER': 'Sync KRA Customer',
            // Legacy operation names for backward compatibility
            'Device Initialization': 'Device Initialization',
            'Save Sales Transaction': 'Sales Transaction',
            'Save Purchase Transaction': 'Purchase Transaction',
            'Save Items': 'Save Items',
            'Get Classification Codes': 'Get Classification Codes',
            'Save Stock Master': 'Stock Master',
            'Save Stock Items': 'Stock Items'
        };

        return operationMap[operation] || operation;
    };

    // Non-Kenyan merchant message
    if (!isKenyanMerchant) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">KRA Audit Logs</h3>
                    <p className="text-muted-foreground mb-4">
                        KRA audit logs are only available for merchants in Kenya.
                    </p>
                    <Button variant="outline" onClick={() => navigate('/dashboard')}>
                        Go to Dashboard
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
                    <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">KRA Audit Logs</h1>
                        <p className="text-muted-foreground">
                            Audit trail of all KRA VSCU API submissions
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={loadData} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="logs" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="logs">Audit Logs</TabsTrigger>
                    <TabsTrigger value="statistics">Statistics</TabsTrigger>
                </TabsList>

                <TabsContent value="logs" className="space-y-6">
                    {/* Statistics Summary Cards */}
                    {statistics && (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
                                    <Database className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{statistics.summary.totalCalls}</div>
                                    <p className="text-xs text-muted-foreground">Last 30 days</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{statistics.summary.successRate.toFixed(1)}%</div>
                                    <p className="text-xs text-muted-foreground">
                                        {statistics.summary.successfulCalls} successful
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Failed Calls</CardTitle>
                                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{statistics.summary.failedCalls}</div>
                                    <p className="text-xs text-muted-foreground">Requires attention</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {formatDuration(statistics.summary.averageDurationMs)}
                                    </div>
                                    <p className="text-xs text-muted-foreground">Response time</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Operations</CardTitle>
                                    <Settings className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{statistics.callsByOperation.length}</div>
                                    <p className="text-xs text-muted-foreground">Different types</p>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Filters */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Filter className="h-5 w-5" />
                                Filters
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="search">Search</Label>
                                    <Input
                                        id="search"
                                        placeholder="Search logs..."
                                        value={filters.search}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Operation</Label>
                                    <Select
                                        value={filters.operation}
                                        onValueChange={(value) => handleFilterChange('operation', value === 'all' ? '' : value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All operations" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All operations</SelectItem>

                                            {/* Core Operations */}
                                            <SelectItem value="INIT_VSCU">Device Initialization</SelectItem>
                                            <SelectItem value="SAVE_SALES">Sales Transaction</SelectItem>
                                            <SelectItem value="SAVE_PURCHASES">Purchase Transaction</SelectItem>
                                            <SelectItem value="SAVE_ITEMS">Save Items</SelectItem>

                                            {/* Stock Operations */}
                                            <SelectItem value="SAVE_STOCK_MASTER">Stock Master</SelectItem>
                                            <SelectItem value="SAVE_STOCK_ITEMS">Stock Items</SelectItem>
                                            <SelectItem value="SAVE_ITEM_COMPOSITION">Item Composition (BOM)</SelectItem>
                                            <SelectItem value="UPDATE_IMPORT_ITEMS">Import Items Update</SelectItem>

                                            {/* Data Retrieval Operations */}
                                            <SelectItem value="SELECT_CODES">Get Classification Codes</SelectItem>
                                            <SelectItem value="SELECT_ITEM_CLASS">Get Item Classifications</SelectItem>
                                            <SelectItem value="SELECT_CUSTOMER">Get Customer Info</SelectItem>
                                            <SelectItem value="SELECT_BRANCHES">Get Branches</SelectItem>
                                            <SelectItem value="GET_BRANCHES">Get Branches</SelectItem>
                                            <SelectItem value="SELECT_NOTICES">Get Notices</SelectItem>
                                            <SelectItem value="GET_NOTICES">Get Notices</SelectItem>

                                            {/* Branch Management Operations */}
                                            <SelectItem value="SAVE_BRANCH_CUSTOMERS">Branch Customers</SelectItem>
                                            <SelectItem value="SAVE_BRANCH_USERS">Branch Users</SelectItem>
                                            <SelectItem value="SAVE_BRANCH_INSURANCES">Branch Insurances</SelectItem>

                                            {/* Customer Management Operations */}
                                            <SelectItem value="REGISTER_KRA_CUSTOMER">Register KRA Customer</SelectItem>
                                            <SelectItem value="SYNC_KRA_CUSTOMER">Sync KRA Customer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <Select
                                        value={filters.success}
                                        onValueChange={(value) => handleFilterChange('success', value === 'all' ? '' : value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All statuses" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All statuses</SelectItem>
                                            <SelectItem value="true">Success</SelectItem>
                                            <SelectItem value="false">Failed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="startDate">Start Date</Label>
                                    <Input
                                        id="startDate"
                                        type="date"
                                        value={filters.startDate}
                                        onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="endDate">End Date</Label>
                                    <Input
                                        id="endDate"
                                        type="date"
                                        value={filters.endDate}
                                        onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>&nbsp;</Label>
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => setFilters({
                                            search: '',
                                            operation: 'all',
                                            success: 'all',
                                            deviceId: '',
                                            branchId: '',
                                            startDate: '',
                                            endDate: '',
                                            page: 1,
                                            limit: 50
                                        })}
                                    >
                                        Clear Filters
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Logs Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Audit Log Entries</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                                    <span>Loading audit logs...</span>
                                </div>
                            ) : logs.length === 0 ? (
                                <div className="text-center py-8">
                                    <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                    <p className="text-muted-foreground">No audit logs found</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Timestamp</TableHead>
                                            <TableHead>Operation</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>KRA Result</TableHead>
                                            <TableHead>Duration</TableHead>
                                            <TableHead>Device/Branch</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {logs.map((log) => (
                                            <TableRow key={log.id}>
                                                <TableCell className="font-mono text-sm">
                                                    {formatDate(log.requestStartedAt)}
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{formatOperationName(log.operation)}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {log.method} {log.endpoint}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(log)}
                                                </TableCell>
                                                <TableCell>
                                                    {getKraResultBadge(log)}
                                                </TableCell>
                                                <TableCell className="font-mono text-sm">
                                                    {formatDuration(log.durationMs)}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        {log.device && (
                                                            <div>{log.device.name}</div>
                                                        )}
                                                        {log.branch && (
                                                            <div className="text-muted-foreground">
                                                                {log.branch.name}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleViewDetails(log)}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        {!log.success && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRetry(log)}
                                                                disabled={retryingLogId === log.id}
                                                                title="Retry failed submission"
                                                            >
                                                                <RotateCcw className={`h-4 w-4 ${retryingLogId === log.id ? 'animate-spin' : ''}`} />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="statistics" className="space-y-6">
                    {statistics && (
                        <>
                            {/* Operations Breakdown */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5" />
                                        Operations Breakdown (Last 30 Days)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {statistics.callsByOperation.map((op) => (
                                            <div key={op.operation} className="flex items-center justify-between">
                                                <span className="font-medium">{formatOperationName(op.operation)}</span>
                                                <Badge variant="secondary">{op._count.id} calls</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Daily Activity */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5" />
                                        Daily Activity
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {statistics.callsByDay.slice(0, 10).map((day) => (
                                            <div key={day.date} className="flex items-center justify-between p-2 border rounded">
                                                <span className="font-medium">{day.date}</span>
                                                <div className="flex gap-2">
                                                    <Badge className="bg-green-100 text-green-800">
                                                        ✓ {day.successful}
                                                    </Badge>
                                                    <Badge className="bg-red-100 text-red-800">
                                                        ✗ {day.failed}
                                                    </Badge>
                                                    <Badge variant="secondary">
                                                        Total: {day.count}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </TabsContent>
            </Tabs>

            {/* Log Details Dialog */}
            <Dialog open={showLogDetails} onOpenChange={setShowLogDetails}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>KRA VSCU Log Details</DialogTitle>
                        <DialogDescription>
                            Detailed information for KRA VSCU API call
                        </DialogDescription>
                    </DialogHeader>

                    {selectedLog && (
                        <Tabs defaultValue="overview" className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="request">Request</TabsTrigger>
                                <TabsTrigger value="response">Response</TabsTrigger>
                                <TabsTrigger value="data">Full Data</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <Label className="text-sm font-medium">Operation</Label>
                                        <p className="text-sm text-muted-foreground">{formatOperationName(selectedLog.operation)}</p>
                                        <p className="text-xs text-muted-foreground mt-1">Raw: {selectedLog.operation}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium">Status</Label>
                                        <div className="mt-1">{getStatusBadge(selectedLog)}</div>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium">Started At</Label>
                                        <p className="text-sm text-muted-foreground font-mono">{formatDate(selectedLog.requestStartedAt)}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium">Duration</Label>
                                        <p className="text-sm text-muted-foreground font-mono">{formatDuration(selectedLog.durationMs)}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium">KRA Result Code</Label>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedLog.kraResultCode || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium">HTTP Status</Label>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedLog.responseStatus || 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                {selectedLog.kraResultMessage && (
                                    <div>
                                        <Label className="text-sm font-medium">KRA Message</Label>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {selectedLog.kraResultMessage}
                                        </p>
                                    </div>
                                )}

                                {selectedLog.errorMessage && (
                                    <div>
                                        <Label className="text-sm font-medium">Error Message</Label>
                                        <p className="text-sm text-red-600 mt-1">
                                            {selectedLog.errorMessage}
                                        </p>
                                    </div>
                                )}

                                {/* Retry Button for Failed Submissions */}
                                {!selectedLog.success && (
                                    <div className="flex justify-start pt-4">
                                        <Button
                                            onClick={() => handleRetry(selectedLog)}
                                            disabled={retryingLogId === selectedLog.id}
                                            className="flex items-center gap-2"
                                        >
                                            <RotateCcw className={`h-4 w-4 ${retryingLogId === selectedLog.id ? 'animate-spin' : ''}`} />
                                            {retryingLogId === selectedLog.id ? 'Retrying...' : 'Retry Submission'}
                                        </Button>
                                    </div>
                                )}

                                {selectedLog.device && (
                                    <>
                                        <Separator />
                                        <div>
                                            <Label className="text-sm font-medium mb-3 block">Device Information</Label>
                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div>
                                                    <Label className="text-xs font-medium text-muted-foreground">Device Name</Label>
                                                    <p className="text-sm">{selectedLog.device.name}</p>
                                                </div>
                                                <div>
                                                    <Label className="text-xs font-medium text-muted-foreground">Serial Number</Label>
                                                    <p className="text-sm">{selectedLog.device.serialNumber}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {selectedLog.branch && (
                                    <>
                                        <Separator />
                                        <div>
                                            <Label className="text-sm font-medium mb-3 block">Branch Information</Label>
                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div>
                                                    <Label className="text-xs font-medium text-muted-foreground">Branch Name</Label>
                                                    <p className="text-sm">{selectedLog.branch.name}</p>
                                                </div>
                                                <div>
                                                    <Label className="text-xs font-medium text-muted-foreground">Branch Code</Label>
                                                    <p className="text-sm">{selectedLog.branch.code}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Show key initialization data in overview */}
                                {selectedLog.operation === 'Device Initialization' && selectedLog.responseBody && selectedLog.responseBody.data && (
                                    <>
                                        <Separator />
                                        <div>
                                            <Label className="text-sm font-medium mb-3 block">Initialization Summary</Label>
                                            <div className="grid gap-4 md:grid-cols-2">
                                                {selectedLog.responseBody.data.tin && (
                                                    <div>
                                                        <Label className="text-xs font-medium text-muted-foreground">TIN</Label>
                                                        <p className="text-sm">{selectedLog.responseBody.data.tin}</p>
                                                    </div>
                                                )}
                                                {selectedLog.responseBody.data.bhfId && (
                                                    <div>
                                                        <Label className="text-xs font-medium text-muted-foreground">Branch ID</Label>
                                                        <p className="text-sm">{selectedLog.responseBody.data.bhfId}</p>
                                                    </div>
                                                )}
                                                {selectedLog.responseBody.data.dvcSrlNo && (
                                                    <div>
                                                        <Label className="text-xs font-medium text-muted-foreground">Device Serial</Label>
                                                        <p className="text-sm">{selectedLog.responseBody.data.dvcSrlNo}</p>
                                                    </div>
                                                )}
                                                {selectedLog.responseBody.data.lastSaleInvcNo && (
                                                    <div>
                                                        <Label className="text-xs font-medium text-muted-foreground">Last Sale Invoice No</Label>
                                                        <p className="text-sm">{selectedLog.responseBody.data.lastSaleInvcNo}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Show key sales/purchase transaction data in overview */}
                                {(selectedLog.operation === 'Save Sales Transaction' || selectedLog.operation === 'Save Purchase Transaction') && selectedLog.responseBody && selectedLog.responseBody.data && (
                                    <>
                                        <Separator />
                                        <div>
                                            <Label className="text-sm font-medium mb-3 block">Transaction Information</Label>
                                            <div className="grid gap-4 md:grid-cols-2">
                                                {selectedLog.responseBody.data.invcNo && (
                                                    <div>
                                                        <Label className="text-xs font-medium text-muted-foreground">Invoice Number</Label>
                                                        <p className="text-sm">{selectedLog.responseBody.data.invcNo}</p>
                                                    </div>
                                                )}
                                                {selectedLog.responseBody.data.intrlData && (
                                                    <div>
                                                        <Label className="text-xs font-medium text-muted-foreground">Internal Data</Label>
                                                        <p className="text-sm">{selectedLog.responseBody.data.intrlData}</p>
                                                    </div>
                                                )}
                                                {selectedLog.responseBody.data.rcptNo && (
                                                    <div>
                                                        <Label className="text-xs font-medium text-muted-foreground">Receipt Number</Label>
                                                        <p className="text-sm">{selectedLog.responseBody.data.rcptNo}</p>
                                                    </div>
                                                )}
                                                {selectedLog.responseBody.data.totAmt && (
                                                    <div>
                                                        <Label className="text-xs font-medium text-muted-foreground">Total Amount</Label>
                                                        <p className="text-sm">{selectedLog.responseBody.data.totAmt}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </TabsContent>

                            <TabsContent value="request" className="space-y-4">
                                <div>
                                    <Label className="text-sm font-medium">Request URL</Label>
                                    <p className="text-sm text-muted-foreground font-mono break-all">
                                        {selectedLog.requestUrl || `${selectedLog.method} ${selectedLog.endpoint}`}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Method</Label>
                                    <p className="text-sm text-muted-foreground">{selectedLog.method}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Endpoint</Label>
                                    <p className="text-sm text-muted-foreground">{selectedLog.endpoint}</p>
                                </div>

                                {selectedLog.requestPayload && (
                                    <div>
                                        <Label className="text-sm font-medium">Request Payload</Label>
                                        <div className="mt-2 p-3 bg-gray-50 rounded-md">
                                            <pre className="text-xs text-gray-800 whitespace-pre-wrap overflow-x-auto">
                                                {JSON.stringify(selectedLog.requestPayload, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                )}

                                {selectedLog.requestHeaders && (
                                    <div>
                                        <Label className="text-sm font-medium">Request Headers</Label>
                                        <div className="mt-2 p-3 bg-gray-50 rounded-md">
                                            <pre className="text-xs text-gray-800 whitespace-pre-wrap overflow-x-auto">
                                                {JSON.stringify(selectedLog.requestHeaders, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="response" className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <Label className="text-sm font-medium">HTTP Status</Label>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedLog.responseStatus || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium">Success</Label>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedLog.success ? 'Yes' : 'No'}
                                        </p>
                                    </div>
                                </div>

                                {(selectedLog.kraResultCode || selectedLog.kraResultMessage) && (
                                    <Separator />
                                )}

                                {selectedLog.kraResultCode && (
                                    <div>
                                        <Label className="text-sm font-medium">KRA Result Code</Label>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedLog.kraResultCode}
                                        </p>
                                    </div>
                                )}

                                {selectedLog.kraResultMessage && (
                                    <div>
                                        <Label className="text-sm font-medium">KRA Result Message</Label>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedLog.kraResultMessage}
                                        </p>
                                    </div>
                                )}

                                {selectedLog.errorMessage && (
                                    <div>
                                        <Label className="text-sm font-medium">Error Message</Label>
                                        <p className="text-sm text-red-600">
                                            {selectedLog.errorMessage}
                                        </p>
                                    </div>
                                )}

                                {selectedLog.responseHeaders && (
                                    <div>
                                        <Label className="text-sm font-medium">Response Headers</Label>
                                        <div className="mt-2 p-3 bg-gray-50 rounded-md">
                                            <pre className="text-xs text-gray-800 whitespace-pre-wrap overflow-x-auto">
                                                {JSON.stringify(selectedLog.responseHeaders, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="data" className="space-y-4">
                                {selectedLog.requestPayload && (
                                    <div>
                                        <Label className="text-sm font-medium">Request Payload</Label>
                                        <div className="mt-2 p-3 bg-gray-50 rounded-md">
                                            <pre className="text-xs text-gray-800 whitespace-pre-wrap overflow-x-auto">
                                                {JSON.stringify(selectedLog.requestPayload, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                )}

                                {selectedLog.responseBody && (
                                    <div>
                                        <Label className="text-sm font-medium">Full KRA Response</Label>
                                        <div className="mt-2 p-3 bg-gray-50 rounded-md max-h-96 overflow-y-auto">
                                            <pre className="text-xs text-gray-800 whitespace-pre-wrap overflow-x-auto">
                                                {JSON.stringify(selectedLog.responseBody, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                )}

                                {/* Special formatting for initialization response */}
                                {selectedLog.operation === 'Device Initialization' && selectedLog.responseBody && (
                                    <div>
                                        <Label className="text-sm font-medium">Initialization Details</Label>
                                        <div className="mt-2 space-y-3">
                                            {selectedLog.responseBody.data && (
                                                <div className="grid gap-4 md:grid-cols-2">
                                                    {selectedLog.responseBody.data.tin && (
                                                        <div>
                                                            <Label className="text-xs font-medium text-muted-foreground">TIN</Label>
                                                            <p className="text-sm">{selectedLog.responseBody.data.tin}</p>
                                                        </div>
                                                    )}
                                                    {selectedLog.responseBody.data.bhfId && (
                                                        <div>
                                                            <Label className="text-xs font-medium text-muted-foreground">Branch ID</Label>
                                                            <p className="text-sm">{selectedLog.responseBody.data.bhfId}</p>
                                                        </div>
                                                    )}
                                                    {selectedLog.responseBody.data.dvcSrlNo && (
                                                        <div>
                                                            <Label className="text-xs font-medium text-muted-foreground">Device Serial</Label>
                                                            <p className="text-sm">{selectedLog.responseBody.data.dvcSrlNo}</p>
                                                        </div>
                                                    )}
                                                    {selectedLog.responseBody.data.lastSaleInvcNo && (
                                                        <div>
                                                            <Label className="text-xs font-medium text-muted-foreground">Last Sale Invoice No</Label>
                                                            <p className="text-sm">{selectedLog.responseBody.data.lastSaleInvcNo}</p>
                                                        </div>
                                                    )}
                                                    {selectedLog.responseBody.data.lastPchsInvcNo && (
                                                        <div>
                                                            <Label className="text-xs font-medium text-muted-foreground">Last Purchase Invoice No</Label>
                                                            <p className="text-sm">{selectedLog.responseBody.data.lastPchsInvcNo}</p>
                                                        </div>
                                                    )}
                                                    {selectedLog.responseBody.data.lastStockRegnNo && (
                                                        <div>
                                                            <Label className="text-xs font-medium text-muted-foreground">Last Stock Registration No</Label>
                                                            <p className="text-sm">{selectedLog.responseBody.data.lastStockRegnNo}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Special formatting for codes response */}
                                {selectedLog.operation === 'Get Classification Codes' && selectedLog.responseBody && selectedLog.responseBody.data && (
                                    <div>
                                        <Label className="text-sm font-medium">Retrieved Codes Summary</Label>
                                        <div className="mt-2 grid gap-4 md:grid-cols-3">
                                            {selectedLog.responseBody.data.cdCls && (
                                                <div>
                                                    <Label className="text-xs font-medium text-muted-foreground">Classification Codes</Label>
                                                    <p className="text-sm">{selectedLog.responseBody.data.cdCls.length} codes</p>
                                                </div>
                                            )}
                                            {selectedLog.responseBody.data.taxTyCd && (
                                                <div>
                                                    <Label className="text-xs font-medium text-muted-foreground">Tax Type Codes</Label>
                                                    <p className="text-sm">{selectedLog.responseBody.data.taxTyCd.length} codes</p>
                                                </div>
                                            )}
                                            {selectedLog.responseBody.data.unspscCd && (
                                                <div>
                                                    <Label className="text-xs font-medium text-muted-foreground">UNSPSC Codes</Label>
                                                    <p className="text-sm">{selectedLog.responseBody.data.unspscCd.length} codes</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {selectedLog.requestHeaders && (
                                    <div>
                                        <Label className="text-sm font-medium">Request Headers</Label>
                                        <div className="mt-2 p-3 bg-gray-50 rounded-md">
                                            <pre className="text-xs text-gray-800 whitespace-pre-wrap overflow-x-auto">
                                                {JSON.stringify(selectedLog.requestHeaders, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                )}

                                {selectedLog.responseHeaders && (
                                    <div>
                                        <Label className="text-sm font-medium">Response Headers</Label>
                                        <div className="mt-2 p-3 bg-gray-50 rounded-md">
                                            <pre className="text-xs text-gray-800 whitespace-pre-wrap overflow-x-auto">
                                                {JSON.stringify(selectedLog.responseHeaders, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
} 