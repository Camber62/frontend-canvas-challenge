import { ApiError } from './error';
import type { PreparedRequest } from './request';

export async function sendRequest(
  prepared: PreparedRequest,
  signal?: AbortSignal,
): Promise<Response> {
  try {
    return await fetch(prepared.url, { ...prepared.init, signal });
  } catch (error) {
    if (signal?.aborted || (error instanceof DOMException && error.name === 'AbortError')) {
      throw error;
    }
    throw new ApiError(
      'network',
      null,
      'NETWORK_ERROR',
      'Нет соединения с сервером. Проверьте, что API запущен.',
    );
  }
}
