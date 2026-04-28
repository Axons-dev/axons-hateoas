import { Injectable } from '@nestjs/common';
import type { DemoUser } from '../../common/demo-auth/demo-user.types';
import type { SocialCommentActionName, SocialPostActionName } from './social-action';
import type { SocialCommentEntity } from './social-comment.entity';
import type { SocialPostEntity } from './social-post.entity';

@Injectable()
export class SocialPermissionPolicy {
  /**
   * Returns post-level commands for the current user.
   *
   * This stays out of controllers so the API cannot accidentally expose an action
   * that the command path would later reject with different logic.
   */
  getAvailablePostActions(post: SocialPostEntity, user: DemoUser): SocialPostActionName[] {
    const actions: SocialPostActionName[] = ['create-comment'];

    if (post.authorId === user.id) {
      actions.push('edit-post', 'delete-post');
    }

    return actions;
  }

  /**
   * Returns comment-level commands for the current user and parent post.
   *
   * The parent post is part of the rule because post authors can moderate comments
   * even when they did not write those comments.
   */
  getAvailableCommentActions(comment: SocialCommentEntity, post: SocialPostEntity, user: DemoUser): SocialCommentActionName[] {
    const actions: SocialCommentActionName[] = [];

    if (comment.authorId === user.id) {
      actions.push('edit-comment', 'delete-comment');
    }

    if (post.authorId === user.id || user.role === 'ADMIN' || user.role === 'REVIEWER') {
      actions.push('hide-comment');
    }

    return actions;
  }

  /**
   * Guards post mutations with the same permission model used by hypermedia builders.
   */
  ensureCanPost(action: SocialPostActionName, post: SocialPostEntity, user: DemoUser): void {
    if (!this.getAvailablePostActions(post, user).includes(action)) {
      throw new Error(`Action ${action} is not available for this user and post.`);
    }
  }

  /**
   * Guards comment mutations with the same permission model used by hypermedia builders.
   */
  ensureCanComment(
    action: SocialCommentActionName,
    comment: SocialCommentEntity,
    post: SocialPostEntity,
    user: DemoUser,
  ): void {
    if (!this.getAvailableCommentActions(comment, post, user).includes(action)) {
      throw new Error(`Action ${action} is not available for this user and comment.`);
    }
  }
}
