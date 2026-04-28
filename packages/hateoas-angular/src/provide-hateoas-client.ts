import type { Provider } from '@angular/core';
import { createHateoasClient, type HypermediaParser } from '@axonsdev/hateoas-core';
import { fetchTransport, type FetchHypermediaTransportOptions } from '@axonsdev/hateoas-fetch';
import { sirenParser } from '@axonsdev/hateoas-siren';
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
