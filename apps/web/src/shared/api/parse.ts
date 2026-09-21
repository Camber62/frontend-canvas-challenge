import { ApiError, type FieldIssue } from './error';

export type ParsedSuccess<T> = {
  data: T;
  status: number;
  location: string | null;
  retryAfterMs: number | null;
  etag: string | null;
  requestId: string | null;
};

type ErrorPayload = {
  error?: {
    code?: string;
    message?: string;
    fields?: FieldIssue[];
  };
};

function retryAfterMs(headers: Headers): number | null {
  const raw = headers.get('Retry-After');
  if (!raw) return null;
  const seconds = Number(raw);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
  const date = Date.parse(raw);
  return Number.isFinite(date) ? Math.max(0, date - Date.now()) : null;
}

function hasJsonBody(status: number): boolean {
  return status !== 204 && status !== 304;
}

export async function readBody(response: Response): Promise<unknown> {
  if (!hasJsonBody(response.status)) return undefined;
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new ApiError(
      'parse',
      response.status,
      'INVALID_JSON',
      'Сервер вернул некорректный JSON.',
      [],
      response.headers.get('X-Request-Id'),
    );
  }
}

export function parseError(status: number, body: unknown, requestId: string | null): ApiError {
  const payload = body && typeof body === 'object' ? (body as ErrorPayload) : undefined;
  const error = payload?.error;
  return new ApiError(
    'http',
    status,
    error?.code ?? `HTTP_${status}`,
    error?.message ?? 'Запрос не выполнен.',
    error?.fields ?? [],
    requestId,
  );
}

export function parseEnvelope<T>(status: number, body: unknown, requestId: string | null): T {
  if (!hasJsonBody(status)) return undefined as T;
  if (!body || typeof body !== 'object' || !('data' in body)) {
    throw new ApiError(
      'parse',
      status,
      'INVALID_ENVELOPE',
      'Неожиданный формат ответа.',
      [],
      requestId,
    );
  }
  return (body as { data: T }).data;
}

export function parseDirect<T>(status: number, body: unknown): T {
  if (!hasJsonBody(status)) return undefined as T;
  return body as T;
}

export function responseMeta(response: Response) {
  return {
    location: response.headers.get('Location'),
    retryAfterMs: retryAfterMs(response.headers),
    etag: response.headers.get('ETag'),
    requestId: response.headers.get('X-Request-Id'),
  };
}
