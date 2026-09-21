import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import { ApiError, assetUrl, pollUntil, toApiError } from '@/shared/api';
import { indexBy } from '@/shared/lib/indexBy';
import { generatorChainError, useGraph } from '@/entities/graph';
import {
  createGeneration,
  generationKeys,
  getGeneration,
  isTerminalGeneration,
  latestByResult,
  useGenerationsQuery,
  type Generation,
} from '@/entities/generation';

const retryKeys = new Map<string, string>();
const latestByResultNode = new Map<string, string>();

function claim(generation: Generation, force: boolean): boolean {
  const current = latestByResultNode.get(generation.resultNodeId);
  if (!force && current && current !== generation.id) return false;
  latestByResultNode.set(generation.resultNodeId, generation.id);
  return true;
}

function isLatest(generation: Generation): boolean {
  return latestByResultNode.get(generation.resultNodeId) === generation.id;
}

export function useRunGeneration(flush: () => Promise<void>) {
  const { spaceId, snapshot, updateNodeData, setError } = useGraph();
  const queryClient = useQueryClient();
  const listQuery = useGenerationsQuery(spaceId);

  const applyGeneration = useCallback(
    (generation: Generation) => {
      if (!isLatest(generation)) return;
      const exists = snapshot().nodes.some((node) => node.id === generation.resultNodeId);
      if (!exists) return;
      if (generation.status === 'processing') {
        updateNodeData(
          generation.resultNodeId,
          { status: 'processing', error: null, imageUrl: null },
          false,
        );
        return;
      }
      if (generation.status === 'succeeded') {
        updateNodeData(
          generation.resultNodeId,
          { status: 'succeeded', error: null, imageUrl: assetUrl(generation.imageUrl) },
          false,
        );
        return;
      }
      updateNodeData(
        generation.resultNodeId,
        {
          status: 'failed',
          error:
            generation.failureCode === 'SIMULATED_FAILURE'
              ? 'Тестовый отказ. Можно запустить снова.'
              : 'Генерация не удалась.',
          imageUrl: null,
        },
        false,
      );
    },
    [snapshot, updateNodeData],
  );

  useEffect(() => {
    if (listQuery.error) setError(toApiError(listQuery.error));
  }, [listQuery.error, setError]);

  useEffect(() => {
    if (!listQuery.data) return;
    latestByResult(listQuery.data).forEach((generation) => {
      if (!claim(generation, false)) return;
      applyGeneration(generation);
    });
  }, [applyGeneration, listQuery.data]);

  const processing = useMemo(() => {
    if (!listQuery.data) return [];
    const latest: Generation[] = [];
    latestByResult(listQuery.data).forEach((generation) => {
      if (generation.status === 'processing') latest.push(generation);
    });
    return latest;
  }, [listQuery.data]);

  const watches = useQueries({
    queries: processing.map((generation) => ({
      queryKey: generationKeys.detail(generation.id),
      queryFn: async ({ signal }: { signal: AbortSignal }) =>
        (await getGeneration(spaceId!, generation.id, signal)).data,
      refetchInterval: (query: { state: { data?: Generation } }) => {
        const current = query.state.data;
        if (current && isTerminalGeneration(current.status)) return false;
        return 1500;
      },
    })),
  });

  const watchStamp = watches
    .map((item) => `${item.dataUpdatedAt}:${item.data?.status ?? ''}`)
    .join('|');

  const watchesRef = useRef(watches);
  watchesRef.current = watches;

  useEffect(() => {
    const current = watchesRef.current;
    for (let i = 0; i < current.length; i++) {
      const generation = current[i].data;
      if (!generation) continue;
      applyGeneration(generation);
      if (isTerminalGeneration(generation.status)) {
        retryKeys.delete(`${generation.nodeId}:${generation.scenario}`);
      }
    }
  }, [applyGeneration, watchStamp]);

  const run = useCallback(
    async (nodeId: string, scenario: 'success' | 'failure') => {
      if (!spaceId) return;
      await flush();
      const snap = snapshot();
      if (!snap.etag) {
        throw new ApiError('http', 428, 'PRECONDITION_REQUIRED', 'Сначала сохраните граф.');
      }
      if (!indexBy(snap.nodes, (node) => node.id).get(nodeId)) return;
      const chainError = generatorChainError(snap.nodes, snap.edges, nodeId);
      if (chainError) {
        throw new ApiError('http', 422, 'INCOMPLETE_CHAIN', chainError);
      }

      const key = retryKeys.get(`${nodeId}:${scenario}`) ?? crypto.randomUUID();
      retryKeys.set(`${nodeId}:${scenario}`, key);

      const created = await createGeneration(
        spaceId,
        { nodeId, graphETag: snap.etag, scenario },
        key,
      );
      claim(created.data, true);
      applyGeneration(created.data);
      queryClient.setQueryData(generationKeys.detail(created.data.id), created.data);
      queryClient.setQueryData(
        generationKeys.list(spaceId),
        (current: Generation[] | undefined) =>
          current ? [created.data, ...current] : [created.data],
      );

      try {
        if (!isTerminalGeneration(created.data.status)) {
          const finished = await pollUntil({
            load: async (signal) => {
              const generation = (await getGeneration(spaceId, created.data.id, signal)).data;
              queryClient.setQueryData(generationKeys.detail(generation.id), generation);
              return generation;
            },
            done: (value) => isTerminalGeneration(value.status),
            intervalMs: created.retryAfterMs ?? 1500,
          });
          applyGeneration(finished);
        }
        retryKeys.delete(`${nodeId}:${scenario}`);
      } catch (caught) {
        const error = toApiError(caught);
        if (error.code === 'ABORTED') return;
        throw error;
      }
    },
    [applyGeneration, flush, queryClient, snapshot, spaceId],
  );

  return { run };
}
