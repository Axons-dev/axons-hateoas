import { describe, expect, it } from 'vitest';
import { HATEOAS_CLIENT } from './hateoas-client.token';
import { provideHateoasClient } from './provide-hateoas-client';

describe('provideHateoasClient', () => {
  it('registers the HATEOAS client token with a factory provider', () => {
    const provider = provideHateoasClient({ baseUrl: 'http://localhost:3000' }) as {
      provide: unknown;
      useFactory: () => unknown;
    };

    expect(provider.provide).toBe(HATEOAS_CLIENT);
    expect(typeof provider.useFactory).toBe('function');
  });

  it('creates a client that can be used through the token provider', async () => {
    const provider = provideHateoasClient({
      baseUrl: 'https://api.example.com',
      fetchFn: (async () => new Response(JSON.stringify({
        class: ['case'],
        properties: { id: 'CASE-001' },
        links: [],
        actions: [],
        entities: [],
      }), {
        status: 200,
        headers: { 'content-type': 'application/vnd.siren+json' },
      })) as typeof fetch,
    }) as unknown as {
      useFactory: () => {
        get<TProperties>(href: string): Promise<{ properties: TProperties }>;
      };
    };

    const client = provider.useFactory();
    const resource = await client.get<{ id: string }>('/api/cases/CASE-001');

    expect(resource.properties).toEqual({ id: 'CASE-001' });
  });
});
