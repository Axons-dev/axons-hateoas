import type { CaseStatus } from './case-status';

export class CaseEntity {
  constructor(
    readonly id: string,
    public title: string,
    public description: string,
    public status: CaseStatus,
    readonly createdById: string,
    readonly createdAt: string = new Date().toISOString(),
    public lastDecisionReason?: string,
  ) {}
}
