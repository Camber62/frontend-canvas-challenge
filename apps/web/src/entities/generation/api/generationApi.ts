import { http } from '@/shared/api';
import type { Generation } from '../model/types';

export function listGenerations(spaceId: string, signal?: AbortSignal) {
  return http.request<Generation[]>({ path: `/api/spaces/${spaceId}/generations` }, signal);
}

export function createGeneration(
  spaceId: string,
  body: { nodeId: string; graphETag: string; scenario: 'success' | 'failure' },
  key: string,
) {
  return http.request<Generation>({
    path: `/api/spaces/${spaceId}/generations`,
    method: 'POST',
    body,
    idempotencyKey: key,
  });
}

export function getGeneration(spaceId: string, generationId: string, signal?: AbortSignal) {
  return http.request<Generation>(
    { path: `/api/spaces/${spaceId}/generations/${generationId}` },
    signal,
  );
}
