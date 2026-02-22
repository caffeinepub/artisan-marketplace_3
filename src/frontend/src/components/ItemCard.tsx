import { Item } from '../backend';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from '@tanstack/react-router';
import FilePreview from './FilePreview';

interface ItemCardProps {
  item: Item;
  showActions?: boolean;
}

export default function ItemCard({ item }: ItemCardProps) {
  const navigate = useNavigate();

  const getItemTypeLabel = (itemType: typeof item.itemType) => {
    const labels = {
      digitalArt: 'Digital Art',
      physicalProduct: 'Physical Product',
      nft: 'NFT',
      craftItem: 'Craft Item',
    };
    return labels[itemType];
  };

  const getItemTypeBadgeVariant = (itemType: typeof item.itemType) => {
    const variants = {
      digitalArt: 'default',
      physicalProduct: 'secondary',
      nft: 'outline',
      craftItem: 'default',
    };
    return variants[itemType] as 'default' | 'secondary' | 'outline';
  };

  const isSold = item.owner.toString() !== item.artist.toString();

  return (
    <Card 
      className="overflow-hidden hover:shadow-soft transition-shadow cursor-pointer group"
      onClick={() => navigate({ to: '/item/$itemId', params: { itemId: item.id } })}
    >
      <div className="aspect-square overflow-hidden bg-muted">
        <FilePreview blob={item.blob} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-serif font-semibold text-lg line-clamp-1">{item.title}</h3>
          <Badge variant={getItemTypeBadgeVariant(item.itemType)} className="shrink-0">
            {getItemTypeLabel(item.itemType)}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{item.description}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">Price</span>
          <span className="text-xl font-bold text-primary">${Number(item.price).toFixed(2)}</span>
        </div>
        {isSold && (
          <Badge variant="secondary">Sold</Badge>
        )}
      </CardFooter>
    </Card>
  );
}
