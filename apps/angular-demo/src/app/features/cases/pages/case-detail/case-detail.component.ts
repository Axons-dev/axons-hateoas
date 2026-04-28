import { JsonPipe } from '@angular/common';
import { Component, OnInit, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import type { HypermediaAction } from '@axons/hateoas-core';
import { DemoRoleService } from '../../../../shared/demo-role.service';
import { ActionPayloadFormComponent } from '../../components/action-payload-form.component';
import { CaseActionBarComponent } from '../../components/case-action-bar.component';
import { CaseDetailBusiness } from './case-detail.business';
import { CaseDetailStore } from './case-detail.store';

@Component({
  selector: 'app-case-detail',
  standalone: true,
  imports: [JsonPipe, RouterLink, CaseActionBarComponent, ActionPayloadFormComponent],
  providers: [CaseDetailBusiness, CaseDetailStore],
  templateUrl: './case-detail.component.html',
})
export class CaseDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly roles = inject(DemoRoleService);
  readonly business = inject(CaseDetailBusiness);
  readonly state = this.business.state;
  readonly pendingAction = signal<HypermediaAction | null>(null);

  constructor() {
    let previousRole = this.roles.role();

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

  async onAction(action: HypermediaAction): Promise<void> {
    if (action.fields.length > 0) {
      this.pendingAction.set(action);
      return;
    }

    await this.business.runAction(action.name);
  }

  async submitPayload(payload: Record<string, unknown>): Promise<void> {
    const action = this.pendingAction();

    if (!action) {
      return;
    }

    this.pendingAction.set(null);
    await this.business.runAction(action.name, payload);
  }
}
