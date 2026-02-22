import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import Layout from './components/Layout';
import BrowsePage from './pages/BrowsePage';
import UploadPage from './pages/UploadPage';
import MyItemsPage from './pages/MyItemsPage';
import ArtistProfilePage from './pages/ArtistProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import PurchaseConfirmationPage from './pages/PurchaseConfirmationPage';
import PurchaseHistoryPage from './pages/PurchaseHistoryPage';
import ItemDetailPage from './pages/ItemDetailPage';

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: BrowsePage,
});

const browseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/browse',
  component: BrowsePage,
});

const uploadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/upload',
  component: UploadPage,
});

const myItemsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/my-items',
  component: MyItemsPage,
});

const artistProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/artist/$principal',
  component: ArtistProfilePage,
});

const editProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/edit-profile',
  component: EditProfilePage,
});

const purchaseConfirmationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/purchase-confirmation/$itemId',
  component: PurchaseConfirmationPage,
});

const purchaseHistoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/purchase-history',
  component: PurchaseHistoryPage,
});

const itemDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/item/$itemId',
  component: ItemDetailPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  browseRoute,
  uploadRoute,
  myItemsRoute,
  artistProfileRoute,
  editProfileRoute,
  purchaseConfirmationRoute,
  purchaseHistoryRoute,
  itemDetailRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
