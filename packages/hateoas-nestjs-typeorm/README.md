# @axons/hateoas-nestjs-typeorm

Assisted TypeORM integration for `@axons/hateoas-nestjs`.

This package helps build Siren resource definitions from TypeORM entities while keeping explicit control over exposed fields.

## Responsibilities

- Build a `HypermediaResourceDefinition` for a TypeORM entity.
- Generate property mappings from an explicit `expose` list.
- Optionally validate exposed columns against TypeORM metadata.
- Preserve the same links, actions, profiles, and context model as `@axons/hateoas-nestjs`.

## Main Exports

```ts
defineTypeOrmSirenResource(entity, options)
TypeOrmSirenResourceOptions
```

## Basic Usage

```ts
export const articleResource = defineTypeOrmSirenResource<Article, { user: User }>(Article, {
  dataSource,
  name: 'article',
  classes: ['article'],
  id: (entity) => entity.id,
  expose: ['id', 'title', 'status'],
  profiles: {
    list: {
      expose: ['id', 'title', 'status'],
      links: ['self'],
      actions: [],
    },
  },
  links: {
    self: ({ entity, url }) => sirenLink('self', url.route('articles.findOne', { id: entity.id })),
  },
});
```

## `expose` Is Mandatory

The package intentionally does not expose every TypeORM column automatically.

```ts
expose: ['id', 'title', 'status']
```

This prevents accidental leaks of sensitive fields such as passwords, tokens, internal flags, or audit data.

## Custom Properties

You can add computed properties or override generated mappings:

```ts
defineTypeOrmSirenResource(UserEntity, {
  expose: ['id', 'email'],
  properties: {
    displayName: ({ entity }) => `${entity.firstName} ${entity.lastName}`,
  },
  // links, actions, profiles...
});
```

Generated mappings from `expose` are merged first. `properties` are merged afterward.

## Metadata Validation

When `dataSource` is provided, every exposed field is checked against TypeORM column metadata.

```ts
defineTypeOrmSirenResource(UserEntity, {
  dataSource,
  expose: ['id', 'email'],
  // ...
});
```

If an exposed field is not a known column, the function throws an error.

This is a guard against typos and stale resource definitions.

## Relationship To @axons/hateoas-nestjs

The result is a normal `HypermediaResourceDefinition`, so it can be registered in `HateoasModule.forRoot(...)`:

```ts
HateoasModule.forRoot({
  resources: [articleResource],
  routes,
});
```

## Current Limitations

- It does not automatically expose relations.
- It does not automatically generate links from TypeORM relations.
- It does not infer profiles.
- It does not infer actions.
- It validates columns only when a `DataSource` is supplied.

These constraints are intentional for the first version: representation exposure should stay explicit.
