import type { HypermediaClient } from '../client/hypermedia-client';
import type { HypermediaAction } from '../model/hypermedia-action';
import type { HypermediaEmbeddedEntity, HypermediaResourceModel } from '../model/hypermedia-resource-model';
import type { HypermediaLink } from '../model/hypermedia-link';
import type { HypermediaActionRef } from './hypermedia-action-ref';
import type { HypermediaResource } from './hypermedia-resource';
import { ActionNotFoundError } from '../errors/action-not-found.error';
import { LinkNotFoundError } from '../errors/link-not-found.error';
import { DefaultHypermediaActionRef } from './default-hypermedia-action-ref';

export class DefaultHypermediaResource<TProperties = unknown> implements HypermediaResource<TProperties> {
  readonly classes: string[];
  readonly properties: TProperties;
  readonly links: HypermediaLink[];
  readonly actions: HypermediaAction[];
  readonly entities: HypermediaEmbeddedEntity[];
  readonly raw?: unknown;

  constructor(
    model: HypermediaResourceModel<TProperties>,
    private readonly client: HypermediaClient,
  ) {
    this.classes = model.classes;
    this.properties = model.properties;
    this.links = model.links;
    this.actions = model.actions;
    this.entities = model.entities;
    this.raw = model.raw;
  }

  /**
   * Checks whether this resource exposes a link with the provided relation.
   */
  hasLink(rel: string): boolean {
    return this.links.some((link) => link.rel.includes(rel));
  }

  /**
   * Returns the first link that matches the provided relation.
   *
   * @throws LinkNotFoundError when no matching link exists.
   */
  link(rel: string): HypermediaLink {
    const found = this.links.find((link) => link.rel.includes(rel));

    if (!found) {
      throw new LinkNotFoundError(rel);
    }

    return found;
  }

  /**
   * Follows the first link that matches the provided relation.
   *
   * @returns The parsed target resource.
   * @throws LinkNotFoundError when no matching link exists.
   */
  async follow<TNext = unknown>(rel: string): Promise<HypermediaResource<TNext>> {
    return this.client.follow<TNext>(this, rel);
  }

  /**
   * Checks whether this resource exposes an action with the provided name.
   */
  hasAction(name: string): boolean {
    return this.actions.some((action) => action.name === name);
  }

  /**
   * Returns an executable reference to the named action.
   *
   * @throws ActionNotFoundError when no matching action exists.
   */
  action(name: string): HypermediaActionRef {
    const found = this.actions.find((action) => action.name === name);

    if (!found) {
      throw new ActionNotFoundError(name);
    }

    return new DefaultHypermediaActionRef(found, this.client);
  }

  /**
   * Serializes this resource back to its normalized model representation.
   */
  toJSON(): HypermediaResourceModel<TProperties> {
    return {
      classes: this.classes,
      properties: this.properties,
      links: this.links,
      actions: this.actions,
      entities: this.entities,
      raw: this.raw,
    };
  }

  withModel(model: HypermediaResourceModel<TProperties>): DefaultHypermediaResource<TProperties> {
    return new DefaultHypermediaResource(model, this.client);
  }
}
