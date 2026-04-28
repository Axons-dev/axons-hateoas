# Angular Demo

This application demonstrates how an Angular frontend can consume HATEOAS resources without duplicating backend business rules.

The demo keeps responsibilities separated:

- components render the view and bind user interactions;
- business/orchestration classes decide which resources to load and which actions to submit;
- shared state services expose role and resource state to the UI;
- the HATEOAS client follows API-provided links and actions instead of hardcoding business endpoints in components.

## Related Articles

These articles explain the principles behind the implementation:

- [Angular : separer vue, etat, orchestration](https://axons.fr/blog/angular-separer-vue-etat-orchestration) describes the Angular responsibility split used by this demo.
- [REST jusqu'au bout : a quoi sert vraiment HATEOAS sur une API metier](https://axons.fr/blog/rest-jusqu-au-bout-a-quoi-sert-vraiment-hateoas-sur-une-api-metier) explains why the frontend consumes business capabilities through HATEOAS links and actions.

## Run

From the repository root:

```bash
pnpm start:web
```

The application runs at:

```txt
http://localhost:4200
```
