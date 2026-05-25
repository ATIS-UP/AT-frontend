import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { router } from './router';
import { ToastContainer } from '../shared/components/ui/Toast';
import { useAuthStore } from '../features/auth/store/auth.store';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});

function AppInitializer({ children }: { children: React.ReactNode }) {
  const restoreSession = useAuthStore((s) => s.restoreSession);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  return <>{children}</>;
}

export function Providers() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AppInitializer>
          <RouterProvider router={router} />
          <ToastContainer />
        </AppInitializer>
      </QueryClientProvider>
    </HelmetProvider>
  );
}