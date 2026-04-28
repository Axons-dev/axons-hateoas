export interface CaseProperties {
  id: string;
  title: string;
  description?: string;
  status: string;
  createdById?: string;
  createdAt?: string;
  lastDecisionReason?: string;
}
