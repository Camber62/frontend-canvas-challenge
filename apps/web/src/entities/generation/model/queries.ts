import { useQuery } from '@tanstack/react-query';
import { getGeneration, listGenerations } from '../api/generationApi';
import { isTerminalGeneration } from './types';

export const generationKeys = {
  list: (spaceId: string) => ['generations', spaceId] as const,
  detail: (generationId: string) => ['generation', generationId] as const,
};

export function useGenerationsQuery(spaceId: string | null) {
  return useQuery({
    queryKey: generationKeys.list(spaceId ?? ''),
    queryFn: async ({ signal }) => (await listGenerations(spaceId!, signal)).data,
    enabled: Boolean(spaceId),
  });
}

export function useGenerationQuery(
  spaceId: string | null,
  generationId: string | null,
  intervalMs: number,
) {
  return useQuery({
    queryKey: generationKeys.detail(generationId ?? ''),
    queryFn: async ({ signal }) => (await getGeneration(spaceId!, generationId!, signal)).data,
    enabled: Boolean(spaceId && generationId),
    refetchInterval: (query) => {
      const generation = query.state.data;
      if (generation && isTerminalGeneration(generation.status)) return false;
      return intervalMs;
    },
  });
}
