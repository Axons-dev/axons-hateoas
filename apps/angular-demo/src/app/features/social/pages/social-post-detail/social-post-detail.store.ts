import { Injectable } from '@angular/core';
import { HypermediaResourceStore } from '@axonsdev/hateoas-angular';
import type { DefaultHypermediaResource, HypermediaEmbeddedEntity } from '@axonsdev/hateoas-core';
import type { SocialPostProperties } from '../../models/social.model';

@Injectable()
export class SocialPostDetailStore extends HypermediaResourceStore<SocialPostProperties> {
  /**
   * Appends a comment page while preserving the resource prototype.
   *
   * A plain object spread would lose `hasLink`, `link`, and `action`, so the core
   * resource recreates itself from a model through `withModel`.
   */
  appendEntities(entities: HypermediaEmbeddedEntity[]): void {
    const resource = this.state().resource;

    if (!resource) {
      return;
    }

    this.setResource((resource as DefaultHypermediaResource<SocialPostProperties>).withModel({
      ...resource.toJSON(),
      entities: [...resource.entities, ...entities],
      links: resource.links.filter((link) => !link.rel.includes('comments-next')),
    }));
  }

  /**
   * Replaces the pagination link after a page is loaded.
   *
   * The next link is stored on the post resource because the detail screen asks
   * only "can I load more?" and does not need to keep pagination counters itself.
   */
  setNextCommentsLink(href: string | null): void {
    const resource = this.state().resource;

    if (!resource) {
      return;
    }

    const links = resource.links.filter((link) => !link.rel.includes('comments-next'));

    if (href) {
      links.push({
        rel: ['comments-next'],
        href,
      });
    }

    this.setResource((resource as DefaultHypermediaResource<SocialPostProperties>).withModel({
      ...resource.toJSON(),
      links,
    }));
  }
}
