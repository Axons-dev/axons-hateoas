export type DemoRole = 'CREATOR' | 'REVIEWER' | 'ADMIN';

export interface DemoUser {
  id: string;
  role: DemoRole;
}
