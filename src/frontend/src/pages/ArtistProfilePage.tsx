import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetArtistProfile } from '../hooks/useQueries';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Loader2 } from 'lucide-react';
import ItemCard from '../components/ItemCard';
import ItemGrid from '../components/ItemGrid';

export default function ArtistProfilePage() {
  const { principal } = useParams({ from: '/artist/$principal' });
  const navigate = useNavigate();
  const { data: profile, isLoading } = useGetArtistProfile(principal);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <h2 className="font-serif text-2xl font-bold mb-2">Artist Not Found</h2>
            <p className="text-muted-foreground mb-4">
              This artist profile doesn't exist.
            </p>
            <Button onClick={() => navigate({ to: '/browse' })}>
              Back to Browse
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeItems = profile.gallery.filter(
    item => item.owner.toString() === item.artist.toString()
  );

  const soldItems = profile.gallery.filter(
    item => item.owner.toString() !== item.artist.toString()
  );

  const totalSales = soldItems.reduce((sum, item) => sum + Number(item.price), 0);

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

      <Card className="mb-12">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <Avatar className="h-32 w-32">
              <AvatarImage src="/assets/generated/default-avatar.dim_200x200.png" />
              <AvatarFallback className="text-3xl font-serif">
                {profile.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h1 className="font-serif text-4xl font-bold mb-4">{profile.name}</h1>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Active Listings</p>
                  <p className="text-2xl font-bold">{activeItems.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Items Sold</p>
                  <p className="text-2xl font-bold">{soldItems.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Sales</p>
                  <p className="text-2xl font-bold text-primary">${totalSales.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-12">
        <section>
          <h2 className="font-serif text-3xl font-semibold mb-6">Active Listings</h2>
          {activeItems.length === 0 ? (
            <p className="text-muted-foreground">No active listings at the moment.</p>
          ) : (
            <ItemGrid>
              {activeItems.map(item => (
                <ItemCard key={item.id} item={item} />
              ))}
            </ItemGrid>
          )}
        </section>

        {soldItems.length > 0 && (
          <>
            <Separator />
            <section>
              <h2 className="font-serif text-3xl font-semibold mb-6">Sold Items</h2>
              <ItemGrid>
                {soldItems.map(item => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </ItemGrid>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
