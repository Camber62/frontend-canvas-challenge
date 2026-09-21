export type ErrorKind = 'network' | 'http' | 'parse';

export type FieldIssue = {
  path: string;
  message: string;
};

export class ApiError extends Error {
  readonly name = 'ApiError';

  constructor(
    readonly kind: ErrorKind,
    readonly status: number | null,
    readonly code: string,
    message: string,
    readonly fields: FieldIssue[] = [],
    readonly requestId: string | null = null,
  ) {
    super(message);
  }
}

export function isApiError(value: unknown): value is ApiError {
  return value instanceof ApiError;
}

export function toApiError(value: unknown): ApiError {
  if (isApiError(value)) return value;
  if (value instanceof Error && value.name === 'AbortError') {
    return new ApiError('network', null, 'ABORTED', 'Запрос отменён.');
  }
  return new ApiError('network', null, 'UNKNOWN', 'Не удалось выполнить запрос.');
}
