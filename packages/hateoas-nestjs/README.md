# @axons/hateoas-nestjs

NestJS helpers for composing Siren hypermedia responses.

This package lets backend code describe resource properties, links, profiles, and actions, then compose Siren responses from domain entities.

## Responsibilities

- Register resource definitions and route factories.
- Compose single-resource and collection responses.
- Resolve Nest providers while building hypermedia actions.
- Provide Siren builders for custom responses.
- Mark HTTP responses with the Siren content type.
- Provide small testing helpers for Siren assertions.

## Main Exports

```ts
HateoasModule
HateoasService
defineSirenResource
HypermediaResourceDefinition
ResourceRegistry
RouteUrlResolver
sirenEntity
sirenAction
sirenLink
sirenField
SIREN_CONTENT_TYPE
SirenResponse
expectSiren
```

## Registering The Module

```ts
@Module({
  imports: [
    HateoasModule.forRoot({
      resources: [caseResource],
      routes: {
        'cases.findAll': () => '/api/cases',
        'cases.findOne': ({ id }) => `/api/cases/${id}`,
        'cases.approve': ({ id }) => `/api/cases/${id}/approve`,
      },
    }),
  ],
})
export class AppModule {}
```

`HateoasModule` is global so feature modules can inject `HateoasService` after the root module registers resources and routes.

## Defining A Resource

```ts
export const caseResource = defineSirenResource<CaseEntity, { user: DemoUser }>(CaseEntity, {
  name: 'case',
  classes: ['case'],
  id: (entity) => entity.id,

  properties: {
    id: 'id',
    title: 'title',
    status: 'status',
  },

  profiles: {
    list: {
      expose: ['id', 'title', 'status'],
      links: ['self'],
      actions: [],
    },
    detail: {
      expose: ['id', 'title', 'status'],
      links: ['self', 'collection'],
      actions: ['approve'],
    },
  },

  links: {
    self: ({ entity, url }) => sirenLink('self', url.route('cases.findOne', { id: entity.id })),
    collection: ({ url }) => sirenLink('collection', url.route('cases.findAll')),
  },

  actions: {
    approve: ({ entity, context, services, url }) => {
      const policy = services.get<CaseTransitionPolicy>(CaseTransitionPolicy);

      if (!policy.getAvailableActions(entity, context.user).includes('approve')) {
        return null;
      }

      return sirenAction('approve')
        .title('Approve')
        .method('POST')
        .href(url.route('cases.approve', { id: entity.id }))
        .type('application/json')
        .build();
    },
  },
});
```

## Profiles

Profiles control which properties, links, and actions are exposed for a given use case.

Common patterns:

```txt
list   -> compact embedded collection items
detail -> full resource with actions
```

Profiles let one resource definition serve multiple response shapes without duplicating business mapping.

## Composing Responses

Single resource:

```ts
return this.hateoas
  .resource<CaseEntity, { user: DemoUser }>(caseEntity)
  .profile('detail')
  .withContext({ user })
  .toResponse();
```

Collection:

```ts
return this.hateoas
  .collection<CaseEntity, { user: DemoUser }>(CaseEntity, cases)
  .profile('list')
  .withContext({ user })
  .toResponse();
```

The context is passed to property selectors, link resolvers, and action resolvers.

## Service Resolution

Action resolvers receive a `services` object:

```ts
const policy = services.get<CaseTransitionPolicy>(CaseTransitionPolicy);
```

This uses Nest's `ModuleRef` with `{ strict: false }`, which allows resource builders to ask for application providers without coupling the package to a specific feature module.

## Custom Siren Builders

Use builders when a response is more complex than a generic resource definition.

```ts
return sirenEntity()
  .addClass('api-root')
  .properties({ name: 'API' })
  .link(sirenLink('self', '/api'))
  .build();
```

Available helpers:

```ts
sirenEntity()
sirenAction(name)
sirenLink(rel, href, extra)
sirenField(field)
```

## Response Decorator

```ts
@Get(':id')
@SirenResponse()
findOne() {
  return response;
}
```

`@SirenResponse()` sets the response content type to Siren.

## Testing

The package exports Siren testing helpers from:

```txt
src/testing/siren-expect.ts
```

Use them to assert generated Siren structures without repeating low-level object checks.

## Notes

- Resource definitions describe representation, not persistence.
- Domain rules should live in application policies or services.
- Returning `null`, `false`, or `undefined` from an action resolver omits that action.
- Route names decouple resource builders from hardcoded route strings.
