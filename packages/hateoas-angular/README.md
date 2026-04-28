# @axons/hateoas-angular

Angular integration for `@axons/hateoas-core`.

This package provides Angular dependency injection helpers and a small signal-based resource store. It does not contain domain-specific UI components.

## Responsibilities

- Register a configured HATEOAS client in Angular DI.
- Provide the `HATEOAS_CLIENT` injection token.
- Provide `HypermediaResourceStore` for common resource loading state.
- Default to fetch transport and Siren parsing while allowing parser overrides.

## Main Exports

```ts
HATEOAS_CLIENT
provideHateoasClient(options)
HypermediaResourceStore
HypermediaResourceState
ProvideHateoasClientOptions
```

## Registering The Client

```ts
import { ApplicationConfig } from '@angular/core';
import { provideHateoasClient } from '@axons/hateoas-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHateoasClient({
      baseUrl: 'http://localhost:3000',
      headers: () => ({
        Authorization: `Bearer ${token()}`,
      }),
    }),
  ],
};
```

By default, `provideHateoasClient` creates:

```txt
createHateoasClient({
  transport: fetchTransport(options),
  parsers: [sirenParser()]
})
```

## Injecting The Client

```ts
import { inject } from '@angular/core';
import { HATEOAS_CLIENT } from '@axons/hateoas-angular';

const client = inject(HATEOAS_CLIENT);
const resource = await client.get('/api/cases/CASE-001');
```

## Custom Parsers

```ts
provideHateoasClient({
  baseUrl: 'http://localhost:3000',
  parsers: [customParser],
});
```

Use this when the API supports another hypermedia format or when Siren parsing needs to be replaced.

## Resource Store

`HypermediaResourceStore<TProperties>` is a small signal-based store for screens that load one resource.

It tracks:

```txt
resource
loading
error
actionRunning
```

Example:

```ts
@Injectable()
export class CaseDetailStore extends HypermediaResourceStore<CaseProperties> {}
```

In a business service:

```ts
this.store.setLoading(true);

try {
  const resource = await this.client.get<CaseProperties>(href);
  this.store.setResource(resource);
} catch (error) {
  this.store.setError(error instanceof Error ? error.message : 'Unknown error');
} finally {
  this.store.setLoading(false);
}
```

## Recommended Layering

Use Angular components for rendering and event binding.

Use feature business services for orchestration:

- call the HATEOAS client;
- submit actions;
- follow links;
- update stores.

Use stores for view state.

This keeps components from hardcoding business rules or API routes.

## Notes

- The package does not include UI components.
- The package does not own routing.
- The package does not impose NgRx or any external state library.
- The default transport is fetch-based through `@axons/hateoas-fetch`.
