import { Inject, Injectable } from '@nestjs/common';
import type { DemoUser } from '../common/demo-auth/demo-user.types';
import { SocialCommentEntity } from './domain/social-comment.entity';
import { SocialPermissionPolicy } from './domain/social-permission.policy';
import { SocialPostEntity } from './domain/social-post.entity';
import { InMemorySocialRepository } from './infrastructure/in-memory-social.repository';

@Injectable()
export class SocialService {
  constructor(
    @Inject(InMemorySocialRepository)
    private readonly repository: InMemorySocialRepository,
    @Inject(SocialPermissionPolicy)
    private readonly policy: SocialPermissionPolicy,
  ) {}

  findPosts(): SocialPostEntity[] {
    return this.repository.findPosts();
  }

  findPost(id: string): SocialPostEntity {
    return this.repository.findPost(id);
  }

  findCommentsForPost(postId: string): SocialCommentEntity[] {
    return this.repository.findCommentsForPost(postId);
  }

  /**
   * Exposes author display data without making hypermedia builders depend directly
   * on repository internals.
   */
  authorName(authorId: string): string {
    return this.repository.findUser(authorId).displayName;
  }

  authorHandle(authorId: string): string {
    return this.repository.findUser(authorId).handle;
  }

  /**
   * Updates a post after authorization, then returns the updated aggregate root.
   *
   * Returning the post lets controllers rebuild a fresh hypermedia representation
   * for the same screen after the mutation.
   */
  updatePost(id: string, input: { body?: string }, user: DemoUser): SocialPostEntity {
    const post = this.repository.findPost(id);
    this.policy.ensureCanPost('edit-post', post, user);

    post.body = input.body ?? post.body;
    post.updatedAt = new Date().toISOString();

    return this.repository.savePost(post);
  }

  deletePost(id: string, user: DemoUser): void {
    const post = this.repository.findPost(id);
    this.policy.ensureCanPost('delete-post', post, user);
    this.repository.deletePost(id);
  }

  /**
   * Creates a comment and returns the parent post because the UI stays on the post
   * detail page after comment actions.
   */
  createComment(postId: string, input: { body?: string }, user: DemoUser): SocialPostEntity {
    const post = this.repository.findPost(postId);
    this.policy.ensureCanPost('create-comment', post, user);
    this.repository.createComment(postId, input.body ?? '', user.id);
    return post;
  }

  updateComment(postId: string, commentId: string, input: { body?: string }, user: DemoUser): SocialPostEntity {
    const post = this.repository.findPost(postId);
    const comment = this.repository.findComment(commentId);
    this.policy.ensureCanComment('edit-comment', comment, post, user);

    comment.body = input.body ?? comment.body;
    comment.updatedAt = new Date().toISOString();
    this.repository.saveComment(comment);

    return post;
  }

  deleteComment(postId: string, commentId: string, user: DemoUser): SocialPostEntity {
    const post = this.repository.findPost(postId);
    const comment = this.repository.findComment(commentId);
    this.policy.ensureCanComment('delete-comment', comment, post, user);
    this.repository.deleteComment(commentId);
    return post;
  }

  hideComment(postId: string, commentId: string, user: DemoUser): SocialPostEntity {
    const post = this.repository.findPost(postId);
    const comment = this.repository.findComment(commentId);
    this.policy.ensureCanComment('hide-comment', comment, post, user);

    comment.hidden = true;
    comment.updatedAt = new Date().toISOString();
    this.repository.saveComment(comment);

    return post;
  }
}
