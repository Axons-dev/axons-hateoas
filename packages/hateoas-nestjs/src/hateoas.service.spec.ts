import { describe, expect, it, vi } from 'vitest';
import type { ModuleRef } from '@nestjs/core';
import { HateoasService, NestServiceResolver } from './hateoas.service';
import { defineSirenResource } from './registry/resource-definition';
import { ResourceRegistry } from './registry/resource-registry';
import { RouteUrlResolver } from './url/route-url-resolver';

class CaseEntity {
  constructor(
    readonly id: string,
    readonly title: string,
  ) {}
}

class CasePolicy {
  readonly label = 'policy';
}

const caseResource = defineSirenResource<CaseEntity, { suffix: string }>(CaseEntity, {
  name: 'case',
  classes: ['case'],
  id: (entity) => entity.id,
  properties: {
    id: 'id',
    title: 'title',
    computed: ({ context, services }) => `${services.get<CasePolicy>(CasePolicy).label}-${context.suffix}`,
  },
  profiles: {
    detail: {
      expose: ['id', 'title', 'computed'],
    },
    list: {
      expose: ['id'],
    },
  },
});

function createModuleRef() {
  return {
    get: vi.fn((token: unknown) => {
      if (token === CasePolicy) {
        return new CasePolicy();
      }

      throw new Error('Unknown token');
    }),
  } as unknown as ModuleRef;
}

function createService(moduleRef = createModuleRef()) {
  return new HateoasService(
    new ResourceRegistry([caseResource as never]),
    new RouteUrlResolver({}),
    moduleRef,
  );
}

describe('HateoasService', () => {
  it('resolves Nest providers through NestServiceResolver with non-strict lookup', () => {
    const moduleRef = createModuleRef();
    const resolver = new NestServiceResolver(moduleRef);

    expect(resolver.get<CasePolicy>(CasePolicy)).toBeInstanceOf(CasePolicy);
    expect(moduleRef.get).toHaveBeenCalledWith(CasePolicy, { strict: false });
  });

  it('builds single-resource responses through the fluent builder', async () => {
    const response = await createService()
      .resource<CaseEntity, { suffix: string }>(new CaseEntity('CASE-001', 'Case title'))
      .profile('detail')
      .withContext({ suffix: 'value' })
      .toResponse();

    expect(response).toMatchObject({
      class: ['case'],
      properties: {
        id: 'CASE-001',
        title: 'Case title',
        computed: 'policy-value',
      },
    });
  });

  it('builds collection responses through the fluent builder', async () => {
    const response = await createService()
      .collection<CaseEntity, { suffix: string }>(CaseEntity, [
        new CaseEntity('CASE-001', 'First'),
        new CaseEntity('CASE-002', 'Second'),
      ])
      .profile('list')
      .withContext({ suffix: 'ignored' })
      .toResponse();

    expect(response.class).toEqual(['case-collection']);
    expect(response.properties).toEqual({ total: 2 });
    expect(response.entities?.map((entity) => entity.properties)).toEqual([
      { id: 'CASE-001' },
      { id: 'CASE-002' },
    ]);
  });
});
