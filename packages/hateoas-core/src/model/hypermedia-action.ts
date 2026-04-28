import type { HttpMethod } from './http-method';
import type { HypermediaField } from './hypermedia-field';

export interface HypermediaAction {
  name: string;
  title?: string;
  method: HttpMethod;
  href: string;
  type?: string;
  fields: HypermediaField[];
}
