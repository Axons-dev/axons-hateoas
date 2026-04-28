# Evolution Prompts

## Stabilize Core

```txt
Analyze the `packages/hateoas-core` package and propose a stable public API for a first npm version.
Goals:
- reduce implementation leaks;
- improve the typing of `HypermediaResource<TProperties>`;
- clarify responsibility boundaries between parser, transport, and client;
- keep the client independent from Siren and frontend frameworks.
Do not modify the demo apps at first.
```

## Add React

```txt
Add a `packages/hateoas-react` package exposing:
- `HateoasProvider`
- `useHateoasClient`
- `useHypermediaResource`
- `useHypermediaAction`

Then add a minimal `apps/react-demo` app to show that the HATEOAS core is not coupled to Angular.
```

## Improve NestJS TypeORM

```txt
Improve `packages/hateoas-nestjs-typeorm` to:
- read primary keys from TypeORM;
- validate declared relations;
- support relations exposed as links or embedded entities;
- prevent any automatic exposure of undeclared fields.
```
