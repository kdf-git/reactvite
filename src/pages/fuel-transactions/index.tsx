import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Fuel } from 'lucide-react';

export default function FuelTransactionsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Fuel Transactions</h1>
                    <p className="text-muted-foreground">
                        Monitor and manage fuel sales transactions
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Fuel Transaction Management</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12">
                        <Fuel className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                            Real-time fuel transaction monitoring, pump management, and sales analytics will be available soon.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 