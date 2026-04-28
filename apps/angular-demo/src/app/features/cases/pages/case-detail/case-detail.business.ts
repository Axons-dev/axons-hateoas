import { Injectable, inject } from '@angular/core';
import { HATEOAS_CLIENT } from '@axons/hateoas-angular';
import { CaseDetailStore } from './case-detail.store';
import type { CaseProperties } from '../../models/case.model';

@Injectable()
export class CaseDetailBusiness {
  private readonly client = inject(HATEOAS_CLIENT);
  private readonly store = inject(CaseDetailStore);

  readonly state = this.store.state;
  private currentId: string | null = null;

  /**
   * Loads a case detail resource and stores the full hypermedia object.
   *
   * Keeping the resource instead of just properties lets the UI submit the exact
   * actions returned by the API.
   */
  async load(id: string): Promise<void> {
    this.currentId = id;
    this.store.setLoading(true);
    this.store.setError(null);

    try {
      const resource = await this.client.get<CaseProperties>(`/api/cases/${id}`);
      this.store.setResource(resource);
    } catch (error) {
      this.store.setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      this.store.setLoading(false);
    }
  }

  async reload(): Promise<void> {
    if (this.currentId) {
      await this.load(this.currentId);
    }
  }

  /**
   * Submits a named action from the current resource.
   *
   * The component does not know target URLs or methods; those are carried by the
   * action object in the Siren response.
   */
  async runAction(name: string, payload?: Record<string, unknown>): Promise<void> {
    const resource = this.state().resource;

    if (!resource) {
      return;
    }

    this.store.setActionRunning(name);
    this.store.setError(null);

    try {
      const updated = await resource.action(name).submit<CaseProperties>(payload);
      this.store.setResource(updated);
    } catch (error) {
      this.store.setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      this.store.setActionRunning(null);
    }
  }
}
