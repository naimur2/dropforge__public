import { RouterProvider, createRouter } from '@tanstack/react-router';
import { useAppSelector } from './store/hooks';
import { SocketProvider } from './providers/SocketProvider';
import { useMeQuery } from './store/apis/auth';
import { Flame } from 'lucide-react';

// Import the generated route tree
import { routeTree } from './routeTree.gen';

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {
    auth: undefined!, // Will be provided dynamically in App
  },
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function App() {
  const { isLoading } = useMeQuery();
  const auth = useAppSelector((state) => state.auth);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Flame className="w-12 h-12 text-primary animate-pulse" />
        <p className="text-muted-foreground mt-4 text-sm font-medium tracking-wider uppercase">Forging Connection...</p>
      </div>
    );
  }

  return (
    <SocketProvider>
      <RouterProvider router={router} context={{ auth }} />
    </SocketProvider>
  );
}

export default App;
