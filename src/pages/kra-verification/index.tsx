import { useState } from 'react';
import { Search, Eye, RefreshCw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { kraDataVerificationService } from '@/services/sdk';
import { kraVscuService } from '@/services/sdk';

interface DataOption {
    id: string;
    name: string;
    description: string;
    sdkMethod: string;
    requiresInput?: boolean;
    inputLabel?: string;
    inputPlaceholder?: string;
    icon: string;
}

const dataOptions: DataOption[] = [
    {
        id: 'codes',
        name: 'Common Codes',
        description: 'Classification and location codes registered in KRA',
        sdkMethod: 'kraDataVerificationControllerGetCodes',
        icon: '📋'
    },
    {
        id: 'item-classifications',
        name: 'Item Classifications',
        description: 'List of item classifications registered in KRA',
        sdkMethod: 'kraDataVerificationControllerGetItemClassifications',
        icon: '📂'
    },
    {
        id: 'customer',
        name: 'Customer Information',
        description: 'Taxpayer information for a specific customer PIN',
        sdkMethod: 'kraDataVerificationControllerGetCustomer',
        requiresInput: true,
        inputLabel: 'Customer PIN',
        inputPlaceholder: 'Enter customer PIN (e.g., P123456789X)',
        icon: '👤'
    },
    {
        id: 'branches',
        name: 'Branch Information',
        description: 'List of taxpayer branch information registered in KRA',
        sdkMethod: 'kraDataVerificationControllerGetBranches',
        icon: '🏢'
    },
    {
        id: 'notices',
        name: 'KRA Notices',
        description: 'List of notices for the taxpayer client',
        sdkMethod: 'kraDataVerificationControllerGetNotices',
        icon: '📢'
    },
    {
        id: 'items',
        name: 'Product Items',
        description: 'List of item (product) information from KRA server',
        sdkMethod: 'kraDataVerificationControllerGetItems',
        icon: '📦'
    },
    {
        id: 'import-items',
        name: 'Imported Items',
        description: 'List of taxpayer\'s imported items from KRA server',
        sdkMethod: 'kraDataVerificationControllerGetImportItems',
        icon: '🚢'
    },
    {
        id: 'purchase-sales',
        name: 'Purchase-Sales Transactions',
        description: 'Sales information to register purchases',
        sdkMethod: 'kraDataVerificationControllerGetPurchaseSales',
        icon: '💰'
    },
    {
        id: 'stock-movements',
        name: 'Stock Movements',
        description: 'Stock movement list from KRA server',
        sdkMethod: 'kraDataVerificationControllerGetStockMovements',
        icon: '📊'
    }
];

export default function KraVerificationPage() {
    const [selectedDataType, setSelectedDataType] = useState<string>('');
    const [inputValue, setInputValue] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<string>('');

    const selectedOption = dataOptions.find(option => option.id === selectedDataType);

    const handleRetrieveData = async () => {
        if (!selectedDataType) {
            toast.error('Please select a data type to retrieve');
            return;
        }

        const option = dataOptions.find(opt => opt.id === selectedDataType);
        if (!option) return;

        if (option.requiresInput && !inputValue.trim()) {
            toast.error(`Please enter ${option.inputLabel}`);
            return;
        }

        setLoading(true);
        setError('');
        setData(null);

        try {
            let payload: any = {};

            // Build payload based on option type
            if (option.requiresInput) {
                if (option.id === 'customer') {
                    payload = { custmTin: inputValue.trim() };
                }
            } else if (['purchase-sales', 'stock-movements'].includes(option.id)) {
                // These endpoints have different payload structures
                payload = { lastReqDt: new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14) };
            } else {
                // Default payload for most endpoints
                payload = { lastReqDt: new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14) };
            }

            // Call the appropriate SDK method
            const result = await (kraDataVerificationService as any)[option.sdkMethod](payload);
            setData(result);

            if (result.resultCd === '000') {
                toast.success('Data retrieved successfully');
            } else {
                toast.error(`KRA Error: ${result.resultMsg} (Code: ${result.resultCd})`);
                setError(`${result.resultMsg} (Code: ${result.resultCd})`);
            }
        } catch (err: any) {
            console.error('Failed to retrieve data:', err);
            setError(err.message || 'Failed to retrieve data');
            toast.error('Failed to retrieve data');
        } finally {
            setLoading(false);
        }
    };

    const exportToCSV = () => {
        if (!data || !data.data) {
            toast.error('No data to export');
            return;
        }

        try {
            // Convert data to CSV
            const items = Array.isArray(data.data) ? data.data : [data.data];
            if (items.length === 0) {
                toast.error('No data to export');
                return;
            }

            const headers = Object.keys(items[0]);
            const csvContent = [
                headers.join(','),
                ...items.map(item =>
                    headers.map(header => {
                        const value = item[header];
                        // Handle nested objects by converting to JSON string
                        if (typeof value === 'object' && value !== null) {
                            return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
                        }
                        // Escape commas and quotes in string values
                        return `"${String(value || '').replace(/"/g, '""')}"`;
                    }).join(',')
                )
            ].join('\n');

            // Download CSV
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `kra-${selectedDataType}-${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);

            toast.success('Data exported successfully');
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export data');
        }
    };

    const renderDataTable = () => {
        if (!data) return null;

        if (error) {
            return (
                <div className="text-center py-8">
                    <div className="text-red-600 mb-4">❌ Error retrieving data</div>
                    <div className="text-sm text-muted-foreground">{error}</div>
                </div>
            );
        }

        if (data.resultCd !== '000') {
            return (
                <div className="text-center py-8">
                    <div className="text-red-600 mb-4">❌ KRA Error</div>
                    <div className="text-sm text-muted-foreground">
                        {data.resultMsg} (Code: {data.resultCd})
                    </div>
                </div>
            );
        }

        if (!data.data || (Array.isArray(data.data) && data.data.length === 0)) {
            return (
                <div className="text-center py-8 text-muted-foreground">
                    📭 No data found
                </div>
            );
        }

        // Handle different data structures
        let items: any[] = [];
        if (Array.isArray(data.data)) {
            items = data.data;
        } else if (typeof data.data === 'object') {
            // Handle nested arrays in response
            const firstKey = Object.keys(data.data)[0];
            if (Array.isArray(data.data[firstKey])) {
                items = data.data[firstKey];
            } else {
                items = [data.data];
            }
        }

        if (items.length === 0) {
            return (
                <div className="text-center py-8 text-muted-foreground">
                    📭 No data found
                </div>
            );
        }

        // Get headers from first item
        const headers = Object.keys(items[0]);

        return (
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {headers.map((header) => (
                                <TableHead key={header} className="font-semibold">
                                    {header.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map((item, index) => (
                            <TableRow key={index}>
                                {headers.map((header) => (
                                    <TableCell key={header}>
                                        {typeof item[header] === 'object' && item[header] !== null
                                            ? JSON.stringify(item[header])
                                            : String(item[header] || '-')
                                        }
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">KRA Data Verification</h1>
                <p className="text-muted-foreground">
                    Retrieve and verify your data in the KRA VSCU system
                </p>
            </div>

            <Tabs defaultValue="retrieve" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="retrieve">Retrieve Data</TabsTrigger>
                    <TabsTrigger value="guide">User Guide</TabsTrigger>
                </TabsList>

                <TabsContent value="retrieve" className="space-y-6">
                    {/* Data Selection */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Search className="h-5 w-5" />
                                Data Selection
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="dataType">Data Type *</Label>
                                    <Select
                                        value={selectedDataType}
                                        onValueChange={(value) => {
                                            setSelectedDataType(value);
                                            setInputValue('');
                                            setData(null);
                                            setError('');
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select data type to retrieve" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {dataOptions.map((option) => (
                                                <SelectItem key={option.id} value={option.id}>
                                                    <div className="flex items-center gap-2">
                                                        <span>{option.icon}</span>
                                                        <div>
                                                            <div className="font-medium">{option.name}</div>
                                                            <div className="text-xs text-muted-foreground">
                                                                {option.description}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {selectedOption?.requiresInput && (
                                    <div className="space-y-2">
                                        <Label htmlFor="inputValue">{selectedOption.inputLabel} *</Label>
                                        <Input
                                            id="inputValue"
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            placeholder={selectedOption.inputPlaceholder}
                                        />
                                    </div>
                                )}
                            </div>

                            {selectedOption && (
                                <div className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0">
                                            <span className="text-2xl">{selectedOption.icon}</span>
                                        </div>
                                        <div className="ml-3">
                                            <h4 className="text-sm font-medium text-blue-800">
                                                {selectedOption.name}
                                            </h4>
                                            <p className="text-sm text-blue-700 mt-1">
                                                {selectedOption.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-2">
                                <Button
                                    onClick={handleRetrieveData}
                                    disabled={loading || !selectedDataType}
                                    className="flex items-center gap-2"
                                >
                                    {loading ? (
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                    {loading ? 'Retrieving...' : 'Retrieve Data'}
                                </Button>

                                {data && data.resultCd === '000' && (
                                    <Button
                                        variant="outline"
                                        onClick={exportToCSV}
                                        className="flex items-center gap-2"
                                    >
                                        <Download className="h-4 w-4" />
                                        Export CSV
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Results */}
                    {(data || loading) && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Results</CardTitle>
                                    {data && data.resultCd === '000' && (
                                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                                            ✅ Success
                                        </Badge>
                                    )}
                                    {data && data.resultCd !== '000' && (
                                        <Badge variant="destructive">
                                            ❌ Error
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="text-center py-8">
                                        <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
                                        <p className="text-muted-foreground">Retrieving data from KRA...</p>
                                    </div>
                                ) : (
                                    renderDataTable()
                                )}
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="guide">
                    <Card>
                        <CardHeader>
                            <CardTitle>User Guide</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="prose max-w-none">
                                <h3>How to Use KRA Data Verification</h3>
                                <p>
                                    This tool allows you to retrieve and verify your data in the KRA VSCU system.
                                    Use it to confirm that your submitted transactions and items are properly recorded in KRA.
                                </p>

                                <h4>Available Data Types:</h4>
                                <ul>
                                    {dataOptions.map((option) => (
                                        <li key={option.id}>
                                            <strong>{option.icon} {option.name}</strong>: {option.description}
                                        </li>
                                    ))}
                                </ul>

                                <h4>Steps to Retrieve Data:</h4>
                                <ol>
                                    <li>Select the type of data you want to retrieve</li>
                                    <li>If required, enter additional information (e.g., Customer PIN)</li>
                                    <li>Click "Retrieve Data" to fetch the information from KRA</li>
                                    <li>Review the results in the table below</li>
                                    <li>Optionally export the data as CSV for further analysis</li>
                                </ol>

                                <h4>Important Notes:</h4>
                                <ul>
                                    <li>This tool only retrieves data for verification - no data is stored in our system</li>
                                    <li>Data retrieval is not logged in the VSCU audit system</li>
                                    <li>Results show real-time data from the KRA VSCU system</li>
                                    <li>If you encounter errors, check your internet connection and try again</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
} 