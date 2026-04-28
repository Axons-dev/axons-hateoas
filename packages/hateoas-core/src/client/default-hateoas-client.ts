import type { HypermediaAction } from '../model/hypermedia-action';
import type { HypermediaResource } from '../resource/hypermedia-resource';
import type { HypermediaParser } from '../parser/hypermedia-parser';
import type { HypermediaTransport } from '../transport/hypermedia-transport';
import type { HypermediaResponse } from '../transport/hypermedia-response';
import type { HypermediaClient } from './hypermedia-client';
import { DefaultHypermediaResource } from '../resource/default-hypermedia-resource';
import { UnsupportedMediaTypeError } from '../errors/unsupported-media-type.error';

export interface DefaultHateoasClientOptions {
  transport: HypermediaTransport;
  parsers: HypermediaParser[];
  defaultAccept?: string;
}

export class DefaultHateoasClient implements HypermediaClient {
  private readonly defaultAccept: string;

  constructor(private readonly options: DefaultHateoasClientOptions) {
    this.defaultAccept = options.defaultAccept ?? options.parsers[0]?.mediaType ?? 'application/json';
  }

  /**
   * Loads a hypermedia resource from the provided URL.
   *
   * @param href Absolute or relative URL of the resource to fetch.
   * @returns The parsed hypermedia resource.
   */
  async get<TProperties = unknown>(href: string): Promise<HypermediaResource<TProperties>> {
    const response = await this.options.transport.request({
      method: 'GET',
      href,
      headers: {
        Accept: this.defaultAccept,
      },
    });

    return this.parseResponse<TProperties>(response);
  }

  /**
   * Follows a link relation from an existing resource.
   *
   * @param resource Resource that contains the link relation.
   * @param rel Link relation to follow.
   * @returns The parsed target resource.
   */
  async follow<TProperties = unknown>(
    resource: HypermediaResource,
    rel: string,
  ): Promise<HypermediaResource<TProperties>> {
    const link = resource.link(rel);
    return this.get<TProperties>(link.href);
  }

  /**
   * Submits a hypermedia action with an optional payload.
   *
   * @param action Action descriptor exposed by a resource.
   * @param payload Form payload sent for non-GET actions.
   * @returns The parsed resource returned by the action endpoint.
   */
  async submit<TProperties = unknown>(
    action: HypermediaAction,
    payload: Record<string, unknown> = {},
  ): Promise<HypermediaResource<TProperties>> {
    const headers: Record<string, string> = {
      Accept: this.defaultAccept,
    };

    if (action.method !== 'GET') {
      headers['Content-Type'] = action.type ?? 'application/json';
    }

    const response = await this.options.transport.request({
      method: action.method,
      href: action.href,
      headers,
      body: action.method === 'GET' ? undefined : payload,
    });

    return this.parseResponse<TProperties>(response);
  }

  private parseResponse<TProperties>(response: HypermediaResponse): HypermediaResource<TProperties> {
    const parser = this.options.parsers.find((candidate) => candidate.supports(response.contentType));

    if (!parser) {
      throw new UnsupportedMediaTypeError(response.contentType);
    }

    const model = parser.parse<TProperties>(response.body);
    return new DefaultHypermediaResource(model, this);
  }
}
