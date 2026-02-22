import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQuery } from '@tanstack/react-query';
import { useActor } from '../hooks/useActor';
import { useNavigate } from '@tanstack/react-router';
import { Item } from '../backend';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import ItemCard from '../components/ItemCard';
import ItemGrid from '../components/ItemGrid';
import EmptyState from '../components/EmptyState';

export default function PurchaseHistoryPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();

  const isAuthenticated = !!identity;

  const { data: purchasedItems = [], isLoading } = useQuery<Item[]>({
    queryKey: ['purchaseHistory'],
    queryFn: async () => {
      // Backend doesn't expose purchase history query, return empty for MVP
      return [];
    },
    enabled: !!actor && !actorFetching && isAuthenticated,
  });

  const { data: soldItems = [] } = useQuery<Item[]>({
    queryKey: ['soldItems'],
    queryFn: async () => {
      // Backend doesn't expose sold items query, return empty for MVP
      return [];
    },
    enabled: !!actor && !actorFetching && isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="font-serif">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              You need to be logged in to view your purchase history.
            </p>
            <Button onClick={() => navigate({ to: '/browse' })}>
              Back to Browse
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalPurchased = purchasedItems.reduce((sum, item) => sum + Number(item.price), 0);
  const totalSold = soldItems.reduce((sum, item) => sum + Number(item.price), 0);

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="font-serif text-4xl font-bold mb-8">Purchase History</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-1">Total Purchased</p>
            <p className="text-3xl font-bold text-primary">${totalPurchased.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {purchasedItems.length} {purchasedItems.length === 1 ? 'item' : 'items'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-1">Total Sold</p>
            <p className="text-3xl font-bold text-secondary">${totalSold.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {soldItems.length} {soldItems.length === 1 ? 'item' : 'items'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="purchases" className="space-y-6">
        <TabsList>
          <TabsTrigger value="purchases">My Purchases</TabsTrigger>
          <TabsTrigger value="sales">My Sales</TabsTrigger>
        </TabsList>

        <TabsContent value="purchases">
          {purchasedItems.length === 0 ? (
            <EmptyState
              title="No purchases yet"
              description="Items you purchase will appear here."
              action={
                <Button onClick={() => navigate({ to: '/browse' })}>
                  Browse Marketplace
                </Button>
              }
            />
          ) : (
            <ItemGrid>
              {purchasedItems.map(item => (
                <ItemCard key={item.id} item={item} />
              ))}
            </ItemGrid>
          )}
        </TabsContent>

        <TabsContent value="sales">
          {soldItems.length === 0 ? (
            <EmptyState
              title="No sales yet"
              description="Items you've sold will appear here."
              action={
                <Button onClick={() => navigate({ to: '/upload' })}>
                  Upload Items
                </Button>
              }
            />
          ) : (
            <ItemGrid>
              {soldItems.map(item => (
                <ItemCard key={item.id} item={item} />
              ))}
            </ItemGrid>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
