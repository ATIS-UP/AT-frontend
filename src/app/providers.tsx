import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router } from './router';
import { ToastContainer } from '../shared/components/ui/Toast';
import { useAuthStore } from '../features/auth/store/auth.store';

const queryClient = new QueryClient();

function AppInitializer({ children }: { children: React.ReactNode }) {
  const restoreSession = useAuthStore((s) => s.restoreSession);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  return <>{children}</>;
}

export function Providers() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInitializer>
        <RouterProvider router={router} />
        <ToastContainer />
      </AppInitializer>
    </QueryClientProvider>
  );
}