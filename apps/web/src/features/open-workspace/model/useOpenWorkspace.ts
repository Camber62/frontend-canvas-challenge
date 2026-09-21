import { useLayoutEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SPACE_KEY } from '@/shared/config';
import { ApiError, toApiError } from '@/shared/api';
import { createSpace, getSpace, listSpaces } from '@/entities/space';
import { fromApiGraph, getGraph, useGraph } from '@/entities/graph';

export const workspaceKeys = {
  current: ['workspace'] as const,
};

async function loadWorkspace(signal?: AbortSignal) {
  const stored = window.localStorage.getItem(SPACE_KEY);
  let id = stored;
  let title = 'Мой канвас';
  if (id) {
    try {
      const space = await getSpace(id, signal);
      title = space.data.title;
    } catch (caught) {
      const next = toApiError(caught);
      if (next.status !== 404) throw next;
      id = null;
    }
  }
  if (!id) {
    const listed = await listSpaces(signal);
    if (listed.data.length > 0) {
      id = listed.data[0].id;
      title = listed.data[0].title;
    } else {
      const created = await createSpace('Мой канвас');
      id = created.data.id;
      title = created.data.title;
    }
    window.localStorage.setItem(SPACE_KEY, id);
  }
  if (!id) {
    throw new ApiError('http', 500, 'SPACE_MISSING', 'Не удалось открыть пространство.');
  }
  const graph = await getGraph(id, signal);
  return {
    spaceId: id,
    title,
    graph: { ...fromApiGraph(graph.data), etag: graph.etag },
  };
}

export function useOpenWorkspace() {
  const { setWorkspace, replaceGraph } = useGraph();
  const query = useQuery({
    queryKey: workspaceKeys.current,
    queryFn: ({ signal }) => loadWorkspace(signal),
    staleTime: Infinity,
  });

  useLayoutEffect(() => {
    if (!query.data) return;
    setWorkspace(query.data.spaceId, query.data.title);
    replaceGraph(query.data.graph);
  }, [query.data, query.dataUpdatedAt, replaceGraph, setWorkspace]);

  return query;
}
