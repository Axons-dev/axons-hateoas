import { Injectable } from '@nestjs/common';
import { CaseEntity } from '../domain/case.entity';

@Injectable()
export class InMemoryCaseRepository {
  private readonly cases = new Map<string, CaseEntity>([
    [
      'CASE-001',
      new CaseEntity(
        'CASE-001',
        'Supplier validation',
        'Validation case for a new strategic supplier.',
        'DRAFT',
        'user-1',
      ),
    ],
    [
      'CASE-002',
      new CaseEntity(
        'CASE-002',
        'Application security audit',
        'Case submitted for review by a security owner.',
        'SUBMITTED',
        'user-1',
      ),
    ],
    [
      'CASE-003',
      new CaseEntity(
        'CASE-003',
        'Subscription funnel redesign',
        'Case already under review.',
        'IN_REVIEW',
        'user-2',
      ),
    ],
    [
      'CASE-004',
      new CaseEntity(
        'CASE-004',
        'Infrastructure migration',
        'Approved case waiting to be archived.',
        'APPROVED',
        'user-1',
      ),
    ],
  ]);

  findAll(): CaseEntity[] {
    return [...this.cases.values()];
  }

  findOne(id: string): CaseEntity {
    const found = this.cases.get(id);

    if (!found) {
      throw new Error(`Case not found: ${id}`);
    }

    return found;
  }

  save(caseEntity: CaseEntity): CaseEntity {
    this.cases.set(caseEntity.id, caseEntity);
    return caseEntity;
  }
}
