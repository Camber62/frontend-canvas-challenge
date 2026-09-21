import { API_URL } from '@/shared/config';
import { createClient } from './client';
import { joinUrl } from './request';

export { ApiError, isApiError, toApiError } from './error';
export { pollUntil } from './poll';
export { joinUrl } from './request';
export type { ParsedSuccess } from './parse';

export const http = createClient({
  baseUrl: API_URL,
  envelope: false,
});

export function assetUrl(path: string | null): string | null {
  if (!path) return null;
  return joinUrl(API_URL, path);
}
