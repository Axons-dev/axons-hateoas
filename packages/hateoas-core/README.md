# @axonsdev/hateoas-core

Framework-agnostic TypeScript core for consuming hypermedia APIs.

This package contains no Siren, Angular, NestJS, or fetch-specific code. It defines the client contracts, normalized resource model, action execution model, transport abstraction, parser abstraction, and common errors.

## Responsibilities

- Load hypermedia resources through a pluggable transport.
- Parse responses through one or more media type parsers.
- Represent resources with normalized links, actions, embedded entities, and properties.
- Follow links by relation.
- Submit actions returned by the API.
- Keep framework-specific concerns out of the core client.

## Main Exports

```ts
createHateoasClient(options)
DefaultHateoasClient
HypermediaClient
HypermediaResource
HypermediaActionRef
HypermediaParser
HypermediaTransport
HypermediaRequest
HypermediaResponse
HypermediaResourceModel
HypermediaAction
HypermediaField
HypermediaLink
```

Errors:

```ts
ActionNotFoundError
HypermediaHttpError
InvalidActionPayloadError
LinkNotFoundError
UnsupportedMediaTypeError
```

## Client Construction

```ts
import { createHateoasClient } from '@axonsdev/hateoas-core';
import { fetchTransport } from '@axonsdev/hateoas-fetch';
import { sirenParser } from '@axonsdev/hateoas-siren';

const client = createHateoasClient({
  transport: fetchTransport({
    baseUrl: 'http://localhost:3000',
  }),
  parsers: [sirenParser()],
});
```

`createHateoasClient` returns a `DefaultHateoasClient`.

## Loading Resources

```ts
const resource = await client.get<{ id: string; title: string }>('/api/cases/CASE-001');

console.log(resource.properties.title);
```

The client:

1. sends a `GET` request through the configured transport;
2. selects a parser by `content-type`;
3. normalizes the response into a `HypermediaResource`.

If no parser supports the response media type, `UnsupportedMediaTypeError` is thrown.

## Following Links

```ts
if (resource.hasLink('collection')) {
  const collection = await resource.follow('collection');
}
```

`resource.link(rel)` returns the first matching link.

`resource.follow(rel)` delegates back to the client. The resource itself does not know HTTP details; it only keeps a reference to the client that created it.

If the link is missing, `LinkNotFoundError` is thrown.

## Submitting Actions

```ts
if (resource.hasAction('approve')) {
  const updated = await resource.action('approve').submit();
}
```

With payload:

```ts
await resource.action('edit').submit({
  title: 'Updated title',
});
```

`HypermediaActionRef.submit()` validates required fields before sending the request. Missing required fields throw `InvalidActionPayloadError`.

The client uses:

- the action method;
- the action href;
- the action type as `Content-Type` for non-GET actions;
- the configured default `Accept` media type.

## Normalized Resource Model

The core model is intentionally media-type neutral:

```ts
interface HypermediaResourceModel<TProperties = unknown> {
  classes: string[];
  properties: TProperties;
  links: HypermediaLink[];
  actions: HypermediaAction[];
  entities: HypermediaEmbeddedEntity[];
  raw?: unknown;
}
```

Parsers convert media-specific representations into this model.

## Transport Contract

```ts
interface HypermediaTransport {
  request(input: HypermediaRequest): Promise<HypermediaResponse>;
}
```

The transport is responsible for HTTP, credentials, headers, body serialization, and low-level failures. The core client only expects a normalized response.

## Parser Contract

```ts
interface HypermediaParser {
  readonly mediaType: string;
  supports(contentType: string): boolean;
  parse<TProperties = unknown>(body: unknown): HypermediaResourceModel<TProperties>;
}
```

Multiple parsers can be registered. The first parser whose `supports(...)` returns `true` is used.

## Extending

Add a new media type by implementing `HypermediaParser`.

Add a new runtime transport by implementing `HypermediaTransport`.

Build framework bindings by wrapping the `HypermediaClient` with dependency injection, hooks, signals, stores, or context providers.

## Notes

- The package does not perform authentication.
- The package does not impose a routing framework.
- Embedded entities are normalized but are not full client-backed resources by default.
- Action availability must come from the API representation, not client-side business rules.
