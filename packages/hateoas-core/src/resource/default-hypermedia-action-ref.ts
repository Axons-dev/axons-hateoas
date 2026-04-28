import type { HypermediaAction } from '../model/hypermedia-action';
import type { HypermediaClient } from '../client/hypermedia-client';
import type { HypermediaResource } from './hypermedia-resource';
import type { HypermediaActionRef } from './hypermedia-action-ref';
import { InvalidActionPayloadError } from '../errors/invalid-action-payload.error';

export class DefaultHypermediaActionRef implements HypermediaActionRef {
  constructor(
    readonly action: HypermediaAction,
    private readonly client: HypermediaClient,
  ) {}

  get name(): string {
    return this.action.name;
  }

  get title(): string | undefined {
    return this.action.title;
  }

  get fields() {
    return this.action.fields;
  }

  /**
   * Executes this action with an optional payload.
   *
   * @param payload Form payload sent for non-GET actions.
   * @returns The parsed resource returned by the action endpoint.
   * @throws InvalidActionPayloadError when required fields are missing.
   */
  async submit<TResponse = unknown>(
    payload: Record<string, unknown> = {},
  ): Promise<HypermediaResource<TResponse>> {
    const missingFields = this.action.fields
      .filter((field) => field.required)
      .filter((field) => payload[field.name] === undefined || payload[field.name] === null || payload[field.name] === '')
      .map((field) => field.name);

    if (missingFields.length > 0) {
      throw new InvalidActionPayloadError(this.action.name, missingFields);
    }

    return this.client.submit<TResponse>(this.action, payload);
  }
}
