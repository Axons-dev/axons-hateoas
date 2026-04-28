import type { Provider } from '@angular/core';
import { createHateoasClient, type HypermediaParser } from '@axons/hateoas-core';
import { fetchTransport, type FetchHypermediaTransportOptions } from '@axons/hateoas-fetch';
import { sirenParser } from '@axons/hateoas-siren';
import { HATEOAS_CLIENT } from './hateoas-client.token';

export interface ProvideHateoasClientOptions extends FetchHypermediaTransportOptions {
  parsers?: HypermediaParser[];
}

/**
 * Registers a configured HATEOAS client in Angular dependency injection.
 */
export function provideHateoasClient(options: ProvideHateoasClientOptions = {}): Provider {
  return {
    provide: HATEOAS_CLIENT,
    useFactory: () =>
      createHateoasClient({
        transport: fetchTransport(options),
        parsers: options.parsers ?? [sirenParser()],
      }),
  };
}
