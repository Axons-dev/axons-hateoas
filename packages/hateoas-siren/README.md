# @axonsdev/hateoas-siren

Siren media type support for `@axonsdev/hateoas-core`.

This package defines Siren TypeScript types and a parser that converts Siren entities into the core normalized hypermedia model.

## Responsibilities

- Define Siren entity, link, action, field, and embedded entity types.
- Parse Siren responses into `HypermediaResourceModel`.
- Preserve the original Siren response in `raw`.
- Expose the Siren media type constant.

## Main Exports

```ts
SIREN_MEDIA_TYPE
SirenParser
sirenParser()
SirenEntity
SirenEmbeddedEntity
SirenAction
SirenField
SirenLink
```

## Media Type

```txt
application/vnd.siren+json
```

The parser supports content types that include this media type.

## Basic Usage

```ts
import { createHateoasClient } from '@axonsdev/hateoas-core';
import { fetchTransport } from '@axonsdev/hateoas-fetch';
import { sirenParser } from '@axonsdev/hateoas-siren';

const client = createHateoasClient({
  transport: fetchTransport({ baseUrl: 'http://localhost:3000' }),
  parsers: [sirenParser()],
});
```

## Mapping

Siren maps into the core model like this:

```txt
Siren class      -> resource.classes
Siren properties -> resource.properties
Siren links      -> resource.links
Siren actions    -> resource.actions
Siren entities   -> resource.entities
Original body    -> resource.raw
```

Action fields are mapped into `HypermediaField`:

```txt
name
type
title
value
required
options
```

The `value` field is useful for generic edit forms, where the API can provide the current value directly in the action descriptor.

## Embedded Entities

Siren embedded entities become `HypermediaEmbeddedEntity` values.

Embedded entities are normalized recursively, including their own:

```txt
rel
classes
properties
links
actions
entities
raw
```

## Extending

If the API uses a different hypermedia format, implement `HypermediaParser` in a different package and register that parser with the core client.

This package should remain focused only on Siren.
