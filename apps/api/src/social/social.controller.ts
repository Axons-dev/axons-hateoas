import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { HateoasService, SirenResponse } from '@axons/hateoas-nestjs';
import { CurrentDemoUser } from '../common/demo-auth/current-demo-user.decorator';
import type { DemoUser } from '../common/demo-auth/demo-user.types';
import { SocialPermissionPolicy } from './domain/social-permission.policy';
import { SocialPostEntity } from './domain/social-post.entity';
import { buildCommentCollectionEntity, buildSocialPostEntity } from './hypermedia/social.resource';
import { SocialService } from './social.service';

@Controller('social/posts')
export class SocialController {
  constructor(
    @Inject(SocialService)
    private readonly social: SocialService,
    @Inject(SocialPermissionPolicy)
    private readonly policy: SocialPermissionPolicy,
    @Inject(HateoasService)
    private readonly hateoas: HateoasService,
  ) {}

  /**
   * Returns the feed collection through the generic composer.
   *
   * List items do not need custom embedding, so the reusable resource definition
   * is enough here.
   */
  @Get()
  @SirenResponse()
  async findAll(@CurrentDemoUser() user: DemoUser) {
    return this.hateoas
      .collection<SocialPostEntity, { user: DemoUser }>(SocialPostEntity, this.social.findPosts())
      .profile('list')
      .withContext({ user })
      .toResponse();
  }

  @Get(':id')
  @SirenResponse()
  findOne(@Param('id') id: string, @CurrentDemoUser() user: DemoUser) {
    return this.toPostResponse(this.social.findPost(id), user);
  }

  /**
   * Returns a paginated comment collection for link-driven "load more" flows.
   */
  @Get(':id/comments')
  @SirenResponse()
  findComments(
    @Param('id') id: string,
    @Query('offset') offsetInput: string | undefined,
    @Query('limit') limitInput: string | undefined,
    @CurrentDemoUser() user: DemoUser,
  ) {
    const post = this.social.findPost(id);
    const allComments = this.social.findCommentsForPost(id);
    const offset = normalizePageNumber(offsetInput, 0);
    const limit = normalizePageNumber(limitInput, 2);
    const comments = allComments.slice(offset, offset + limit);

    return buildCommentCollectionEntity(
      post,
      comments,
      this.social,
      this.policy,
      user,
      offset,
      limit,
      allComments.length,
    );
  }

  @Patch(':id')
  @SirenResponse()
  updatePost(@Param('id') id: string, @Body() body: { body?: string }, @CurrentDemoUser() user: DemoUser) {
    return this.toPostResponse(this.social.updatePost(id, body, user), user);
  }

  @Delete(':id')
  @SirenResponse()
  deletePost(@Param('id') id: string, @CurrentDemoUser() user: DemoUser) {
    this.social.deletePost(id, user);
    return this.hateoas
      .collection<SocialPostEntity, { user: DemoUser }>(SocialPostEntity, this.social.findPosts())
      .profile('list')
      .withContext({ user })
      .toResponse();
  }

  @Post(':id/comments')
  @SirenResponse()
  createComment(@Param('id') id: string, @Body() body: { body?: string }, @CurrentDemoUser() user: DemoUser) {
    return this.toPostResponse(this.social.createComment(id, body, user), user);
  }

  @Patch(':postId/comments/:commentId')
  @SirenResponse()
  updateComment(
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
    @Body() body: { body?: string },
    @CurrentDemoUser() user: DemoUser,
  ) {
    return this.toPostResponse(this.social.updateComment(postId, commentId, body, user), user);
  }

  @Delete(':postId/comments/:commentId')
  @SirenResponse()
  deleteComment(
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
    @CurrentDemoUser() user: DemoUser,
  ) {
    return this.toPostResponse(this.social.deleteComment(postId, commentId, user), user);
  }

  @Post(':postId/comments/:commentId/hide')
  @SirenResponse()
  hideComment(
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
    @CurrentDemoUser() user: DemoUser,
  ) {
    return this.toPostResponse(this.social.hideComment(postId, commentId, user), user);
  }

  /**
   * Converts a domain post into the detail Siren document.
   *
   * The controller composes the representation here because it has both HTTP
   * context and access to collaborators, but it delegates business rules to the
   * service and policy.
   */
  private toPostResponse(post: SocialPostEntity, user: DemoUser) {
    return buildSocialPostEntity(
      post,
      this.social.findCommentsForPost(post.id),
      this.social,
      this.policy,
      user,
    );
  }
}

/**
 * Keeps query parsing intentionally boring for the demo API.
 */
function normalizePageNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 0) {
    return fallback;
  }

  return parsed;
}
