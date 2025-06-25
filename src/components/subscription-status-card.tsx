import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';

export const SubscriptionStatusCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          Subscription Status
        </CardTitle>
        <CardDescription>
          Your current subscription plan
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Plan</span>
          <Badge variant="outline">Free</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status</span>
          <Badge variant="default" className="bg-green-500">Active</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Next Billing</span>
          <span className="text-sm">Never</span>
        </div>
        <Button variant="outline" className="w-full">
          Manage Subscription
        </Button>
      </CardContent>
    </Card>
  );
}; 