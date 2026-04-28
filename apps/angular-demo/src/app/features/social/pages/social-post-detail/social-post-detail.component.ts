import { JsonPipe } from '@angular/common';
import { Component, OnInit, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import type { HypermediaAction, HypermediaEmbeddedEntity, HypermediaResource } from '@axons/hateoas-core';
import { DemoRoleService } from '../../../../shared/demo-role.service';
import { ActionPayloadFormComponent } from '../../../cases/components/action-payload-form.component';
import { CaseActionBarComponent } from '../../../cases/components/case-action-bar.component';
import { SocialPostDetailBusiness } from './social-post-detail.business';
import { SocialPostDetailStore } from './social-post-detail.store';
import type { SocialCommentProperties, SocialPostProperties } from '../../models/social.model';

@Component({
  selector: 'app-social-post-detail',
  standalone: true,
  imports: [JsonPipe, RouterLink, CaseActionBarComponent, ActionPayloadFormComponent],
  providers: [SocialPostDetailBusiness, SocialPostDetailStore],
  templateUrl: './social-post-detail.component.html',
})
export class SocialPostDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly roles = inject(DemoRoleService);
  readonly business = inject(SocialPostDetailBusiness);
  readonly state = this.business.state;
  readonly pendingAction = signal<HypermediaAction | null>(null);

  constructor() {
    let previousRole = this.roles.role();

    // Angular effects run once immediately. The guard prevents a duplicate detail
    // request on first render while still refreshing when the role later changes.
    effect(() => {
      const currentRole = this.roles.role();

      if (currentRole === previousRole) {
        return;
      }

      previousRole = currentRole;
      void this.business.reload();
    });
  }

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      await this.business.load(id);
    }
  }

  /**
   * Opens a generated form only when the Siren action declares fields.
   */
  async onAction(action: HypermediaAction): Promise<void> {
    if (action.fields.length > 0) {
      this.pendingAction.set(action);
      return;
    }

    await this.business.runAction(action);
  }

  async submitPayload(payload: Record<string, unknown>): Promise<void> {
    const action = this.pendingAction();

    if (!action) {
      return;
    }

    this.pendingAction.set(null);
    await this.business.runAction(action, payload);
  }

  /**
   * Filters embedded entities to comments so pagination remains robust if the API
   * later embeds additional relation types in the post detail resource.
   */
  comments(resource: HypermediaResource<SocialPostProperties>): Array<HypermediaEmbeddedEntity<SocialCommentProperties>> {
    return resource.entities.filter((entity) => entity.classes.includes('social-comment')) as unknown as Array<HypermediaEmbeddedEntity<SocialCommentProperties>>;
  }
}
