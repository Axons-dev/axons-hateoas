import { defineSirenResource, sirenAction, sirenEntity, sirenField, sirenLink } from '@axonsdev/hateoas-nestjs';
import type { SirenEmbeddedEntity, SirenEntity } from '@axonsdev/hateoas-siren';
import type { DemoUser } from '../../common/demo-auth/demo-user.types';
import { SocialCommentEntity } from '../domain/social-comment.entity';
import { SocialPermissionPolicy } from '../domain/social-permission.policy';
import { SocialPostEntity } from '../domain/social-post.entity';
import { SocialService } from '../social.service';

export interface SocialHypermediaContext {
  user: DemoUser;
}

export const DEFAULT_EMBEDDED_COMMENT_LIMIT = 2;

/**
 * Resource definition used by the generic NestJS composer for list responses.
 *
 * The social detail response is built manually below because it demonstrates a
 * richer Siren document: embedded comments, pagination links, and contextual
 * actions at multiple levels.
 */
export const socialPostResource = defineSirenResource<SocialPostEntity, SocialHypermediaContext>(SocialPostEntity, {
  name: 'social-post',
  classes: ['social-post'],
  id: (entity) => entity.id,

  properties: {
    id: 'id',
    body: 'body',
    authorId: 'authorId',
    imageUrl: 'imageUrl',
    isAuthor: ({ entity, context }) => entity.authorId === context.user.id,
    authorName: ({ entity, services }) => services.get<SocialService>(SocialService).authorName(entity.authorId),
    authorHandle: ({ entity, services }) => services.get<SocialService>(SocialService).authorHandle(entity.authorId),
    commentCount: ({ entity, services }) => services.get<SocialService>(SocialService).findCommentsForPost(entity.id).length,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },

  profiles: {
    list: {
      expose: ['id', 'body', 'authorId', 'imageUrl', 'isAuthor', 'authorName', 'authorHandle', 'commentCount', 'createdAt', 'updatedAt'],
      links: ['self'],
      actions: [],
    },
  },

  links: {
    self: ({ entity, url }) => sirenLink('self', url.route('social.posts.findOne', { id: entity.id })),
  },
});

/**
 * Builds the post detail representation consumed by the Angular detail screen.
 *
 * Only the first comments are embedded on purpose. The remaining comments are
 * advertised through `comments-next` so the UI can demonstrate link-driven
 * pagination instead of hardcoding collection URLs.
 */
export function buildSocialPostEntity(
  post: SocialPostEntity,
  comments: SocialCommentEntity[],
  service: SocialService,
  policy: SocialPermissionPolicy,
  user: DemoUser,
  embeddedCommentLimit = DEFAULT_EMBEDDED_COMMENT_LIMIT,
): SirenEntity {
  const availableActions = policy.getAvailablePostActions(post, user);
  const embeddedComments = comments.slice(0, embeddedCommentLimit);
  const nextOffset = embeddedComments.length;
  const builder = sirenEntity()
    .addClass('social-post')
    .properties({
      id: post.id,
      body: post.body,
      authorId: post.authorId,
      imageUrl: post.imageUrl,
      isAuthor: post.authorId === user.id,
      authorName: service.authorName(post.authorId),
      authorHandle: service.authorHandle(post.authorId),
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      commentCount: comments.length,
      embeddedCommentCount: embeddedComments.length,
    })
    .link(sirenLink('self', `/api/social/posts/${post.id}`))
    .link(sirenLink('collection', '/api/social/posts'))
    .link(sirenLink('comments', `/api/social/posts/${post.id}/comments?offset=0&limit=${embeddedCommentLimit}`))
    .action(
      sirenAction('create-comment')
        .title('Comment')
        .method('POST')
        .href(`/api/social/posts/${post.id}/comments`)
        .type('application/json')
        .field(sirenField({ name: 'body', title: 'Comment', type: 'textarea', required: true }))
        .build(),
    );

  if (availableActions.includes('edit-post')) {
    builder.action(
      sirenAction('edit-post')
        .title('Edit post')
        .method('PATCH')
        .href(`/api/social/posts/${post.id}`)
        .type('application/json')
        .field(sirenField({ name: 'body', title: 'Content', type: 'textarea', value: post.body, required: true }))
        .build(),
    );
  }

  if (availableActions.includes('delete-post')) {
    builder.action(
      sirenAction('delete-post')
        .title('Delete post')
        .method('DELETE')
        .href(`/api/social/posts/${post.id}`)
        .type('application/json')
        .build(),
    );
  }

  if (nextOffset < comments.length) {
    builder.link(sirenLink('comments-next', `/api/social/posts/${post.id}/comments?offset=${nextOffset}&limit=${embeddedCommentLimit}`));
  }

  for (const comment of embeddedComments) {
    builder.entity(buildCommentEntity(post, comment, service, policy, user));
  }

  return builder.build();
}

/**
 * Builds a standalone comment collection page.
 *
 * The page owns its own `next` link because the client should not need to know
 * how offsets are calculated; it only follows the relation returned by the API.
 */
export function buildCommentCollectionEntity(
  post: SocialPostEntity,
  comments: SocialCommentEntity[],
  service: SocialService,
  policy: SocialPermissionPolicy,
  user: DemoUser,
  offset: number,
  limit: number,
  total: number,
): SirenEntity {
  const builder = sirenEntity()
    .addClass('social-comment-collection')
    .properties({
      postId: post.id,
      offset,
      limit,
      total,
      count: comments.length,
    })
    .link(sirenLink('self', `/api/social/posts/${post.id}/comments?offset=${offset}&limit=${limit}`))
    .link(sirenLink('post', `/api/social/posts/${post.id}`));

  const nextOffset = offset + comments.length;

  if (nextOffset < total) {
    builder.link(sirenLink('next', `/api/social/posts/${post.id}/comments?offset=${nextOffset}&limit=${limit}`));
  }

  for (const comment of comments) {
    builder.entity(buildCommentEntity(post, comment, service, policy, user));
  }

  return builder.build();
}

function buildCommentEntity(
  post: SocialPostEntity,
  comment: SocialCommentEntity,
  service: SocialService,
  policy: SocialPermissionPolicy,
  user: DemoUser,
): SirenEmbeddedEntity {
  const availableActions = policy.getAvailableCommentActions(comment, post, user);
  const builder = sirenEntity()
    .addClass('social-comment')
    .properties({
      id: comment.id,
      postId: comment.postId,
      body: comment.hidden ? 'Comment hidden by moderation.' : comment.body,
      authorId: comment.authorId,
      isAuthor: comment.authorId === user.id,
      authorName: service.authorName(comment.authorId),
      authorHandle: service.authorHandle(comment.authorId),
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      hidden: comment.hidden,
    })
    .link(sirenLink('self', `/api/social/posts/${post.id}/comments/${comment.id}`));

  if (availableActions.includes('edit-comment') && !comment.hidden) {
    builder.action(
      sirenAction('edit-comment')
        .title('Edit my comment')
        .method('PATCH')
        .href(`/api/social/posts/${post.id}/comments/${comment.id}`)
        .type('application/json')
        // The current value is sent in the action field so generic forms can prefill edits.
        .field(sirenField({ name: 'body', title: 'Comment', type: 'textarea', value: comment.body, required: true }))
        .build(),
    );
  }

  if (availableActions.includes('delete-comment')) {
    builder.action(
      sirenAction('delete-comment')
        .title('Delete my comment')
        .method('DELETE')
        .href(`/api/social/posts/${post.id}/comments/${comment.id}`)
        .type('application/json')
        .build(),
    );
  }

  if (availableActions.includes('hide-comment') && !comment.hidden) {
    builder.action(
      sirenAction('hide-comment')
        .title('Hide comment')
        .method('POST')
        .href(`/api/social/posts/${post.id}/comments/${comment.id}/hide`)
        .type('application/json')
        .build(),
    );
  }

  return {
    rel: ['item', 'comment'],
    ...builder.build(),
  };
}
