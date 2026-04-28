import type { HypermediaRequest } from './hypermedia-request';
import type { HypermediaResponse } from './hypermedia-response';

export interface HypermediaTransport {
  request(input: HypermediaRequest): Promise<HypermediaResponse>;
}
