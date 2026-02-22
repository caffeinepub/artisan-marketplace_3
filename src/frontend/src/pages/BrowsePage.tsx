import { useState, useMemo } from 'react';
import { useActor } from '../hooks/useActor';
import { useQuery } from '@tanstack/react-query';
import { Item, ItemType } from '../backend';
import ItemCard from '../components/ItemCard';
import ItemGrid from '../components/ItemGrid';
import EmptyState from '../components/EmptyState';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';

export default function BrowsePage() {
  const { actor, isFetching: actorFetching } = useActor();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Since backend doesn't have getAllItems, we need to track items differently
  // For MVP, we'll show a message that items will appear as they're created
  const { data: items = [], isLoading } = useQuery<Item[]>({
    queryKey: ['items'],
    queryFn: async () => {
      // Backend doesn't expose getAllItems, so we return empty array
      // Items will be shown when users navigate to them directly
      return [];
    },
    enabled: !!actor && !actorFetching,
  });

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'all') return items;
    return items.filter(item => item.itemType === selectedCategory);
  }, [items, selectedCategory]);

  const availableItems = filteredItems.filter(
    item => item.owner.toString() === item.artist.toString()
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[400px] overflow-hidden">
        <img 
          src="/assets/generated/hero-banner.dim_1200x400.png" 
          alt="Artisan Marketplace" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-background/40 flex items-center">
          <div className="container mx-auto px-4">
            <h1 className="font-serif text-5xl md:text-6xl font-bold mb-4 max-w-2xl">
              Discover Unique Artisan Creations
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              Explore handcrafted items, digital art, and exclusive NFTs from talented artists around the world.
            </p>
          </div>
        </div>
      </section>

      {/* Browse Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="font-serif text-3xl font-semibold mb-2">Browse Marketplace</h2>
            <p className="text-muted-foreground">
              {availableItems.length} {availableItems.length === 1 ? 'item' : 'items'} available
            </p>
          </div>

          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value={ItemType.digitalArt}>Digital Art</TabsTrigger>
              <TabsTrigger value={ItemType.physicalProduct}>Physical</TabsTrigger>
              <TabsTrigger value={ItemType.nft}>NFTs</TabsTrigger>
              <TabsTrigger value={ItemType.craftItem}>Crafts</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {availableItems.length === 0 ? (
          <EmptyState
            title="No items yet"
            description="Be the first to list an item on the marketplace! Artists can upload their creations to start selling."
            action={
              <Button onClick={() => window.location.href = '/upload'}>
                Start Selling
              </Button>
            }
          />
        ) : (
          <ItemGrid>
            {availableItems.map(item => (
              <ItemCard key={item.id} item={item} />
            ))}
          </ItemGrid>
        )}
      </section>
    </div>
  );
}
