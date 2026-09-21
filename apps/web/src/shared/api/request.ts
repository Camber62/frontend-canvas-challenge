export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export type RequestInput = {
  path: string;
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  token?: string | null;
  idempotencyKey?: string;
  ifMatch?: string;
};

export type PreparedRequest = {
  url: string;
  init: RequestInit;
};

export function joinUrl(baseUrl: string, path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export function prepareRequest(baseUrl: string, input: RequestInput): PreparedRequest {
  const headers = new Headers(input.headers);
  if (input.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (input.token) headers.set('Authorization', `Bearer ${input.token}`);
  if (input.idempotencyKey) headers.set('Idempotency-Key', input.idempotencyKey);
  if (input.ifMatch) headers.set('If-Match', input.ifMatch);

  return {
    url: joinUrl(baseUrl, input.path),
    init: {
      method: input.method ?? 'GET',
      headers,
      body: input.body === undefined ? undefined : JSON.stringify(input.body),
    },
  };
}
