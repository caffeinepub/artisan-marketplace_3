import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [isArtist, setIsArtist] = useState(false);

  const isAuthenticated = !!identity;

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name);
      setBio(userProfile.bio);
      setIsArtist(userProfile.isArtist);
    }
  }, [userProfile]);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="font-serif">Access Denied</CardTitle>
            <CardDescription>
              You need to be logged in to edit your profile.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate({ to: '/browse' })}>
              Back to Browse
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    try {
      await saveProfile.mutateAsync({
        name: name.trim(),
        bio: bio.trim(),
        isArtist,
      });
      toast.success('Profile updated successfully!');
      navigate({ to: '/browse' });
    } catch (error) {
      console.error('Failed to save profile:', error);
      toast.error('Failed to update profile. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-serif text-4xl font-bold mb-2">Edit Profile</h1>
        <p className="text-muted-foreground mb-8">
          Update your profile information and preferences
        </p>

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              This information will be visible to other users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself"
                  rows={4}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold">Artist Settings</h3>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isArtist"
                    checked={isArtist}
                    onCheckedChange={(checked) => setIsArtist(checked as boolean)}
                  />
                  <Label htmlFor="isArtist" className="cursor-pointer">
                    Enable artist features (upload and sell items)
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Artists can upload items, manage listings, and receive payments from sales.
                </p>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={saveProfile.isPending} className="gap-2">
                  {saveProfile.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate({ to: '/browse' })}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
