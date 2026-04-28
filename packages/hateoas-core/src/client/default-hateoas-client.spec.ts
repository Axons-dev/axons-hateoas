import { describe, expect, it, vi } from 'vitest';
import { createHateoasClient } from './create-hateoas-client';
import { DefaultHateoasClient } from './default-hateoas-client';
import type { HypermediaParser } from '../parser/hypermedia-parser';
import type { HypermediaTransport } from '../transport/hypermedia-transport';
import { UnsupportedMediaTypeError } from '../errors/unsupported-media-type.error';

const parser: HypermediaParser = {
  mediaType: 'application/vnd.test+json',
  supports: (contentType) => contentType.includes('application/vnd.test+json'),
  parse: <TProperties = unknown>(body: unknown) => ({
    classes: ['test'],
    properties: body as TProperties,
    links: [{ rel: ['self'], href: '/self' }],
    actions: [{ name: 'save', method: 'POST', href: '/save', type: 'application/json', fields: [] }],
    entities: [],
    raw: body,
  }),
};

function createTransport(contentType = 'application/vnd.test+json'): HypermediaTransport & { request: ReturnType<typeof vi.fn> } {
  return {
    request: vi.fn(async () => ({
      status: 200,
      contentType,
      headers: {},
      body: { id: 'resource-1' },
    })),
  };
}

describe('DefaultHateoasClient', () => {
  it('is created by the factory', () => {
    const client = createHateoasClient({ transport: createTransport(), parsers: [parser] });

    expect(client).toBeInstanceOf(DefaultHateoasClient);
  });

  it('loads and parses a resource with the default Accept header', async () => {
    const transport = createTransport();
    const client = new DefaultHateoasClient({ transport, parsers: [parser] });

    const resource = await client.get('/resource');

    expect(transport.request).toHaveBeenCalledWith({
      method: 'GET',
      href: '/resource',
      headers: { Accept: 'application/vnd.test+json' },
    });
    expect(resource.properties).toEqual({ id: 'resource-1' });
  });

  it('follows a link through get', async () => {
    const transport = createTransport();
    const client = new DefaultHateoasClient({ transport, parsers: [parser] });
    const resource = await client.get('/resource');

    await client.follow(resource, 'self');

    expect(transport.request).toHaveBeenLastCalledWith({
      method: 'GET',
      href: '/self',
      headers: { Accept: 'application/vnd.test+json' },
    });
  });

  it('submits non-GET actions with content type and body', async () => {
    const transport = createTransport();
    const client = new DefaultHateoasClient({ transport, parsers: [parser], defaultAccept: 'application/custom+json' });

    await client.submit({
      name: 'save',
      method: 'POST',
      href: '/save',
      type: 'application/vnd.form+json',
      fields: [],
    }, { title: 'Saved' });

    expect(transport.request).toHaveBeenCalledWith({
      method: 'POST',
      href: '/save',
      headers: {
        Accept: 'application/custom+json',
        'Content-Type': 'application/vnd.form+json',
      },
      body: { title: 'Saved' },
    });
  });

  it('submits GET actions without a body or content type', async () => {
    const transport = createTransport();
    const client = new DefaultHateoasClient({ transport, parsers: [parser] });

    await client.submit({ name: 'search', method: 'GET', href: '/search', fields: [] }, { q: 'ignored' });

    expect(transport.request).toHaveBeenCalledWith({
      method: 'GET',
      href: '/search',
      headers: { Accept: 'application/vnd.test+json' },
      body: undefined,
    });
  });

  it('throws when no parser supports the response content type', async () => {
    const client = new DefaultHateoasClient({ transport: createTransport('application/unknown'), parsers: [parser] });

    await expect(client.get('/resource')).rejects.toThrow(UnsupportedMediaTypeError);
  });
});
