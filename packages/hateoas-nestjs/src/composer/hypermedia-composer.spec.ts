import { describe, expect, it } from 'vitest';
import { HypermediaComposer } from './hypermedia-composer';
import { defineSirenResource } from '../registry/resource-definition';
import { ResourceRegistry } from '../registry/resource-registry';
import { RouteUrlResolver } from '../url/route-url-resolver';
import { sirenAction, sirenLink } from '../siren/siren-builders';

class CaseEntity {
  constructor(
    readonly id: string,
    readonly title: string,
    readonly hidden: string,
  ) {}
}

class PolicyService {
  canEdit = true;
}

const policy = new PolicyService();

const resource = defineSirenResource<CaseEntity, { suffix: string }>(CaseEntity, {
  name: 'case',
  classes: ['case'],
  id: (entity) => entity.id,
  properties: {
    id: 'id',
    title: 'title',
    hidden: 'hidden',
    computed: ({ entity, context }) => `${entity.id}-${context.suffix}`,
  },
  profiles: {
    list: {
      expose: ['id', 'title'],
      links: ['self'],
      actions: [],
    },
    detail: {
      expose: ['id', 'title', 'computed'],
      links: ['self', 'collection'],
      actions: ['edit'],
    },
  },
  links: {
    self: ({ entity, url }) => sirenLink('self', url.route('cases.findOne', { id: entity.id })),
    collection: ({ url }) => sirenLink('collection', url.route('cases.findAll')),
  },
  actions: {
    edit: ({ entity, services, url }) => {
      const policyService = services.get<PolicyService>(PolicyService);

      if (!policyService.canEdit) {
        return null;
      }

      return sirenAction('edit')
        .method('PATCH')
        .href(url.route('cases.edit', { id: entity.id }))
        .build();
    },
  },
});

function createComposer() {
  return new HypermediaComposer(
    new ResourceRegistry([resource as never]),
    new RouteUrlResolver({
      'cases.findAll': () => '/api/cases',
      'cases.findOne': ({ id }) => `/api/cases/${id}`,
      'cases.edit': ({ id }) => `/api/cases/${id}`,
    }),
    {
      get: (token) => {
        if (token === PolicyService) {
          return policy as never;
        }

        throw new Error('Unknown service');
      },
    },
  );
}

describe('HypermediaComposer', () => {
  it('composes profile-filtered resource properties, links, and actions', async () => {
    policy.canEdit = true;
    const entity = new CaseEntity('CASE-001', 'Case title', 'secret');

    const siren = await createComposer().compose(entity, {
      profile: 'detail',
      context: { suffix: 'detail' },
    });

    expect(siren).toEqual({
      class: ['case'],
      properties: {
        id: 'CASE-001',
        title: 'Case title',
        computed: 'CASE-001-detail',
      },
      links: [
        { rel: ['self'], href: '/api/cases/CASE-001' },
        { rel: ['collection'], href: '/api/cases' },
      ],
      actions: [
        { name: 'edit', method: 'PATCH', href: '/api/cases/CASE-001', fields: [] },
      ],
      entities: [],
    });
  });

  it('omits actions when resolvers return null', async () => {
    policy.canEdit = false;

    const siren = await createComposer().compose(new CaseEntity('CASE-001', 'Case title', 'secret'), {
      profile: 'detail',
      context: { suffix: 'detail' },
    });

    expect(siren.actions).toEqual([]);
  });

  it('composes collections with embedded list-profile items', async () => {
    const siren = await createComposer().composeCollection(
      CaseEntity,
      [new CaseEntity('CASE-001', 'First', 'secret'), new CaseEntity('CASE-002', 'Second', 'secret')],
      {
        profile: 'list',
        context: { suffix: 'list' },
      },
    );

    expect(siren.class).toEqual(['case-collection']);
    expect(siren.properties).toEqual({ total: 2 });
    expect(siren.entities).toEqual([
      {
        rel: ['item'],
        class: ['case'],
        properties: { id: 'CASE-001', title: 'First' },
        links: [{ rel: ['self'], href: '/api/cases/CASE-001' }],
        actions: [],
        entities: [],
      },
      {
        rel: ['item'],
        class: ['case'],
        properties: { id: 'CASE-002', title: 'Second' },
        links: [{ rel: ['self'], href: '/api/cases/CASE-002' }],
        actions: [],
        entities: [],
      },
    ]);
  });
});
