import { describe, expect, it } from 'vitest';
import { defineTypeOrmSirenResource } from './define-typeorm-siren-resource';

class ArticleEntity {
  constructor(
    readonly id: string,
    readonly title: string,
    readonly internalToken: string,
  ) {}
}

function createDataSource(columnNames: string[]) {
  return {
    getMetadata: () => ({
      name: 'ArticleEntity',
      columns: columnNames.map((propertyName) => ({ propertyName })),
    }),
  };
}

describe('defineTypeOrmSirenResource', () => {
  it('creates explicit property mappings from expose', () => {
    const definition = defineTypeOrmSirenResource(ArticleEntity, {
      name: 'article',
      classes: ['article'],
      id: (entity) => entity.id,
      expose: ['id', 'title'],
    });

    expect(definition.entity).toBe(ArticleEntity);
    expect(definition.properties).toEqual({
      id: 'id',
      title: 'title',
    });
  });

  it('allows custom properties to extend exposed columns', async () => {
    const definition = defineTypeOrmSirenResource(ArticleEntity, {
      name: 'article',
      classes: ['article'],
      id: (entity) => entity.id,
      expose: ['id'],
      properties: {
        titleLabel: ({ entity }) => `Title: ${entity.title}`,
      },
    });

    expect(definition.properties.id).toBe('id');
    expect((definition.properties.titleLabel as Function)({
      entity: new ArticleEntity('ART-001', 'Hypermedia', 'secret'),
    })).toBe('Title: Hypermedia');
  });

  it('validates exposed columns when a DataSource is provided', () => {
    expect(() =>
      defineTypeOrmSirenResource(ArticleEntity, {
        dataSource: createDataSource(['id']) as never,
        name: 'article',
        classes: ['article'],
        id: (entity) => entity.id,
        expose: ['id', 'title'],
      }),
    ).toThrow('Unknown TypeORM columns in HATEOAS resource ArticleEntity: title');
  });
});
