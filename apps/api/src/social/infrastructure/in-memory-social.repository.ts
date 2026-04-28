import { Injectable } from '@nestjs/common';
import { SocialCommentEntity } from '../domain/social-comment.entity';
import { SocialPostEntity } from '../domain/social-post.entity';
import { SocialUserEntity } from '../domain/social-user.entity';

@Injectable()
export class InMemorySocialRepository {
  private commentSequence = 8;

  private readonly users = new Map<string, SocialUserEntity>([
    ['user-1', new SocialUserEntity('user-1', 'Alice Martin', '@alice', 'MEMBER')],
    ['user-2', new SocialUserEntity('user-2', 'Nora Singh', '@nora', 'MEMBER')],
    ['user-3', new SocialUserEntity('user-3', 'Malik Benali', '@malik', 'MODERATOR')],
  ]);

  private readonly posts = new Map<string, SocialPostEntity>([
    [
      'POST-001',
      new SocialPostEntity(
        'POST-001',
        'I just published a HATEOAS workflow example for the frontend. Available actions change with the current user context.',
        'user-1',
        'https://placehold.net/1.png',
        '2026-04-28T09:15:00.000Z',
      ),
    ],
    [
      'POST-002',
      new SocialPostEntity(
        'POST-002',
        'Product question: should hidden comments be visible only to moderators?',
        'user-2',
        'https://placehold.net/2.png',
        '2026-04-28T10:35:00.000Z',
      ),
    ],
    [
      'POST-003',
      new SocialPostEntity(
        'POST-003',
        'Field note: Siren links make detail screens much easier to maintain.',
        'user-3',
        'https://placehold.net/1.png',
        '2026-04-28T11:05:00.000Z',
      ),
    ],
  ]);

  private readonly comments = new Map<string, SocialCommentEntity>([
    ['COMMENT-001', new SocialCommentEntity('COMMENT-001', 'POST-001', 'Very clear, especially the dynamic action part.', 'user-2', '2026-04-28T09:25:00.000Z')],
    ['COMMENT-002', new SocialCommentEntity('COMMENT-002', 'POST-001', 'I can add a moderation case if needed.', 'user-3', '2026-04-28T09:42:00.000Z')],
    ['COMMENT-003', new SocialCommentEntity('COMMENT-003', 'POST-001', 'The client code stays pleasantly small.', 'user-1', '2026-04-28T09:58:00.000Z')],
    ['COMMENT-004', new SocialCommentEntity('COMMENT-004', 'POST-001', 'This also makes the API contract easier to inspect.', 'user-2', '2026-04-28T10:04:00.000Z')],
    ['COMMENT-005', new SocialCommentEntity('COMMENT-005', 'POST-001', 'Pagination is useful once discussions get longer.', 'user-3', '2026-04-28T10:12:00.000Z')],
    ['COMMENT-006', new SocialCommentEntity('COMMENT-006', 'POST-002', 'Yes, but with a visible badge.', 'user-1', '2026-04-28T10:50:00.000Z')],
    ['COMMENT-007', new SocialCommentEntity('COMMENT-007', 'POST-003', 'The social feed is a good example of fine-grained permissions.', 'user-1', '2026-04-28T11:18:00.000Z')],
  ]);

  findUsers(): SocialUserEntity[] {
    return [...this.users.values()];
  }

  findUser(id: string): SocialUserEntity {
    const user = this.users.get(id);

    if (!user) {
      throw new Error(`User not found: ${id}`);
    }

    return user;
  }

  /**
   * Returns posts in reverse chronological order to mimic a social feed.
   *
   * The repository owns ordering because callers should not need to repeat
   * storage-specific sorting rules.
   */
  findPosts(): SocialPostEntity[] {
    return [...this.posts.values()].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }

  findPost(id: string): SocialPostEntity {
    const post = this.posts.get(id);

    if (!post) {
      throw new Error(`Post not found: ${id}`);
    }

    return post;
  }

  /**
   * Returns comments in chronological order for conversational readability.
   */
  findCommentsForPost(postId: string): SocialCommentEntity[] {
    return [...this.comments.values()]
      .filter((comment) => comment.postId === postId)
      .sort((left, right) => left.createdAt.localeCompare(right.createdAt));
  }

  findComment(id: string): SocialCommentEntity {
    const comment = this.comments.get(id);

    if (!comment) {
      throw new Error(`Comment not found: ${id}`);
    }

    return comment;
  }

  savePost(post: SocialPostEntity): SocialPostEntity {
    this.posts.set(post.id, post);
    return post;
  }

  deletePost(id: string): void {
    this.posts.delete(id);

    for (const comment of this.comments.values()) {
      if (comment.postId === id) {
        this.comments.delete(comment.id);
      }
    }
  }

  createComment(postId: string, body: string, authorId: string): SocialCommentEntity {
    const comment = new SocialCommentEntity(
      `COMMENT-${String(this.commentSequence++).padStart(3, '0')}`,
      postId,
      body,
      authorId,
      new Date().toISOString(),
    );

    this.comments.set(comment.id, comment);
    return comment;
  }

  saveComment(comment: SocialCommentEntity): SocialCommentEntity {
    this.comments.set(comment.id, comment);
    return comment;
  }

  deleteComment(id: string): void {
    this.comments.delete(id);
  }
}
