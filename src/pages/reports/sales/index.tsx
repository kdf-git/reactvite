import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

export default function SalesReportsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Sales Reports</h1>
                    <p className="text-muted-foreground">
                        Analyze your sales performance and trends
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Sales Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12">
                        <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                            Comprehensive sales reports, charts, and analytics dashboards will be available soon.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 