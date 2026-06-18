import { RouterProvider, createRouter } from '@tanstack/react-router';
import { useAppSelector } from './store/hooks';
import { SocketProvider } from './providers/SocketProvider';

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
  const auth = useAppSelector((state) => state.auth);

  return (
    <SocketProvider>
      <RouterProvider router={router} context={{ auth }} />
    </SocketProvider>
  );
}

export default App;
