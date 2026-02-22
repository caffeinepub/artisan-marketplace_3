import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginButton() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const disabled = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      console.log('[LoginButton] Logging out...');
      try {
        await clear();
        queryClient.clear();
        console.log('[LoginButton] Logout successful');
        toast.success('Logged out successfully');
      } catch (error) {
        console.error('[LoginButton] Logout error:', {
          error,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        });
        toast.error('Failed to logout. Please try again.');
      }
    } else {
      console.log('[LoginButton] Logging in...');
      try {
        await login();
        console.log('[LoginButton] Login successful');
      } catch (error: any) {
        console.error('[LoginButton] Login error:', {
          error,
          errorType: error?.constructor?.name,
          errorMessage: error?.message,
          errorStack: error?.stack,
        });

        // Handle specific error cases
        if (error.message === 'User is already authenticated') {
          console.log('[LoginButton] User already authenticated, clearing and retrying...');
          toast.info('Refreshing authentication...');
          await clear();
          setTimeout(() => login(), 300);
        } else if (error.message?.includes('User interrupted')) {
          console.log('[LoginButton] User cancelled login');
          // Don't show error for user cancellation
        } else {
          toast.error('Failed to login. Please try again.');
        }
      }
    }
  };

  return (
    <Button
      onClick={handleAuth}
      disabled={disabled}
      variant={isAuthenticated ? 'outline' : 'default'}
      className="gap-2"
    >
      {disabled ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Logging in...
        </>
      ) : isAuthenticated ? (
        <>
          <LogOut className="h-4 w-4" />
          Logout
        </>
      ) : (
        <>
          <LogIn className="h-4 w-4" />
          Login
        </>
      )}
    </Button>
  );
}
