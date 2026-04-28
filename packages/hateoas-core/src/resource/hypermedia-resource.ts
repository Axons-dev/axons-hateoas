import type { HypermediaAction } from '../model/hypermedia-action';
import type { HypermediaEmbeddedEntity, HypermediaResourceModel } from '../model/hypermedia-resource-model';
import type { HypermediaLink } from '../model/hypermedia-link';
import type { HypermediaActionRef } from './hypermedia-action-ref';

export interface HypermediaResource<TProperties = unknown> {
  readonly classes: string[];
  readonly properties: TProperties;
  readonly links: HypermediaLink[];
  readonly actions: HypermediaAction[];
  readonly entities: HypermediaEmbeddedEntity[];
  readonly raw?: unknown;

  /**
   * Checks whether this resource exposes a link with the provided relation.
   */
  hasLink(rel: string): boolean;

  /**
   * Returns the first link that matches the provided relation.
   *
   * @throws LinkNotFoundError when no matching link exists.
   */
  link(rel: string): HypermediaLink;

  /**
   * Follows the first link that matches the provided relation.
   *
   * @returns The parsed target resource.
   * @throws LinkNotFoundError when no matching link exists.
   */
  follow<TNext = unknown>(rel: string): Promise<HypermediaResource<TNext>>;

  /**
   * Checks whether this resource exposes an action with the provided name.
   */
  hasAction(name: string): boolean;

  /**
   * Returns an executable reference to the named action.
   *
   * @throws ActionNotFoundError when no matching action exists.
   */
  action(name: string): HypermediaActionRef;

  /**
   * Serializes this resource back to its normalized model representation.
   */
  toJSON(): HypermediaResourceModel<TProperties>;
}
