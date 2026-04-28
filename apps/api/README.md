# API Demo

This NestJS application demonstrates how to expose business workflows as HATEOAS resources using Siren.

The API is responsible for:

- evaluating domain rules;
- deciding which links and actions are available for the current user and resource state;
- building Siren responses that describe those available capabilities;
- keeping frontend applications from duplicating workflow transition rules.

## Related Articles

These articles explain the principles behind the implementation:

- [REST jusqu'au bout : a quoi sert vraiment HATEOAS sur une API metier](https://axons.fr/blog/rest-jusqu-au-bout-a-quoi-sert-vraiment-hateoas-sur-une-api-metier) explains the broader HATEOAS approach used by this API.
- [Angular : separer vue, etat, orchestration](https://axons.fr/blog/angular-separer-vue-etat-orchestration) explains the frontend responsibility split that benefits from API-provided hypermedia controls.

## Run

From the repository root:

```bash
pnpm start:api
```

The API runs at:

```txt
http://localhost:3000/api
```
