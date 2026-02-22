import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetItem } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2 } from 'lucide-react';

export default function PurchaseConfirmationPage() {
  const { itemId } = useParams({ from: '/purchase-confirmation/$itemId' });
  const navigate = useNavigate();
  const { data: item, isLoading } = useGetItem(itemId);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <h2 className="font-serif text-2xl font-bold mb-2">Item Not Found</h2>
            <Button onClick={() => navigate({ to: '/browse' })}>
              Back to Browse
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-3">
              <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <CardTitle className="font-serif text-3xl">Purchase Successful!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted p-6 rounded-lg">
            <h3 className="font-semibold mb-4">Order Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Item</span>
                <span className="font-medium">{item.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price</span>
                <span className="font-medium">${Number(item.price).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium text-green-600">Completed</span>
              </div>
            </div>
          </div>

          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              You now own this item! You can view it in your purchase history.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => navigate({ to: '/purchase-history' })}>
                View Purchase History
              </Button>
              <Button variant="outline" onClick={() => navigate({ to: '/browse' })}>
                Continue Shopping
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
