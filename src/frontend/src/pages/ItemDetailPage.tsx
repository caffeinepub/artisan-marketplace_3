import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetItem, useGetNftOwner } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Loader2 } from 'lucide-react';
import FilePreview from '../components/FilePreview';
import PurchaseButton from '../components/PurchaseButton';

export default function ItemDetailPage() {
  const { itemId } = useParams({ from: '/item/$itemId' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: item, isLoading } = useGetItem(itemId);
  const { data: nftOwner } = useGetNftOwner(item?.itemType === 'nft' ? itemId : undefined);

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
            <p className="text-muted-foreground mb-4">
              The item you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate({ to: '/browse' })}>
              Back to Browse
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getItemTypeLabel = (itemType: typeof item.itemType) => {
    const labels = {
      digitalArt: 'Digital Art',
      physicalProduct: 'Physical Product',
      nft: 'NFT',
      craftItem: 'Craft Item',
    };
    return labels[itemType];
  };

  const isSold = item.owner.toString() !== item.artist.toString();
  const isOwner = identity && item.owner.toString() === identity.getPrincipal().toString();

  return (
    <div className="container mx-auto px-4 py-12">
      <Button
        variant="ghost"
        onClick={() => navigate({ to: '/browse' })}
        className="mb-6 gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Browse
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        <div className="aspect-square overflow-hidden rounded-lg bg-muted">
          <FilePreview blob={item.blob} className="w-full h-full object-cover" />
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="font-serif text-4xl font-bold">{item.title}</h1>
              <Badge>{getItemTypeLabel(item.itemType)}</Badge>
            </div>
            <p className="text-lg text-muted-foreground">{item.description}</p>
          </div>

          <Separator />

          <div>
            <p className="text-sm text-muted-foreground mb-1">Price</p>
            <p className="text-4xl font-bold text-primary">${Number(item.price).toFixed(2)}</p>
          </div>

          {item.itemType === 'nft' && nftOwner && (
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-medium mb-1">NFT Token</p>
              <p className="text-xs text-muted-foreground font-mono break-all">
                Owner: {nftOwner.toString()}
              </p>
            </div>
          )}

          {isSold && (
            <div className="bg-secondary/20 p-4 rounded-lg">
              <p className="font-medium">This item has been sold</p>
              {isOwner && (
                <p className="text-sm text-muted-foreground mt-1">
                  You own this item
                </p>
              )}
            </div>
          )}

          <PurchaseButton item={item} />

          <Separator />

          <div>
            <p className="text-sm text-muted-foreground mb-2">Artist</p>
            <Button
              variant="outline"
              onClick={() => navigate({ 
                to: '/artist/$principal', 
                params: { principal: item.artist.toString() } 
              })}
            >
              View Artist Profile
            </Button>
          </div>

          {item.purchaseHistory.length > 0 && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium mb-2">Purchase History</p>
                <p className="text-sm text-muted-foreground">
                  {item.purchaseHistory.length} {item.purchaseHistory.length === 1 ? 'sale' : 'sales'}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
