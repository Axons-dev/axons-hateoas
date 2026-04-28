import { Inject, Injectable } from '@nestjs/common';
import type { DemoUser } from '../common/demo-auth/demo-user.types';
import { CaseTransitionPolicy } from './domain/case-transition.policy';
import type { CaseEntity } from './domain/case.entity';
import { InMemoryCaseRepository } from './infrastructure/in-memory-case.repository';

@Injectable()
export class CasesService {
  constructor(
    @Inject(InMemoryCaseRepository)
    private readonly repository: InMemoryCaseRepository,
    @Inject(CaseTransitionPolicy)
    private readonly policy: CaseTransitionPolicy,
  ) {}

  findAll(): CaseEntity[] {
    return this.repository.findAll();
  }

  findOne(id: string): CaseEntity {
    return this.repository.findOne(id);
  }

  /**
   * Applies a partial edit after checking the domain transition policy.
   *
   * The service owns mutations because controllers should only translate HTTP input
   * and hypermedia resources should only describe what is possible.
   */
  update(id: string, input: { title?: string; description?: string }, user: DemoUser): CaseEntity {
    const caseEntity = this.repository.findOne(id);
    this.policy.ensureCan('edit', caseEntity, user);

    caseEntity.title = input.title ?? caseEntity.title;
    caseEntity.description = input.description ?? caseEntity.description;

    return this.repository.save(caseEntity);
  }

  submit(id: string, user: DemoUser): CaseEntity {
    const caseEntity = this.repository.findOne(id);
    this.policy.ensureCan('submit', caseEntity, user);
    caseEntity.status = 'SUBMITTED';
    return this.repository.save(caseEntity);
  }

  startReview(id: string, user: DemoUser): CaseEntity {
    const caseEntity = this.repository.findOne(id);
    this.policy.ensureCan('start-review', caseEntity, user);
    caseEntity.status = 'IN_REVIEW';
    return this.repository.save(caseEntity);
  }

  approve(id: string, user: DemoUser): CaseEntity {
    const caseEntity = this.repository.findOne(id);
    this.policy.ensureCan('approve', caseEntity, user);
    caseEntity.status = 'APPROVED';
    caseEntity.lastDecisionReason = undefined;
    return this.repository.save(caseEntity);
  }

  reject(id: string, input: { reason: string }, user: DemoUser): CaseEntity {
    const caseEntity = this.repository.findOne(id);
    this.policy.ensureCan('reject', caseEntity, user);
    caseEntity.status = 'REJECTED';
    caseEntity.lastDecisionReason = input.reason;
    return this.repository.save(caseEntity);
  }

  requestChanges(id: string, input: { reason: string }, user: DemoUser): CaseEntity {
    const caseEntity = this.repository.findOne(id);
    this.policy.ensureCan('request-changes', caseEntity, user);
    caseEntity.status = 'CHANGES_REQUESTED';
    caseEntity.lastDecisionReason = input.reason;
    return this.repository.save(caseEntity);
  }

  reopen(id: string, user: DemoUser): CaseEntity {
    const caseEntity = this.repository.findOne(id);
    this.policy.ensureCan('reopen', caseEntity, user);
    caseEntity.status = user.role === 'ADMIN' ? 'IN_REVIEW' : 'DRAFT';
    return this.repository.save(caseEntity);
  }

  archive(id: string, user: DemoUser): CaseEntity {
    const caseEntity = this.repository.findOne(id);
    this.policy.ensureCan('archive', caseEntity, user);
    caseEntity.status = 'ARCHIVED';
    return this.repository.save(caseEntity);
  }
}
