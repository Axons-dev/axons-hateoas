import { describe, expect, it, vi } from 'vitest';
import { DefaultHypermediaActionRef } from './default-hypermedia-action-ref';
import type { HypermediaClient } from '../client/hypermedia-client';
import type { HypermediaAction } from '../model/hypermedia-action';
import { DefaultHypermediaResource } from './default-hypermedia-resource';
import { InvalidActionPayloadError } from '../errors/invalid-action-payload.error';

describe('DefaultHypermediaActionRef', () => {
  const submitted: Array<{ action: unknown; payload: unknown }> = [];

  const client: HypermediaClient = {
    get: vi.fn(),
    follow: vi.fn(),
    submit: async <TProperties = unknown>(
      action: HypermediaAction,
      payload?: Record<string, unknown>,
    ): Promise<DefaultHypermediaResource<TProperties>> => {
      submitted.push({ action, payload });

      return new DefaultHypermediaResource<TProperties>({
        classes: [],
        properties: {} as TProperties,
        links: [],
        actions: [],
        entities: [],
      }, {} as HypermediaClient);
    },
  };

  it('exposes action metadata', () => {
    const ref = new DefaultHypermediaActionRef({
      name: 'edit',
      title: 'Edit',
      method: 'PATCH',
      href: '/edit',
      fields: [{ name: 'title', required: true }],
    }, client);

    expect(ref.name).toBe('edit');
    expect(ref.title).toBe('Edit');
    expect(ref.fields).toEqual([{ name: 'title', required: true }]);
  });

  it('submits valid payloads through the client', async () => {
    const action = {
      name: 'edit',
      method: 'PATCH' as const,
      href: '/edit',
      fields: [{ name: 'title', required: true }],
    };
    const ref = new DefaultHypermediaActionRef(action, client);

    await ref.submit({ title: 'Updated' });

    expect(submitted.at(-1)).toEqual({ action, payload: { title: 'Updated' } });
  });

  it('rejects missing required fields', async () => {
    const ref = new DefaultHypermediaActionRef({
      name: 'edit',
      method: 'PATCH',
      href: '/edit',
      fields: [{ name: 'title', required: true }],
    }, client);

    await expect(ref.submit({ title: '' })).rejects.toThrow(InvalidActionPayloadError);
  });
});
