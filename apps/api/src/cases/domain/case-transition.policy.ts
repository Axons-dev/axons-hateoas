import { Injectable } from '@nestjs/common';
import type { DemoUser } from '../../common/demo-auth/demo-user.types';
import type { CaseActionName } from './case-action';
import type { CaseEntity } from './case.entity';

@Injectable()
export class CaseTransitionPolicy {
  /**
   * Computes the actions that should be exposed for a case in the current user context.
   *
   * The policy lives in the domain layer because both command handlers and hypermedia
   * composition need the same business answer: what can this user do now?
   */
  getAvailableActions(caseEntity: CaseEntity, user: DemoUser): CaseActionName[] {
    const isOwner = caseEntity.createdById === user.id;
    const actions: CaseActionName[] = [];

    if (caseEntity.status === 'DRAFT' && isOwner && user.role === 'CREATOR') {
      actions.push('edit', 'submit', 'archive');
    }

    if (caseEntity.status === 'SUBMITTED' && user.role === 'REVIEWER') {
      actions.push('start-review');
    }

    if (caseEntity.status === 'IN_REVIEW' && user.role === 'REVIEWER') {
      actions.push('approve', 'reject', 'request-changes');
    }

    if ((caseEntity.status === 'REJECTED' || caseEntity.status === 'CHANGES_REQUESTED') && isOwner && user.role === 'CREATOR') {
      actions.push('reopen');
    }

    if (caseEntity.status === 'APPROVED' && user.role === 'ADMIN') {
      actions.push('reopen', 'archive');
    }

    return actions;
  }

  /**
   * Guards state-changing commands with the same rules used to expose Siren actions.
   */
  ensureCan(action: CaseActionName, caseEntity: CaseEntity, user: DemoUser): void {
    const available = this.getAvailableActions(caseEntity, user);

    if (!available.includes(action)) {
      throw new Error(`Action ${action} is not available for this user and state.`);
    }
  }
}
