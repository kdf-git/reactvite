import { useState, useEffect } from 'react';
import { Calendar, Download, RefreshCw, TrendingUp, TrendingDown, DollarSign, FileText, BarChart3, PieChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useMerchantSettings, formatCurrency } from '@/hooks/useMerchantSettings';
import { financialReportsService } from '@/services/sdk';
import { Checkbox } from '@/components/ui/checkbox';

interface FinancialReportsState {
    balanceSheet: any;
    incomeStatement: any;
    trialBalance: any;
    cashFlow: any;
    financialSummary: any;
    loading: boolean;
    error: string | null;
    filters: {
        startDate: string;
        endDate: string;
        includeInactive: boolean;
    };
}

export default function FinancialReportsPage() {
    const { user } = useAuth();
    const merchantSettings = useMerchantSettings();
    const [state, setState] = useState<FinancialReportsState>({
        balanceSheet: null,
        incomeStatement: null,
        trialBalance: null,
        cashFlow: null,
        financialSummary: null,
        loading: true,
        error: null,
        filters: {
            startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], // Start of year
            endDate: new Date().toISOString().split('T')[0], // Today
            includeInactive: false,
        },
    });

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

    // Load financial reports
    const loadFinancialReports = async () => {
        try {
            setState(prev => ({ ...prev, loading: true, error: null }));

            const merchantId = getMerchantId();
            if (!merchantId) {
                throw new Error('Merchant ID not found. Please ensure you are logged in.');
            }

            // Load all financial reports in parallel
            const [balanceSheet, incomeStatement, trialBalance, cashFlow, financialSummary] = await Promise.all([
                financialReportsService.financialReportsControllerGetBalanceSheet(
                    merchantId,
                    state.filters.endDate,
                    state.filters.includeInactive
                ),
                financialReportsService.financialReportsControllerGetIncomeStatement(
                    merchantId,
                    state.filters.startDate,
                    state.filters.endDate,
                    state.filters.includeInactive
                ),
                financialReportsService.financialReportsControllerGetTrialBalance(
                    merchantId,
                    state.filters.endDate,
                    state.filters.includeInactive
                ),
                financialReportsService.financialReportsControllerGetCashFlowStatement(
                    merchantId,
                    state.filters.startDate,
                    state.filters.endDate
                ),
                financialReportsService.financialReportsControllerGetFinancialSummary(
                    merchantId,
                    state.filters.startDate,
                    state.filters.endDate,
                    state.filters.includeInactive
                ),
            ]);

            setState(prev => ({
                ...prev,
                balanceSheet,
                incomeStatement,
                trialBalance,
                cashFlow,
                financialSummary,
                loading: false,
            }));
        } catch (error: any) {
            console.error('Failed to load financial reports:', error);
            setState(prev => ({
                ...prev,
                error: error.message || 'Failed to load financial reports',
                loading: false,
            }));
            toast.error(error.message || 'Failed to load financial reports');
        }
    };

    useEffect(() => {
        if (user) {
            loadFinancialReports();
        }
    }, [user, state.filters]);

    // Handle filter change
    const handleFilterChange = (key: string, value: any) => {
        setState(prev => ({
            ...prev,
            filters: { ...prev.filters, [key]: value },
        }));
    };

    // Show loading or error if user is not available
    if (!user) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-muted-foreground">Please log in to view financial reports</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Financial Reports</h1>
                    <p className="text-muted-foreground">
                        Comprehensive financial reporting and analysis
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={loadFinancialReports}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Report Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <Label htmlFor="startDate">Start Date</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={state.filters.startDate}
                                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="endDate">End Date</Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={state.filters.endDate}
                                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="includeInactive"
                                checked={state.filters.includeInactive}
                                onCheckedChange={(checked) => handleFilterChange('includeInactive', checked)}
                            />
                            <Label htmlFor="includeInactive">Include Inactive Accounts</Label>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Error Display */}
            {state.error && (
                <Card className="border-destructive">
                    <CardContent className="pt-6">
                        <p className="text-destructive">{state.error}</p>
                    </CardContent>
                </Card>
            )}

            {/* Financial Summary Cards */}
            {state.financialSummary && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatCurrency(state.financialSummary.summary?.totalAssets || 0, merchantSettings)}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Liabilities</CardTitle>
                            <TrendingDown className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatCurrency(state.financialSummary.summary?.totalLiabilities || 0, merchantSettings)}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatCurrency(state.financialSummary.summary?.totalRevenue || 0, merchantSettings)}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
                            <PieChart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatCurrency(state.financialSummary.summary?.netIncome || 0, merchantSettings)}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Financial Reports Tabs */}
            <Tabs defaultValue="balance-sheet" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="balance-sheet">Balance Sheet</TabsTrigger>
                    <TabsTrigger value="income-statement">Income Statement</TabsTrigger>
                    <TabsTrigger value="trial-balance">Trial Balance</TabsTrigger>
                    <TabsTrigger value="cash-flow">Cash Flow</TabsTrigger>
                </TabsList>

                {/* Balance Sheet */}
                <TabsContent value="balance-sheet">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Balance Sheet
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {state.loading ? (
                                <div className="text-center py-8">Loading balance sheet...</div>
                            ) : state.balanceSheet ? (
                                <div className="space-y-6">
                                    {/* Assets */}
                                    <div>
                                        <h3 className="text-lg font-semibold mb-4">Assets</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <h4 className="font-medium mb-2">Current Assets</h4>
                                                <Table>
                                                    <TableBody>
                                                        {state.balanceSheet.assets?.currentAssets?.map((asset: any, index: number) => (
                                                            <TableRow key={index}>
                                                                <TableCell>{asset.name}</TableCell>
                                                                <TableCell className="text-right">
                                                                    {formatCurrency(asset.balance, merchantSettings)}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                        <TableRow className="font-medium">
                                                            <TableCell>Total Current Assets</TableCell>
                                                            <TableCell className="text-right">
                                                                {formatCurrency(state.balanceSheet.assets?.totalCurrentAssets || 0, merchantSettings)}
                                                            </TableCell>
                                                        </TableRow>
                                                    </TableBody>
                                                </Table>
                                            </div>
                                            <div>
                                                <h4 className="font-medium mb-2">Fixed Assets</h4>
                                                <Table>
                                                    <TableBody>
                                                        {state.balanceSheet.assets?.fixedAssets?.map((asset: any, index: number) => (
                                                            <TableRow key={index}>
                                                                <TableCell>{asset.name}</TableCell>
                                                                <TableCell className="text-right">
                                                                    {formatCurrency(asset.balance, merchantSettings)}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                        <TableRow className="font-medium">
                                                            <TableCell>Total Fixed Assets</TableCell>
                                                            <TableCell className="text-right">
                                                                {formatCurrency(state.balanceSheet.assets?.totalFixedAssets || 0, merchantSettings)}
                                                            </TableCell>
                                                        </TableRow>
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                        <div className="mt-4 p-4 bg-muted rounded-lg">
                                            <div className="flex justify-between items-center">
                                                <span className="text-lg font-semibold">Total Assets</span>
                                                <span className="text-lg font-bold">
                                                    {formatCurrency(state.balanceSheet.assets?.totalAssets || 0, merchantSettings)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Liabilities & Equity */}
                                    <div>
                                        <h3 className="text-lg font-semibold mb-4">Liabilities & Equity</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <h4 className="font-medium mb-2">Liabilities</h4>
                                                <Table>
                                                    <TableBody>
                                                        {state.balanceSheet.liabilities?.currentLiabilities?.map((liability: any, index: number) => (
                                                            <TableRow key={index}>
                                                                <TableCell>{liability.name}</TableCell>
                                                                <TableCell className="text-right">
                                                                    {formatCurrency(liability.balance, merchantSettings)}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                        <TableRow className="font-medium">
                                                            <TableCell>Total Liabilities</TableCell>
                                                            <TableCell className="text-right">
                                                                {formatCurrency(state.balanceSheet.liabilities?.totalLiabilities || 0, merchantSettings)}
                                                            </TableCell>
                                                        </TableRow>
                                                    </TableBody>
                                                </Table>
                                            </div>
                                            <div>
                                                <h4 className="font-medium mb-2">Equity</h4>
                                                <Table>
                                                    <TableBody>
                                                        {state.balanceSheet.equity?.equityAccounts?.map((equity: any, index: number) => (
                                                            <TableRow key={index}>
                                                                <TableCell>{equity.name}</TableCell>
                                                                <TableCell className="text-right">
                                                                    {formatCurrency(equity.balance, merchantSettings)}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                        <TableRow className="font-medium">
                                                            <TableCell>Total Equity</TableCell>
                                                            <TableCell className="text-right">
                                                                {formatCurrency(state.balanceSheet.equity?.totalEquity || 0, merchantSettings)}
                                                            </TableCell>
                                                        </TableRow>
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                        <div className="mt-4 p-4 bg-muted rounded-lg">
                                            <div className="flex justify-between items-center">
                                                <span className="text-lg font-semibold">Total Liabilities & Equity</span>
                                                <span className="text-lg font-bold">
                                                    {formatCurrency((state.balanceSheet.liabilities?.totalLiabilities || 0) + (state.balanceSheet.equity?.totalEquity || 0), merchantSettings)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">No balance sheet data available</div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Income Statement */}
                <TabsContent value="income-statement">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                Income Statement
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {state.loading ? (
                                <div className="text-center py-8">Loading income statement...</div>
                            ) : state.incomeStatement ? (
                                <div className="space-y-6">
                                    {/* Revenue */}
                                    <div>
                                        <h3 className="text-lg font-semibold mb-4">Revenue</h3>
                                        <Table>
                                            <TableBody>
                                                {state.incomeStatement.revenue?.operatingRevenue?.map((revenue: any, index: number) => (
                                                    <TableRow key={index}>
                                                        <TableCell>{revenue.name}</TableCell>
                                                        <TableCell className="text-right">
                                                            {formatCurrency(revenue.balance, merchantSettings)}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                                <TableRow className="font-medium">
                                                    <TableCell>Total Revenue</TableCell>
                                                    <TableCell className="text-right">
                                                        {formatCurrency(state.incomeStatement.revenue?.totalRevenue || 0, merchantSettings)}
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {/* Expenses */}
                                    <div>
                                        <h3 className="text-lg font-semibold mb-4">Expenses</h3>
                                        <Table>
                                            <TableBody>
                                                {state.incomeStatement.expenses?.operatingExpenses?.map((expense: any, index: number) => (
                                                    <TableRow key={index}>
                                                        <TableCell>{expense.name}</TableCell>
                                                        <TableCell className="text-right">
                                                            {formatCurrency(expense.balance, merchantSettings)}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                                <TableRow className="font-medium">
                                                    <TableCell>Total Expenses</TableCell>
                                                    <TableCell className="text-right">
                                                        {formatCurrency(state.incomeStatement.expenses?.totalExpenses || 0, merchantSettings)}
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {/* Net Income */}
                                    <div className="p-4 bg-muted rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-semibold">Net Income</span>
                                            <span className={`text-lg font-bold ${state.incomeStatement.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {formatCurrency(state.incomeStatement.netIncome || 0, merchantSettings)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">No income statement data available</div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Trial Balance */}
                <TabsContent value="trial-balance">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                Trial Balance
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {state.loading ? (
                                <div className="text-center py-8">Loading trial balance...</div>
                            ) : state.trialBalance ? (
                                <div>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Account</TableHead>
                                                <TableHead>Account Code</TableHead>
                                                <TableHead className="text-right">Debit</TableHead>
                                                <TableHead className="text-right">Credit</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {state.trialBalance.accounts?.map((account: any, index: number) => (
                                                <TableRow key={index}>
                                                    <TableCell>{account.name}</TableCell>
                                                    <TableCell>{account.accountCode}</TableCell>
                                                    <TableCell className="text-right">
                                                        {account.debitBalance > 0 ? formatCurrency(account.debitBalance, merchantSettings) : '-'}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {account.creditBalance > 0 ? formatCurrency(account.creditBalance, merchantSettings) : '-'}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            <TableRow className="font-bold border-t-2">
                                                <TableCell colSpan={2}>Total</TableCell>
                                                <TableCell className="text-right">
                                                    {formatCurrency(state.trialBalance.totalDebits || 0, merchantSettings)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {formatCurrency(state.trialBalance.totalCredits || 0, merchantSettings)}
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                    <div className="mt-4 p-4 bg-muted rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">Trial Balance Status</span>
                                            <Badge variant={state.trialBalance.isBalanced ? 'default' : 'destructive'}>
                                                {state.trialBalance.isBalanced ? 'Balanced' : 'Not Balanced'}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">No trial balance data available</div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Cash Flow */}
                <TabsContent value="cash-flow">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5" />
                                Cash Flow Statement
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {state.loading ? (
                                <div className="text-center py-8">Loading cash flow statement...</div>
                            ) : state.cashFlow ? (
                                <div className="space-y-6">
                                    {/* Operating Activities */}
                                    <div>
                                        <h3 className="text-lg font-semibold mb-4">Operating Activities</h3>
                                        <Table>
                                            <TableBody>
                                                {state.cashFlow.operatingActivities && (
                                                    <>
                                                        <TableRow>
                                                            <TableCell>Net Income</TableCell>
                                                            <TableCell className="text-right">
                                                                {formatCurrency(state.cashFlow.operatingActivities.netIncome || 0, merchantSettings)}
                                                            </TableCell>
                                                        </TableRow>
                                                        {state.cashFlow.operatingActivities.adjustments?.map((adjustment: any, index: number) => (
                                                            <TableRow key={index}>
                                                                <TableCell>{adjustment.description}</TableCell>
                                                                <TableCell className="text-right">
                                                                    {formatCurrency(adjustment.amount, merchantSettings)}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </>
                                                )}
                                                <TableRow className="font-medium">
                                                    <TableCell>Net Cash from Operating Activities</TableCell>
                                                    <TableCell className="text-right">
                                                        {formatCurrency(state.cashFlow.operatingActivities?.netCashFromOperating || 0, merchantSettings)}
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {/* Investing Activities */}
                                    {state.cashFlow.investingActivities && (
                                        <div>
                                            <h3 className="text-lg font-semibold mb-4">Investing Activities</h3>
                                            <Table>
                                                <TableBody>
                                                    <TableRow>
                                                        <TableCell>Equipment Purchases</TableCell>
                                                        <TableCell className="text-right">
                                                            {formatCurrency(state.cashFlow.investingActivities.equipmentPurchases || 0, merchantSettings)}
                                                        </TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell>Equipment Sales</TableCell>
                                                        <TableCell className="text-right">
                                                            {formatCurrency(state.cashFlow.investingActivities.equipmentSales || 0, merchantSettings)}
                                                        </TableCell>
                                                    </TableRow>
                                                    <TableRow className="font-medium">
                                                        <TableCell>Net Cash from Investing Activities</TableCell>
                                                        <TableCell className="text-right">
                                                            {formatCurrency(state.cashFlow.investingActivities.netCashFromInvesting || 0, merchantSettings)}
                                                        </TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </div>
                                    )}

                                    {/* Financing Activities */}
                                    {state.cashFlow.financingActivities && (
                                        <div>
                                            <h3 className="text-lg font-semibold mb-4">Financing Activities</h3>
                                            <Table>
                                                <TableBody>
                                                    <TableRow>
                                                        <TableCell>Owner Investments</TableCell>
                                                        <TableCell className="text-right">
                                                            {formatCurrency(state.cashFlow.financingActivities.ownerInvestments || 0, merchantSettings)}
                                                        </TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell>Owner Withdrawals</TableCell>
                                                        <TableCell className="text-right">
                                                            {formatCurrency(state.cashFlow.financingActivities.ownerWithdrawals || 0, merchantSettings)}
                                                        </TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell>Loan Proceeds</TableCell>
                                                        <TableCell className="text-right">
                                                            {formatCurrency(state.cashFlow.financingActivities.loanProceeds || 0, merchantSettings)}
                                                        </TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell>Loan Payments</TableCell>
                                                        <TableCell className="text-right">
                                                            {formatCurrency(state.cashFlow.financingActivities.loanPayments || 0, merchantSettings)}
                                                        </TableCell>
                                                    </TableRow>
                                                    <TableRow className="font-medium">
                                                        <TableCell>Net Cash from Financing Activities</TableCell>
                                                        <TableCell className="text-right">
                                                            {formatCurrency(state.cashFlow.financingActivities.netCashFromFinancing || 0, merchantSettings)}
                                                        </TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </div>
                                    )}

                                    {/* Cash Summary */}
                                    <div className="space-y-4">
                                        <div className="p-4 bg-muted rounded-lg">
                                            <div className="flex justify-between items-center">
                                                <span className="text-lg font-semibold">Net Change in Cash</span>
                                                <span className={`text-lg font-bold ${(state.cashFlow.netChangeInCash || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {formatCurrency(state.cashFlow.netChangeInCash || 0, merchantSettings)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="p-4 border rounded-lg">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-medium">Beginning Cash</span>
                                                    <span className="font-bold">
                                                        {formatCurrency(state.cashFlow.beginningCash || 0, merchantSettings)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="p-4 border rounded-lg">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-medium">Ending Cash</span>
                                                    <span className="font-bold">
                                                        {formatCurrency(state.cashFlow.endingCash || 0, merchantSettings)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">No cash flow data available</div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
} 