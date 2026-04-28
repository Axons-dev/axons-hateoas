import { describe, expect, it, vi } from 'vitest';
import type { HypermediaResource } from '@axons/hateoas-core';
import { HypermediaResourceStore } from './hypermedia-resource-store';

function createResource(): HypermediaResource<{ id: string }> {
  return {
    classes: ['case'],
    properties: { id: 'CASE-001' },
    links: [],
    actions: [{ name: 'submit', method: 'POST', href: '/submit', fields: [] }],
    entities: [],
    hasLink: () => false,
    link: vi.fn(),
    follow: vi.fn(),
    hasAction: (name) => name === 'submit',
    action: vi.fn(),
    toJSON: vi.fn(),
  };
}

describe('HypermediaResourceStore', () => {
  it('tracks resource, loading, error, and action state', () => {
    const store = new HypermediaResourceStore<{ id: string }>();
    const resource = createResource();

    expect(store.state()).toEqual({
      resource: null,
      loading: false,
      error: null,
      actionRunning: null,
    });

    store.setLoading(true);
    store.setError('Failed');
    store.setActionRunning('submit');
    store.setResource(resource);

    expect(store.state()).toEqual({
      resource,
      loading: true,
      error: null,
      actionRunning: 'submit',
    });
    expect(store.resource()).toBe(resource);
    expect(store.actions()).toEqual(resource.actions);
  });
});
