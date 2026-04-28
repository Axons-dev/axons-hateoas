import { Injectable, signal } from '@angular/core';
import type { HypermediaResource } from '@axons/hateoas-core';

export interface CaseListState {
  collection: HypermediaResource | null;
  loading: boolean;
  error: string | null;
}

@Injectable()
export class CaseListStore {
  private readonly stateSignal = signal<CaseListState>({
    collection: null,
    loading: false,
    error: null,
  });

  readonly state = this.stateSignal.asReadonly();

  patch(partial: Partial<CaseListState>): void {
    this.stateSignal.update((state) => ({ ...state, ...partial }));
  }
}
