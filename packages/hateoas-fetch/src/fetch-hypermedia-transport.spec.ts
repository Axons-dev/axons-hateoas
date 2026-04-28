import { describe, expect, it, vi } from 'vitest';
import { HypermediaHttpError } from '@axons/hateoas-core';
import { FetchHypermediaTransport, fetchTransport } from './fetch-hypermedia-transport';

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
    ...init,
  });
}

describe('FetchHypermediaTransport', () => {
  it('is created by the factory', () => {
    expect(fetchTransport()).toBeInstanceOf(FetchHypermediaTransport);
  });

  it('resolves base URLs, merges headers, and serializes JSON bodies', async () => {
    const fetchFn = vi.fn(async () => jsonResponse({ ok: true }));
    const transport = new FetchHypermediaTransport({
      baseUrl: 'https://api.example.com/root/',
      credentials: 'include',
      headers: async () => ({ Authorization: 'Bearer token', Accept: 'application/custom' }),
      fetchFn: fetchFn as unknown as typeof fetch,
    });

    const response = await transport.request({
      method: 'POST',
      href: '/cases',
      headers: { Accept: 'application/vnd.siren+json' },
      body: { title: 'Case' },
    });

    expect(fetchFn).toHaveBeenCalledWith('https://api.example.com/cases', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer token',
        Accept: 'application/vnd.siren+json',
      },
      credentials: 'include',
      body: JSON.stringify({ title: 'Case' }),
    });
    expect(response.body).toEqual({ ok: true });
  });

  it('returns undefined bodies for 204 responses', async () => {
    const transport = new FetchHypermediaTransport({
      fetchFn: vi.fn(async () => new Response(null, { status: 204 })) as unknown as typeof fetch,
    });

    await expect(transport.request({ method: 'GET', href: '/empty', headers: {} })).resolves.toMatchObject({
      status: 204,
      body: undefined,
    });
  });

  it('reads text responses when content type is not JSON', async () => {
    const transport = new FetchHypermediaTransport({
      fetchFn: vi.fn(async () => new Response('plain text', {
        status: 200,
        headers: { 'content-type': 'text/plain' },
      })) as unknown as typeof fetch,
    });

    const response = await transport.request({ method: 'GET', href: '/text', headers: {} });

    expect(response.body).toBe('plain text');
  });

  it('throws HypermediaHttpError for non-OK responses', async () => {
    const transport = new FetchHypermediaTransport({
      fetchFn: vi.fn(async () => jsonResponse({ message: 'nope' }, { status: 403 })) as unknown as typeof fetch,
    });

    await expect(transport.request({ method: 'GET', href: '/forbidden', headers: {} })).rejects.toMatchObject({
      name: 'HypermediaHttpError',
      status: 403,
      body: { message: 'nope' },
    } satisfies Partial<HypermediaHttpError>);
  });
});
