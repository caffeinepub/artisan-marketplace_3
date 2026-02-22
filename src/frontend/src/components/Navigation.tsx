import { Link, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Menu, Upload, Package, User, History, ShoppingBag } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import LoginButton from './LoginButton';

export default function Navigation() {
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const navigate = useNavigate();
  const isAuthenticated = !!identity;

  const navLinks = [
    { to: '/browse', label: 'Browse', icon: ShoppingBag, show: true },
    { to: '/upload', label: 'Upload', icon: Upload, show: isAuthenticated && userProfile?.isArtist },
    { to: '/my-items', label: 'My Items', icon: Package, show: isAuthenticated && userProfile?.isArtist },
    { to: '/purchase-history', label: 'History', icon: History, show: isAuthenticated },
    { to: '/edit-profile', label: 'Profile', icon: User, show: isAuthenticated },
  ];

  const visibleLinks = navLinks.filter(link => link.show);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <h1 className="text-2xl font-serif font-bold text-primary">Artisan</h1>
            </Link>
            
            <nav className="hidden md:flex items-center gap-6">
              {visibleLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                  activeProps={{ className: 'text-primary' }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <LoginButton />
            </div>

            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <nav className="flex flex-col gap-4 mt-8">
                  {visibleLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <button
                        key={link.to}
                        onClick={() => navigate({ to: link.to })}
                        className="flex items-center gap-3 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                      >
                        <Icon className="h-4 w-4" />
                        {link.label}
                      </button>
                    );
                  })}
                  <div className="mt-4 pt-4 border-t">
                    <LoginButton />
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
