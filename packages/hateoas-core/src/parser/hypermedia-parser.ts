import type { HypermediaResourceModel } from '../model/hypermedia-resource-model';

export interface HypermediaParser {
  readonly mediaType: string;
  supports(contentType: string): boolean;
  parse<TProperties = unknown>(body: unknown): HypermediaResourceModel<TProperties>;
}
