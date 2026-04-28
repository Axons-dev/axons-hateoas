import { Injectable, signal } from '@angular/core';

export type DemoRole = 'CREATOR' | 'REVIEWER' | 'ADMIN';

@Injectable()
export class DemoRoleService {
  /**
   * Small client-side identity switch used by the demo.
   *
   * Real applications would get these values from auth, but headers keep this
   * demo focused on how hypermedia actions change with user context.
   */
  private readonly roleSignal = signal<DemoRole>('CREATOR');
  private readonly userIdSignal = signal('user-1');

  readonly role = this.roleSignal.asReadonly();
  readonly userId = this.userIdSignal.asReadonly();

  setRole(role: DemoRole): void {
    this.roleSignal.set(role);
  }

  setUserId(userId: string): void {
    this.userIdSignal.set(userId);
  }
}
