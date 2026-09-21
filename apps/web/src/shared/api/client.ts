import { prepareRequest, type RequestInput } from './request';
import { sendRequest } from './transport';
import {
  parseDirect,
  parseEnvelope,
  parseError,
  readBody,
  responseMeta,
  type ParsedSuccess,
} from './parse';

export type ClientOptions = {
  baseUrl: string;
  envelope: boolean;
  getToken?: () => string | null;
};

export type Client = {
  request<T>(input: RequestInput, signal?: AbortSignal): Promise<ParsedSuccess<T>>;
};

export function createClient(options: ClientOptions): Client {
  return {
    async request<T>(input: RequestInput, signal?: AbortSignal): Promise<ParsedSuccess<T>> {
      const prepared = prepareRequest(options.baseUrl, {
        ...input,
        token: input.token === undefined ? options.getToken?.() : input.token,
      });
      const response = await sendRequest(prepared, signal);
      const body = await readBody(response);
      const meta = responseMeta(response);
      if (!response.ok) throw parseError(response.status, body, meta.requestId);
      const data = options.envelope
        ? parseEnvelope<T>(response.status, body, meta.requestId)
        : parseDirect<T>(response.status, body);
      return { data, status: response.status, ...meta };
    },
  };
}
