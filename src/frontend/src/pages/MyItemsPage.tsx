import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useQuery } from '@tanstack/react-query';
import { useActor } from '../hooks/useActor';
import { Item } from '../backend';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import ItemCard from '../components/ItemCard';
import ItemGrid from '../components/ItemGrid';
import EmptyState from '../components/EmptyState';
import { Loader2 } from 'lucide-react';

export default function MyItemsPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { actor, isFetching: actorFetching } = useActor();

  const isAuthenticated = !!identity;
  const isArtist = userProfile?.isArtist;

  const { data: myItems = [], isLoading } = useQuery<Item[]>({
    queryKey: ['myItems'],
    queryFn: async () => {
      // Backend doesn't expose getMyItems, return empty for MVP
      return [];
    },
    enabled: !!actor && !actorFetching && isAuthenticated && isArtist,
  });

  if (!isAuthenticated || !isArtist) {
    return (
      <div className="container mx-auto px-4 py-16">
        <EmptyState
          title="Artist Access Required"
          description="You need to be logged in as an artist to view your items."
          action={
            <Button onClick={() => navigate({ to: '/edit-profile' })}>
              Set Up Artist Profile
            </Button>
          }
        />
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

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-serif text-4xl font-bold mb-2">My Items</h1>
          <p className="text-muted-foreground">
            Manage your listings and track sales
          </p>
        </div>
        <Button onClick={() => navigate({ to: '/upload' })}>
          Upload New Items
        </Button>
      </div>

      {myItems.length === 0 ? (
        <EmptyState
          title="No items yet"
          description="Start by uploading your first item to the marketplace."
          action={
            <Button onClick={() => navigate({ to: '/upload' })}>
              Upload Items
            </Button>
          }
        />
      ) : (
        <ItemGrid>
          {myItems.map(item => (
            <ItemCard key={item.id} item={item} showActions />
          ))}
        </ItemGrid>
      )}
    </div>
  );
}
