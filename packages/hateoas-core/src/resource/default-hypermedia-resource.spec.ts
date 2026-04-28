import { describe, expect, it, vi } from 'vitest';
import { DefaultHypermediaResource } from './default-hypermedia-resource';
import type { HypermediaClient } from '../client/hypermedia-client';
import { ActionNotFoundError } from '../errors/action-not-found.error';
import { LinkNotFoundError } from '../errors/link-not-found.error';

const client: HypermediaClient = {
  get: vi.fn(),
  follow: vi.fn(),
  submit: vi.fn(),
};

function createResource() {
  return new DefaultHypermediaResource(
    {
      classes: ['case'],
      properties: { id: 'CASE-001' },
      links: [{ rel: ['self'], href: '/api/cases/CASE-001' }],
      actions: [{ name: 'submit', method: 'POST', href: '/api/cases/CASE-001/submit', fields: [] }],
      entities: [],
      raw: { source: 'fixture' },
    },
    client,
  );
}

describe('DefaultHypermediaResource', () => {
  it('finds links and actions', () => {
    const resource = createResource();

    expect(resource.hasLink('self')).toBe(true);
    expect(resource.hasAction('submit')).toBe(true);
    expect(resource.link('self').href).toBe('/api/cases/CASE-001');
    expect(resource.action('submit').name).toBe('submit');
  });

  it('throws explicit errors for missing links and actions', () => {
    const resource = createResource();

    expect(() => resource.link('missing')).toThrow(LinkNotFoundError);
    expect(() => resource.action('missing')).toThrow(ActionNotFoundError);
  });

  it('delegates follow to the client', async () => {
    const resource = createResource();

    await resource.follow('self');

    expect(client.follow).toHaveBeenCalledWith(resource, 'self');
  });

  it('serializes back to the normalized model', () => {
    const resource = createResource();

    expect(resource.toJSON()).toEqual({
      classes: ['case'],
      properties: { id: 'CASE-001' },
      links: [{ rel: ['self'], href: '/api/cases/CASE-001' }],
      actions: [{ name: 'submit', method: 'POST', href: '/api/cases/CASE-001/submit', fields: [] }],
      entities: [],
      raw: { source: 'fixture' },
    });
  });

  it('creates a new resource from a replacement model while keeping behavior', () => {
    const resource = createResource();
    const updated = resource.withModel({
      ...resource.toJSON(),
      links: [{ rel: ['next'], href: '/api/cases?page=2' }],
    });

    expect(updated).toBeInstanceOf(DefaultHypermediaResource);
    expect(updated.hasLink('next')).toBe(true);
    expect(() => updated.link('self')).toThrow(LinkNotFoundError);
  });
});
