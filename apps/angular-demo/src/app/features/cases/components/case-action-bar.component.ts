import { Component, EventEmitter, Input, Output } from '@angular/core';
import type { HypermediaAction } from '@axonsdev/hateoas-core';

@Component({
  selector: 'app-case-action-bar',
  standalone: true,
  template: `
    <div class="actions">
      @for (action of actions; track action.name) {
        <button
          type="button"
          class="primary"
          [disabled]="running === action.name"
          (click)="run.emit(action)"
        >
          {{ action.title ?? action.name }}
        </button>
      }

      @if (actions.length === 0) {
        <p>No action available for this role and state.</p>
      }
    </div>
  `,
  styles: [`
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin: 1rem 0;
    }
  `],
})
export class CaseActionBarComponent {
  @Input({ required: true }) actions: HypermediaAction[] = [];
  @Input() running: string | null = null;
  @Output() run = new EventEmitter<HypermediaAction>();
}
