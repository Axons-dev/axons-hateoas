import { describe, expect, it } from 'vitest';
import { RouteUrlResolver } from './route-url-resolver';

describe('RouteUrlResolver', () => {
  it('resolves named routes with params', () => {
    const resolver = new RouteUrlResolver({
      'cases.findOne': ({ id }) => `/api/cases/${id}`,
    });

    expect(resolver.route('cases.findOne', { id: 'CASE-001' })).toBe('/api/cases/CASE-001');
  });

  it('throws for missing route names', () => {
    const resolver = new RouteUrlResolver({});

    expect(() => resolver.route('missing')).toThrow('HATEOAS route not registered: missing');
  });
});
