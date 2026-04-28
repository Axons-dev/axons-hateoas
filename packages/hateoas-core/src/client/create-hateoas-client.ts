import { DefaultHateoasClient, type DefaultHateoasClientOptions } from './default-hateoas-client';

/**
 * Creates a HATEOAS client configured with a transport and one or more media type parsers.
 */
export function createHateoasClient(options: DefaultHateoasClientOptions): DefaultHateoasClient {
  return new DefaultHateoasClient(options);
}
