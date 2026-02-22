import { useState, useEffect } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfileSetupModal() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();
  
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [isArtist, setIsArtist] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  // Clear error when modal closes
  useEffect(() => {
    if (!showProfileSetup) {
      setErrorDetails(null);
    }
  }, [showProfileSetup]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorDetails(null);
    
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    console.log('[ProfileSetupModal] Submitting profile:', {
      name: name.trim(),
      bioLength: bio.trim().length,
      isArtist,
      hasIdentity: !!identity,
      principalId: identity?.getPrincipal().toString(),
    });

    try {
      await saveProfile.mutateAsync({
        name: name.trim(),
        bio: bio.trim(),
        isArtist,
      });
      
      console.log('[ProfileSetupModal] Profile created successfully');
      toast.success('Profile created successfully! Welcome to Artisan!');
      
      // Clear form
      setName('');
      setBio('');
      setIsArtist(false);
    } catch (error) {
      console.error('[ProfileSetupModal] Failed to save profile:', {
        error,
        errorType: error?.constructor?.name,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });

      const errorMessage = error instanceof Error ? error.message : 'Failed to create profile. Please try again.';
      setErrorDetails(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={showProfileSetup}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Welcome to Artisan!</DialogTitle>
          <DialogDescription>
            Let's set up your profile to get started.
          </DialogDescription>
        </DialogHeader>
        
        {errorDetails && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {errorDetails}
              <div className="mt-2 text-xs opacity-80">
                If this issue persists, try:
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Refreshing the page</li>
                  <li>Logging out and logging back in</li>
                  <li>Checking your internet connection</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              disabled={saveProfile.isPending}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bio">Bio (optional)</Label>
            <Input
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself"
              disabled={saveProfile.isPending}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isArtist"
              checked={isArtist}
              onCheckedChange={(checked) => setIsArtist(checked as boolean)}
              disabled={saveProfile.isPending}
            />
            <Label htmlFor="isArtist" className="cursor-pointer">
              I want to sell items as an artist
            </Label>
          </div>

          <Button type="submit" className="w-full" disabled={saveProfile.isPending}>
            {saveProfile.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Profile...
              </>
            ) : (
              'Create Profile'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
