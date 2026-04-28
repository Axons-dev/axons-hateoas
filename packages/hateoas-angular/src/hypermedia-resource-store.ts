import { computed, signal } from '@angular/core';
import type { HypermediaResource } from '@axonsdev/hateoas-core';

export interface HypermediaResourceState<TProperties = unknown> {
  resource: HypermediaResource<TProperties> | null;
  loading: boolean;
  error: string | null;
  actionRunning: string | null;
}

export class HypermediaResourceStore<TProperties = unknown> {
  private readonly stateSignal = signal<HypermediaResourceState<TProperties>>({
    resource: null,
    loading: false,
    error: null,
    actionRunning: null,
  });

  readonly state = this.stateSignal.asReadonly();
  readonly resource = computed(() => this.state().resource);
  readonly actions = computed(() => this.state().resource?.actions ?? []);

  setResource(resource: HypermediaResource<TProperties> | null): void {
    this.patch({ resource, error: null });
  }

  setLoading(loading: boolean): void {
    this.patch({ loading });
  }

  setError(error: string | null): void {
    this.patch({ error });
  }

  setActionRunning(actionRunning: string | null): void {
    this.patch({ actionRunning });
  }

  private patch(partial: Partial<HypermediaResourceState<TProperties>>): void {
    this.stateSignal.update((state) => ({
      ...state,
      ...partial,
    }));
  }
}
