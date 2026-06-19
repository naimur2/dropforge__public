import { createRootRouteWithContext } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import type { RootState } from '../store';
import { SocketProvider } from '../providers/SocketProvider';
import { ThemeProvider } from '../providers/ThemeProvider';
import { AppLayout } from '../layouts/AppLayout';

// We pass the auth state into the router context so we can use it for protected routes
export interface RouterContext {
  auth: RootState['auth'];
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <ThemeProvider>
      <SocketProvider>
        <AppLayout />
        {process.env.NODE_ENV === 'development' && <TanStackRouterDevtools />}
      </SocketProvider>
    </ThemeProvider>
  ),
});
