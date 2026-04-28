import type { HypermediaAction } from './hypermedia-action';
import type { HypermediaLink } from './hypermedia-link';

export interface HypermediaEmbeddedEntity<TProperties = Record<string, unknown>> {
  rel: string[];
  classes: string[];
  properties: TProperties;
  links: HypermediaLink[];
  actions: HypermediaAction[];
  entities: HypermediaEmbeddedEntity[];
  raw?: unknown;
}

export interface HypermediaResourceModel<TProperties = unknown> {
  classes: string[];
  properties: TProperties;
  links: HypermediaLink[];
  actions: HypermediaAction[];
  entities: HypermediaEmbeddedEntity[];
  raw?: unknown;
}
