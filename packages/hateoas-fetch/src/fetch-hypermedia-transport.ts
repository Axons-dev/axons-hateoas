import type { HypermediaRequest, HypermediaResponse, HypermediaTransport } from '@axons/hateoas-core';
import { HypermediaHttpError } from '@axons/hateoas-core';

export interface FetchHypermediaTransportOptions {
  baseUrl?: string;
  credentials?: RequestCredentials;
  headers?: () => Record<string, string> | Promise<Record<string, string>>;
  fetchFn?: typeof fetch;
}

export class FetchHypermediaTransport implements HypermediaTransport {
  private readonly fetchFn: typeof fetch;

  constructor(private readonly options: FetchHypermediaTransportOptions = {}) {
    this.fetchFn = options.fetchFn ?? fetch.bind(globalThis);
  }

  async request(input: HypermediaRequest): Promise<HypermediaResponse> {
    const dynamicHeaders = await this.options.headers?.() ?? {};
    const headers = {
      ...dynamicHeaders,
      ...input.headers,
    };

    const response = await this.fetchFn(this.resolveUrl(input.href), {
      method: input.method,
      headers,
      credentials: this.options.credentials,
      body: input.body === undefined ? undefined : JSON.stringify(input.body),
    });

    const contentType = response.headers.get('content-type') ?? '';
    const body = await this.readBody(response, contentType);
    const normalizedHeaders = this.headersToObject(response.headers);

    if (!response.ok) {
      throw new HypermediaHttpError(response.status, body);
    }

    return {
      status: response.status,
      contentType,
      headers: normalizedHeaders,
      body,
    };
  }

  private resolveUrl(href: string): string {
    if (!this.options.baseUrl) {
      return href;
    }

    return new URL(href, this.options.baseUrl).toString();
  }

  private async readBody(response: Response, contentType: string): Promise<unknown> {
    if (response.status === 204) {
      return undefined;
    }

    if (contentType.includes('json')) {
      return response.json();
    }

    return response.text();
  }

  private headersToObject(headers: Headers): Record<string, string> {
    const output: Record<string, string> = {};
    headers.forEach((value, key) => {
      output[key] = value;
    });
    return output;
  }
}

export function fetchTransport(options: FetchHypermediaTransportOptions = {}): FetchHypermediaTransport {
  return new FetchHypermediaTransport(options);
}
