'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
            retry: 1, // Reduce from default 3 to prevent retry storms
            retryDelay: 1000, // 1 second fixed delay instead of exponential backoff
          },
        },
        logger: {
          log: console.log,
          warn: console.warn,
          error: (error) => {
            // Log Supabase errors for debugging
            if (error instanceof Error) {
              console.error('React Query Error:', error.message, error);
            } else {
              console.error('React Query Error:', error);
            }
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
