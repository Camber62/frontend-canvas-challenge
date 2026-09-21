import { useState, type ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { GraphProvider } from '@/entities/graph';
import { createQueryClient } from '@/shared/lib/queryClient';

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);
  return (
    <QueryClientProvider client={queryClient}>
      <GraphProvider>{children}</GraphProvider>
    </QueryClientProvider>
  );
}
