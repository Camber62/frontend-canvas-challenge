import { http } from '@/shared/api';
import type { ApiConfig, Space } from '../model/types';

export function getConfig() {
  return http.request<ApiConfig>({ path: '/api/config' });
}

export function listSpaces(signal?: AbortSignal) {
  return http.request<Space[]>({ path: '/api/spaces' }, signal);
}

export function createSpace(title: string) {
  return http.request<Space>({ path: '/api/spaces', method: 'POST', body: { title } });
}

export function getSpace(spaceId: string, signal?: AbortSignal) {
  return http.request<Space>({ path: `/api/spaces/${spaceId}` }, signal);
}
