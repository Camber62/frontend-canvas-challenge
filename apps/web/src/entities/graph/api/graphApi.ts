import { http } from '@/shared/api';
import type { ApiGraph } from '../model/types';

export function getGraph(spaceId: string, signal?: AbortSignal) {
  return http.request<ApiGraph>({ path: `/api/spaces/${spaceId}/graph` }, signal);
}

export function saveGraph(spaceId: string, graph: ApiGraph, etag: string) {
  return http.request<ApiGraph>({
    path: `/api/spaces/${spaceId}/graph`,
    method: 'PUT',
    body: graph,
    ifMatch: etag,
  });
}
