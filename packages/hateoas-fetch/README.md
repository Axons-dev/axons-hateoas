# @axons/hateoas-fetch

Fetch-based transport for `@axons/hateoas-core`.

This package adapts the platform `fetch` API to the `HypermediaTransport` contract. It is usable in browsers, Node runtimes that provide `fetch`, and tests that inject a custom `fetchFn`.

## Responsibilities

- Resolve relative URLs against an optional `baseUrl`.
- Add dynamic headers before each request.
- Pass credentials to `fetch`.
- Serialize request bodies as JSON.
- Normalize response headers, content type, status, and body.
- Throw `HypermediaHttpError` for non-2xx responses.

## Main Exports

```ts
fetchTransport(options)
FetchHypermediaTransport
FetchHypermediaTransportOptions
```

## Basic Usage

```ts
import { createHateoasClient } from '@axons/hateoas-core';
import { fetchTransport } from '@axons/hateoas-fetch';
import { sirenParser } from '@axons/hateoas-siren';

const client = createHateoasClient({
  transport: fetchTransport({
    baseUrl: 'http://localhost:3000',
  }),
  parsers: [sirenParser()],
});
```

## Options

```ts
interface FetchHypermediaTransportOptions {
  baseUrl?: string;
  credentials?: RequestCredentials;
  headers?: () => Record<string, string> | Promise<Record<string, string>>;
  fetchFn?: typeof fetch;
}
```

### `baseUrl`

Used to resolve relative hrefs.

```ts
fetchTransport({
  baseUrl: 'https://api.example.com',
});
```

A request to `/api/cases` becomes `https://api.example.com/api/cases`.

### `credentials`

Passed through to `fetch`.

```ts
fetchTransport({
  credentials: 'include',
});
```

### `headers`

Called before every request. This is useful for auth tokens, tenant IDs, or demo role headers.

```ts
fetchTransport({
  headers: () => ({
    Authorization: `Bearer ${tokenStore.current()}`,
  }),
});
```

The transport merges dynamic headers with request-specific headers from the HATEOAS client. Request-specific headers win when keys overlap.

### `fetchFn`

Inject a custom fetch implementation.

```ts
fetchTransport({
  fetchFn: testFetch,
});
```

This is useful in tests or runtimes where `globalThis.fetch` is not available.

## Response Handling

The transport reads the body as JSON when the content type includes `json`.

Otherwise, it reads the body as text.

`204 No Content` returns `undefined` as the body.

## Error Handling

Non-OK responses throw:

```ts
new HypermediaHttpError(response.status, body)
```

The parsed body is attached to the error so application code can inspect API error details.

## Implementation Note

The default `fetch` is bound with `fetch.bind(globalThis)`. Browser `fetch` can throw `Illegal invocation` when called after being detached from `window`; binding avoids that runtime failure.
