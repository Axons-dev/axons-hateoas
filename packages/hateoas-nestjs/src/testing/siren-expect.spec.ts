import { describe, expect, it } from 'vitest';
import { getSirenAction, hasSirenAction, hasSirenLink } from './siren-expect';

const entity = {
  actions: [{ name: 'approve', method: 'POST' as const, href: '/approve' }],
  links: [{ rel: ['self', 'canonical'], href: '/self' }],
};

describe('Siren test helpers', () => {
  it('checks actions and links', () => {
    expect(hasSirenAction(entity, 'approve')).toBe(true);
    expect(hasSirenAction(entity, 'missing')).toBe(false);
    expect(hasSirenLink(entity, 'canonical')).toBe(true);
    expect(hasSirenLink(entity, 'missing')).toBe(false);
    expect(getSirenAction(entity, 'approve')).toEqual({ name: 'approve', method: 'POST', href: '/approve' });
    expect(getSirenAction(entity, 'missing')).toBeNull();
  });
});
