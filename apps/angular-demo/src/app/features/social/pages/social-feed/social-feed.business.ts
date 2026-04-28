import { Injectable, inject } from '@angular/core';
import { HATEOAS_CLIENT } from '@axons/hateoas-angular';
import type { SocialPostProperties } from '../../models/social.model';
import { SocialFeedStore } from './social-feed.store';

@Injectable()
export class SocialFeedBusiness {
  private readonly client = inject(HATEOAS_CLIENT);
  private readonly store = inject(SocialFeedStore);

  readonly state = this.store.state;

  /**
   * Loads the social feed collection resource.
   *
   * The feed still stores a hypermedia resource because each embedded post carries
   * links used by the detail navigation.
   */
  async load(): Promise<void> {
    this.store.setLoading(true);
    this.store.setError(null);

    try {
      const collection = await this.client.get<SocialPostProperties>('/api/social/posts');
      this.store.setResource(collection);
    } catch (error) {
      this.store.setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      this.store.setLoading(false);
    }
  }
}
