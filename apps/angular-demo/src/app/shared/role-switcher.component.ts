import { Component, inject } from '@angular/core';
import { DemoRole, DemoRoleService } from './demo-role.service';

@Component({
  selector: 'app-role-switcher',
  standalone: true,
  template: `
    <section class="role-switcher">
      <span>Act as</span>
      @for (item of roles; track item) {
        <button
          type="button"
          class="secondary"
          [class.active]="roleService.role() === item"
          (click)="roleService.setRole(item)"
        >
          {{ item }}
        </button>
      }
    </section>
  `,
  styles: [`
    .role-switcher {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem;
    }

    span {
      font-size: 0.85rem;
      font-weight: 800;
      color: #6b7280;
    }

    .active {
      background: #111827;
      color: white;
    }
  `],
})
export class RoleSwitcherComponent {
  readonly roleService = inject(DemoRoleService);
  readonly roles: DemoRole[] = ['CREATOR', 'REVIEWER', 'ADMIN'];
}
