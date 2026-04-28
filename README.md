# Axons HATEOAS Demo

This repository is a first demo foundation for:

1. exposing a NestJS API with a real hypermedia format, using Siren;
2. consuming that API with a framework-agnostic TypeScript HATEOAS client;
3. integrating the client into Angular without recoding business rules on the frontend;
4. preparing similar integrations for React, Next.js, Vue, Svelte, React Native, and other runtimes.

The repository is intentionally structured like a reusable library, not like a one-off Angular/NestJS demo.

## Structure

```txt
apps/
├── api                     # Demo NestJS API
└── angular-demo            # Demo Angular frontend

packages/
├── hateoas-core            # Generic hypermedia client
├── hateoas-siren           # Siren parser -> normalized model
├── hateoas-fetch           # Fetch HTTP transport
├── hateoas-angular         # Angular integration
├── hateoas-nestjs          # Siren response composition for NestJS
└── hateoas-nestjs-typeorm  # Optional assisted TypeORM discovery
```

## Principle

The frontend should not need to know business routes such as:

```ts
POST /api/cases/:id/approve
```

It should consume a resource:

```ts
const resource = await client.get('/api/cases/CASE-001');
await resource.action('approve').submit();
```

The `approve` action exists only when the API exposes it in the Siren representation.

## Hypermedia Format

This repository uses **Siren** as its first supported format.

Expected content type:

```txt
application/vnd.siren+json
```

Example response:

```json
{
  "class": ["case"],
  "properties": {
    "id": "CASE-001",
    "title": "Supplier validation",
    "status": "IN_REVIEW"
  },
  "actions": [
    {
      "name": "approve",
      "title": "Approve",
      "method": "POST",
      "href": "/api/cases/CASE-001/approve",
      "type": "application/json",
      "fields": []
    }
  ],
  "links": [
    { "rel": ["self"], "href": "/api/cases/CASE-001" },
    { "rel": ["collection"], "href": "/api/cases" }
  ]
}
```

## Business Demos

The first domain is intentionally simple but richer than a todo list: a **case validation workflow**.

Statuses:

```txt
DRAFT
SUBMITTED
IN_REVIEW
APPROVED
REJECTED
CHANGES_REQUESTED
ARCHIVED
```

Demo roles:

```txt
CREATOR
REVIEWER
ADMIN
```

Available actions are computed by the API through `CaseTransitionPolicy`, then exposed in the Siren response.

The second domain is a **social feed** with posts, users, and comments. Post authors can edit or delete their own posts and moderate comments. Other users can read posts, create comments, and edit or delete only their own comments.

## Run The Project

Install:

```bash
pnpm install
```

Start the API:

```bash
pnpm start:api
```

Start Angular:

```bash
pnpm start:web
```

By default:

```txt
API:     http://localhost:3000
Angular: http://localhost:4200
```

## Important Files

### Generic Client

```txt
packages/hateoas-core/src/client/default-hateoas-client.ts
packages/hateoas-core/src/resource/default-hypermedia-resource.ts
packages/hateoas-core/src/resource/default-hypermedia-action-ref.ts
```

### Siren Parser

```txt
packages/hateoas-siren/src/siren-parser.ts
```

### Fetch Transport

```txt
packages/hateoas-fetch/src/fetch-hypermedia-transport.ts
```

### Angular Integration

```txt
packages/hateoas-angular/src/hateoas-client.token.ts
packages/hateoas-angular/src/provide-hateoas-client.ts
packages/hateoas-angular/src/hypermedia-resource-store.ts
```

### NestJS Composition

```txt
packages/hateoas-nestjs/src/registry/resource-definition.ts
packages/hateoas-nestjs/src/composer/hypermedia-composer.ts
packages/hateoas-nestjs/src/hateoas.service.ts
```

### Business Resource Declarations

```txt
apps/api/src/cases/hypermedia/case.resource.ts
apps/api/src/social/hypermedia/social.resource.ts
```

## What The Demo Shows

- The backend exposes available business transitions.
- The frontend displays the actions returned by the API.
- The HATEOAS client is not coupled to Angular.
- Angular consumes the client through a dedicated integration.
- The NestJS package simplifies Siren response composition.
- The TypeORM integration is planned as assisted discovery, without unsafe automatic exposure.

## What The Demo Does Not Do Yet

- No real database persistence.
- No Auth0 authentication.
- No advanced content negotiation.
- No React/Next.js demo in this first version.
- No full automatic generation from TypeORM.

## Recommended Direction

The next logical step is to stabilize the `hateoas-core` and `hateoas-nestjs` contracts, then add:

```txt
@axons/hateoas-react
@axons/hateoas-next
@axons/hateoas-hal
@axons/hateoas-hal-forms
```
