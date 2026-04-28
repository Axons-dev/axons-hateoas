import type { HypermediaAction } from '../model/hypermedia-action';
import type { HypermediaResource } from '../resource/hypermedia-resource';

export interface HypermediaClient {
  /**
   * Loads a hypermedia resource from the provided URL.
   *
   * @param href Absolute or relative URL of the resource to fetch.
   * @returns The parsed hypermedia resource.
   */
  get<TProperties = unknown>(href: string): Promise<HypermediaResource<TProperties>>;

  /**
   * Follows a link relation from an existing resource.
   *
   * @param resource Resource that contains the link relation.
   * @param rel Link relation to follow.
   * @returns The parsed target resource.
   */
  follow<TProperties = unknown>(
    resource: HypermediaResource,
    rel: string,
  ): Promise<HypermediaResource<TProperties>>;

  /**
   * Submits a hypermedia action with an optional payload.
   *
   * @param action Action descriptor exposed by a resource.
   * @param payload Form payload sent for non-GET actions.
   * @returns The parsed resource returned by the action endpoint.
   */
  submit<TProperties = unknown>(
    action: HypermediaAction,
    payload?: Record<string, unknown>,
  ): Promise<HypermediaResource<TProperties>>;
}
