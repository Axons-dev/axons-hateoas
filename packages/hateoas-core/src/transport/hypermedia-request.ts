import type { HttpMethod } from '../model/http-method';

export interface HypermediaRequest {
  method: HttpMethod;
  href: string;
  headers?: Record<string, string>;
  body?: unknown;
}
