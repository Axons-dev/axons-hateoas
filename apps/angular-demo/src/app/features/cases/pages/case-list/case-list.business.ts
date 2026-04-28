import { Injectable, inject } from '@angular/core';
import { HATEOAS_CLIENT } from '@axons/hateoas-angular';
import { CaseListStore } from './case-list.store';

@Injectable()
export class CaseListBusiness {
  private readonly client = inject(HATEOAS_CLIENT);
  private readonly store = inject(CaseListStore);

  readonly state = this.store.state;

  async load(): Promise<void> {
    this.store.patch({ loading: true, error: null });

    try {
      const collection = await this.client.get('/api/cases');
      this.store.patch({ collection });
    } catch (error) {
      this.store.patch({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      this.store.patch({ loading: false });
    }
  }
}
