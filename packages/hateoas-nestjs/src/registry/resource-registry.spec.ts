import { describe, expect, it } from 'vitest';
import { defineSirenResource } from './resource-definition';
import { ResourceRegistry } from './resource-registry';

class RegisteredEntity {
  constructor(readonly id: string) {}
}

class MissingEntity {}

const definition = defineSirenResource(RegisteredEntity, {
  name: 'registered',
  classes: ['registered'],
  id: (entity) => entity.id,
  properties: {
    id: 'id',
  },
});

describe('ResourceRegistry', () => {
  it('registers and resolves definitions by entity instance and class', () => {
    const registry = new ResourceRegistry([definition as never]);

    expect(registry.getByEntity(new RegisteredEntity('one'))).toBe(definition);
    expect(registry.getByClass(RegisteredEntity)).toBe(definition);
  });

  it('throws useful errors for missing definitions', () => {
    const registry = new ResourceRegistry();

    expect(() => registry.getByEntity(new MissingEntity())).toThrow('No HATEOAS resource definition registered for entity: MissingEntity');
    expect(() => registry.getByClass(MissingEntity)).toThrow('No HATEOAS resource definition registered for class: MissingEntity');
  });
});
