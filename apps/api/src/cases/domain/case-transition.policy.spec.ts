import { describe, expect, it } from 'vitest';
import { CaseTransitionPolicy } from './case-transition.policy';
import { CaseEntity } from './case.entity';

describe('CaseTransitionPolicy', () => {
  const policy = new CaseTransitionPolicy();

  it('exposes submit for owner creator on draft case', () => {
    const caseEntity = new CaseEntity('CASE-TEST', 'Test', 'Description', 'DRAFT', 'user-1');

    expect(policy.getAvailableActions(caseEntity, { id: 'user-1', role: 'CREATOR' })).toContain('submit');
  });

  it('exposes approve for reviewer on in-review case', () => {
    const caseEntity = new CaseEntity('CASE-TEST', 'Test', 'Description', 'IN_REVIEW', 'user-1');

    expect(policy.getAvailableActions(caseEntity, { id: 'user-2', role: 'REVIEWER' })).toContain('approve');
  });
});
