import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HATEOAS_CLIENT } from '@axonsdev/hateoas-angular';
import type { HypermediaAction, HypermediaResource } from '@axonsdev/hateoas-core';
import type { SocialPostProperties } from '../../models/social.model';
import { SocialPostDetailStore } from './social-post-detail.store';

interface CommentCollectionProperties {
  postId: string;
  offset: number;
  limit: number;
  total: number;
  count: number;
}

@Injectable()
export class SocialPostDetailBusiness {
  private readonly client = inject(HATEOAS_CLIENT);
  private readonly router = inject(Router);
  private readonly store = inject(SocialPostDetailStore);

  readonly state = this.store.state;
  private currentId: string | null = null;

  /**
   * Loads the canonical post detail resource.
   *
   * The business service is the right layer for this because it coordinates the
   * HATEOAS client and store state while keeping the component template passive.
   */
  async load(id: string): Promise<void> {
    this.currentId = id;
    this.store.setLoading(true);
    this.store.setError(null);

    try {
      const resource = await this.client.get<SocialPostProperties>(`/api/social/posts/${id}`);
      this.store.setResource(resource);
    } catch (error) {
      this.store.setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      this.store.setLoading(false);
    }
  }

  /**
   * Reloads the current resource after role changes or mutations.
   *
   * The API recalculates actions for every request, so reloading is how the UI
   * learns that a different role has different capabilities.
   */
  async reload(): Promise<void> {
    if (this.currentId) {
      await this.load(this.currentId);
    }
  }

  /**
   * Follows the `comments-next` relation exposed by the API and appends results.
   *
   * The URL and offset are intentionally not built in the frontend. Pagination is
   * driven by hypermedia links so the server owns pagination shape and defaults.
   */
  async loadMoreComments(): Promise<void> {
    const resource = this.state().resource;

    if (!resource || !resource.hasLink('comments-next')) {
      return;
    }

    this.store.setActionRunning('comments-next');
    this.store.setError(null);

    try {
      const collection = await this.client.get<CommentCollectionProperties>(resource.link('comments-next').href);
      this.store.appendEntities(collection.entities);
      this.store.setNextCommentsLink(collection.hasLink('next') ? collection.link('next').href : null);
    } catch (error) {
      this.store.setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      this.store.setActionRunning(null);
    }
  }

  /**
   * Submits any post or comment action returned by the API.
   *
   * Components pass the action object through without branching on business
   * rules; the action relation and method already came from the server.
   */
  async runAction(action: HypermediaAction, payload?: Record<string, unknown>): Promise<void> {
    this.store.setActionRunning(action.name);
    this.store.setError(null);

    try {
      const updated = await this.client.submit<SocialPostProperties>(action, payload);

      if (action.name === 'delete-post') {
        await this.router.navigate(['/social']);
        return;
      }

      this.store.setResource(updated);
    } catch (error) {
      this.store.setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      this.store.setActionRunning(null);
    }
  }

  /**
   * Keeps the template expressive while preserving link lookup on the resource.
   */
  hasMoreComments(resource: HypermediaResource<SocialPostProperties>): boolean {
    return resource.hasLink('comments-next');
  }
}
