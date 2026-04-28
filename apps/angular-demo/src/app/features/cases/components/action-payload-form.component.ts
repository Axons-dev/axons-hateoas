import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import type { HypermediaAction } from '@axons/hateoas-core';

@Component({
  selector: 'app-action-payload-form',
  standalone: true,
  template: `
    @if (action) {
      <section class="card modal">
        <h3>{{ action.title ?? action.name }}</h3>

        @for (field of action.fields; track field.name) {
          <label>
            <span>{{ field.title ?? field.name }}</span>
            @if (field.type === 'textarea') {
              <textarea
                [required]="field.required"
                [value]="payload()[field.name] ?? ''"
                (input)="setField(field.name, $any($event.target).value)"
              ></textarea>
            } @else {
              <input
                [required]="field.required"
                [type]="field.type ?? 'text'"
                [value]="payload()[field.name] ?? ''"
                (input)="setField(field.name, $any($event.target).value)"
              />
            }
          </label>
        }

        <div style="display:flex; gap:0.5rem;">
          <button class="primary" type="button" (click)="submit.emit(payload())">Submit</button>
          <button class="secondary" type="button" (click)="cancel.emit()">Cancel</button>
        </div>
      </section>
    }
  `,
  styles: [`
    .modal {
      margin: 1rem 0;
      border-color: #c7d2fe;
    }

    label {
      display: grid;
      gap: 0.35rem;
      margin-bottom: 0.75rem;
      font-weight: 700;
    }

    input,
    textarea {
      border: 1px solid #d1d5db;
      border-radius: 10px;
      padding: 0.7rem;
      font: inherit;
    }

    textarea {
      min-height: 8rem;
      resize: vertical;
      line-height: 1.5;
    }
  `],
})
export class ActionPayloadFormComponent {
  private readonly actionSignal = signal<HypermediaAction | null>(null);

  /**
   * Initializes the form from action field values.
   *
   * Siren actions carry the current value for edit forms, which lets this
   * component stay generic instead of knowing about posts, comments, or cases.
   */
  @Input()
  set action(action: HypermediaAction | null) {
    this.actionSignal.set(action);
    this.payload.set(this.defaultPayload(action));
  }

  get action(): HypermediaAction | null {
    return this.actionSignal();
  }

  @Output() submit = new EventEmitter<Record<string, unknown>>();
  @Output() cancel = new EventEmitter<void>();

  readonly payload = signal<Record<string, unknown>>({});

  setField(name: string, value: unknown): void {
    this.payload.update((current) => ({ ...current, [name]: value }));
  }

  /**
   * Builds the starting payload from optional Siren field values.
   */
  private defaultPayload(action: HypermediaAction | null): Record<string, unknown> {
    if (!action) {
      return {};
    }

    return Object.fromEntries(
      action.fields
        .filter((field) => field.value !== undefined)
        .map((field) => [field.name, field.value]),
    );
  }
}
