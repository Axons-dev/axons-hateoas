# Backend Demo Domains

This document explains how each backend demo domain builds Siren resources and API responses.

## Shared Response Pipeline

Both domains follow the same high-level flow:

1. `CurrentDemoUser` reads the demo user context from `x-demo-user-id` and `x-demo-role`.
2. A controller receives HTTP input and chooses the response use case.
3. A service reads or mutates domain state.
4. A policy decides which actions are currently allowed.
5. A hypermedia resource builder exposes properties, links, embedded entities, and Siren actions.
6. `@SirenResponse()` marks the response as Siren so clients parse it as `application/vnd.siren+json`.

Controllers do not contain authorization rules. Services do not know Siren. Resource builders do not mutate state.

## Case Workflow Domain

### Purpose

The case demo models a case validation workflow. It demonstrates state-dependent actions such as submitting, reviewing, approving, rejecting, reopening, and archiving a case.

### Files

```txt
apps/api/src/cases/cases.controller.ts
apps/api/src/cases/cases.service.ts
apps/api/src/cases/domain/case-transition.policy.ts
apps/api/src/cases/hypermedia/case.resource.ts
apps/api/src/cases/infrastructure/in-memory-case.repository.ts
```

### Domain State

`CaseEntity` contains the mutable workflow data:

```txt
id
title
description
status
createdById
createdAt
lastDecisionReason
```

`InMemoryCaseRepository` stores the demo cases. It is intentionally simple and replaceable; persistence is not part of the demo.

### Policy

`CaseTransitionPolicy` is the single source of truth for allowed actions.

It exposes:

```ts
getAvailableActions(caseEntity, user)
ensureCan(action, caseEntity, user)
```

The same policy is used in two places:

- `CasesService` calls `ensureCan(...)` before mutating state.
- `case.resource.ts` calls `getAvailableActions(...)` before exposing a Siren action.

This keeps the command path and the hypermedia representation aligned. If the API exposes `approve`, the mutation path accepts `approve` under the same rules.

### Resource Construction

`caseResource` is declared with `defineSirenResource(...)`.

The resource declaration maps domain data to Siren:

```txt
CaseEntity -> class: ["case"]
CaseEntity properties -> Siren properties
Case links -> Siren links
Available transitions -> Siren actions
```

The resource defines two profiles:

```txt
list
detail
```

`list` exposes a compact representation:

```txt
id
title
status
createdById
self link
no actions
```

`detail` exposes the full workflow surface:

```txt
id
title
description
status
createdById
createdAt
lastDecisionReason
self link
collection link
workflow actions
```

### API Responses

#### `GET /api/cases`

Controller method:

```ts
CasesController.findAll()
```

Construction:

```ts
this.hateoas
  .collection(CaseEntity, cases)
  .profile('list')
  .withContext({ user })
  .toResponse()
```

The generic `HateoasService` composes the collection from `caseResource`. Every embedded item uses the `list` profile.

#### `GET /api/cases/:id`

Controller method:

```ts
CasesController.findOne()
```

Construction:

```ts
this.hateoas
  .resource(caseEntity)
  .profile('detail')
  .withContext({ user })
  .toResponse()
```

The `detail` profile asks `case.resource.ts` to expose links and actions. Each action resolver checks `CaseTransitionPolicy` before returning a Siren action. If an action is not allowed, the resolver returns `null`; the action is omitted from the response.

#### Mutation endpoints

Examples:

```txt
PATCH /api/cases/:id
POST  /api/cases/:id/submit
POST  /api/cases/:id/approve
POST  /api/cases/:id/request-changes
```

Construction:

1. The controller calls a `CasesService` mutation.
2. The service calls `CaseTransitionPolicy.ensureCan(...)`.
3. The service updates the entity and saves it.
4. The controller rebuilds the `detail` response through `toCaseResponse(...)`.

Returning a fresh detail response is intentional: the available actions usually change after a mutation.

## Social Feed Domain

### Purpose

The social feed demo models posts, users, comments, author-only edits, and comment moderation. It demonstrates nested hypermedia, embedded entities, and paginated "load more" flows.

### Files

```txt
apps/api/src/social/social.controller.ts
apps/api/src/social/social.service.ts
apps/api/src/social/domain/social-permission.policy.ts
apps/api/src/social/hypermedia/social.resource.ts
apps/api/src/social/infrastructure/in-memory-social.repository.ts
```

### Domain State

The social domain has three entity types:

```txt
SocialUserEntity
SocialPostEntity
SocialCommentEntity
```

Posts contain:

```txt
id
body
authorId
imageUrl
createdAt
updatedAt
```

Comments contain:

```txt
id
postId
body
authorId
createdAt
hidden
updatedAt
```

`InMemorySocialRepository` sorts posts in reverse chronological order and comments in chronological order. That ordering belongs in the repository so callers do not repeat storage-specific ordering rules.

### Policy

`SocialPermissionPolicy` is the single source of truth for social permissions.

Post actions:

```txt
create-comment
edit-post
delete-post
```

Comment actions:

```txt
edit-comment
delete-comment
hide-comment
```

Rules:

- every user can comment on a visible post;
- only the post author can edit or delete the post;
- only the comment author can edit or delete the comment;
- the post author, `REVIEWER`, and `ADMIN` can hide comments.

The same policy is used by:

- `SocialService` before mutations;
- `social.resource.ts` before exposing Siren actions.

### Feed Resource Construction

`socialPostResource` is declared with `defineSirenResource(...)` for collection responses.

It maps a `SocialPostEntity` to:

```txt
class: ["social-post"]
properties:
  id
  body
  authorId
  imageUrl
  isAuthor
  authorName
  authorHandle
  commentCount
  createdAt
  updatedAt
links:
  self
```

Some properties are direct entity fields. Others are computed:

- `isAuthor` is computed from the current `DemoUser`.
- `authorName` and `authorHandle` are resolved through `SocialService`.
- `commentCount` is computed from the repository through `SocialService`.

This keeps the feed response useful without embedding full comments.

### Post Detail Resource Construction

Post detail responses are built manually by:

```ts
buildSocialPostEntity(...)
```

This response is more complex than a simple resource profile, so it is not delegated to the generic composer.

It includes:

```txt
class: ["social-post"]
post properties
self link
collection link
comments link
comments-next link when more comments exist
post actions
embedded comment entities
```

Only the first comments are embedded:

```ts
DEFAULT_EMBEDDED_COMMENT_LIMIT = 2
```

That limit is intentionally small in the demo so the UI visibly exercises pagination.

If more comments exist, the response includes:

```txt
rel: ["comments-next"]
href: /api/social/posts/:id/comments?offset=2&limit=2
```

The frontend follows this link instead of calculating offsets itself.

### Comment Entity Construction

Embedded comments are built by:

```ts
buildCommentEntity(...)
```

Each embedded comment includes:

```txt
rel: ["item", "comment"]
class: ["social-comment"]
properties:
  id
  postId
  body
  authorId
  isAuthor
  authorName
  authorHandle
  createdAt
  updatedAt
  hidden
links:
  self
actions:
  edit-comment
  delete-comment
  hide-comment
```

Actions are included only when `SocialPermissionPolicy` allows them.

Edit actions include a Siren field value:

```txt
field.name = "body"
field.type = "textarea"
field.value = current body
```

That lets the generic frontend form prefill edit forms without knowing whether it is editing a post or a comment.

### Comment Collection Construction

Paginated comment responses are built by:

```ts
buildCommentCollectionEntity(...)
```

The collection includes:

```txt
class: ["social-comment-collection"]
properties:
  postId
  offset
  limit
  total
  count
links:
  self
  post
  next when more comments exist
entities:
  comment items
```

The `next` link is the only pagination contract the frontend needs. Offset and limit are exposed as properties for debugging and inspection, but the client does not have to calculate them.

### API Responses

#### `GET /api/social/posts`

Controller method:

```ts
SocialController.findAll()
```

Construction:

```ts
this.hateoas
  .collection(SocialPostEntity, posts)
  .profile('list')
  .withContext({ user })
  .toResponse()
```

The response is a feed collection with compact embedded posts. Comments are not embedded in the feed.

#### `GET /api/social/posts/:id`

Controller method:

```ts
SocialController.findOne()
```

Construction:

```ts
buildSocialPostEntity(post, comments, socialService, policy, user)
```

The response embeds only the first comments and includes `comments-next` when more comments are available.

#### `GET /api/social/posts/:id/comments?offset=0&limit=2`

Controller method:

```ts
SocialController.findComments()
```

Construction:

1. The controller reads `offset` and `limit`.
2. It loads all comments for the post from `SocialService`.
3. It slices the requested page.
4. It calls `buildCommentCollectionEntity(...)`.

The resulting collection contains comment entities plus a `next` link when another page exists.

#### Mutation endpoints

Examples:

```txt
PATCH  /api/social/posts/:id
DELETE /api/social/posts/:id
POST   /api/social/posts/:id/comments
PATCH  /api/social/posts/:postId/comments/:commentId
DELETE /api/social/posts/:postId/comments/:commentId
POST   /api/social/posts/:postId/comments/:commentId/hide
```

Construction:

1. The controller calls a `SocialService` mutation.
2. The service checks `SocialPermissionPolicy`.
3. The service mutates the in-memory state.
4. The controller returns a fresh post detail response, except `delete-post`, which returns the refreshed feed collection.

Returning fresh hypermedia after mutations keeps the frontend synchronized with the next available action set.

## Why These Layers Exist

### Domain policies

Policies answer "what is allowed?" independently from HTTP and Siren.

### Services

Services execute commands and coordinate repositories and policies.

### Hypermedia resources

Resource builders answer "what should the client see and be allowed to follow or submit?"

### Controllers

Controllers translate HTTP requests into use cases and choose which representation to return.

### Repositories

Repositories own demo storage and ordering. They can be replaced later without changing controllers or hypermedia builders.
