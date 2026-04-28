import type { HypermediaAction } from '../model/hypermedia-action';
import type { HypermediaField } from '../model/hypermedia-field';
import type { HypermediaResource } from './hypermedia-resource';

export interface HypermediaActionRef {
  readonly name: string;
  readonly title?: string;
  readonly fields: HypermediaField[];
  readonly action: HypermediaAction;

  /**
   * Executes this action with an optional payload.
   *
   * @param payload Form payload sent for non-GET actions.
   * @returns The parsed resource returned by the action endpoint.
   * @throws InvalidActionPayloadError when required fields are missing.
   */
  submit<TResponse = unknown>(
    payload?: Record<string, unknown>,
  ): Promise<HypermediaResource<TResponse>>;
}
