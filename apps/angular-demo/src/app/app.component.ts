import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { RoleSwitcherComponent } from './shared/role-switcher.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, RoleSwitcherComponent],
  template: `
    <main class="shell">
      <header class="hero card">
        <div>
          <p class="eyebrow">Axons HATEOAS Demo</p>
          <h1>Generic hypermedia client + Angular integration</h1>
          <p>
            Available actions come from the Siren API, not from business rules hardcoded in components.
          </p>
        </div>
        <app-role-switcher />
      </header>

      <nav class="tabs" aria-label="Demos">
        <a routerLink="/cases" routerLinkActive="active">Cases</a>
        <a routerLink="/social" routerLinkActive="active">Feed social</a>
      </nav>

      <router-outlet />
    </main>
  `,
  styles: [`
    .shell {
      max-width: 1100px;
      margin: 0 auto;
      padding: 2rem;
    }

    .hero {
      display: flex;
      justify-content: space-between;
      gap: 1.5rem;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .eyebrow {
      text-transform: uppercase;
      font-size: 0.8rem;
      letter-spacing: 0.1em;
      font-weight: 800;
      color: #6366f1;
    }

    h1 {
      margin: 0;
      font-size: clamp(1.6rem, 4vw, 2.5rem);
    }

    .tabs {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .tabs a {
      padding: 0.75rem 1rem;
      text-decoration: none;
      font-weight: 800;
      border-bottom: 3px solid transparent;
    }

    .tabs a.active {
      color: #111827;
      border-bottom-color: #111827;
    }
  `],
})
export class AppComponent {}
