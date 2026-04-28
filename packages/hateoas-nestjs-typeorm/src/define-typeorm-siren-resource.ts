import type { DataSource, EntityTarget } from 'typeorm';
import { defineSirenResource, type HypermediaResourceDefinition } from '@axons/hateoas-nestjs';

export interface TypeOrmSirenResourceOptions<TEntity, TContext = unknown>
  extends Omit<HypermediaResourceDefinition<TEntity, TContext>, 'entity' | 'properties'> {
  dataSource?: DataSource;
  expose: Array<keyof TEntity & string>;
  properties?: HypermediaResourceDefinition<TEntity, TContext>['properties'];
}

/**
 * Assisted TypeORM discovery.
 *
 * Important: this function must never expose every column by default.
 * The `expose` list remains mandatory to prevent sensitive data leaks.
 */
export function defineTypeOrmSirenResource<TEntity extends object, TContext = unknown>(
  entity: EntityTarget<TEntity> & (abstract new (...args: any[]) => TEntity),
  options: TypeOrmSirenResourceOptions<TEntity, TContext>,
): HypermediaResourceDefinition<TEntity, TContext> {
  const properties: HypermediaResourceDefinition<TEntity, TContext>['properties'] = {
    ...Object.fromEntries(options.expose.map((propertyName) => [propertyName, propertyName])),
    ...(options.properties ?? {}),
  };

  if (options.dataSource) {
    const metadata = options.dataSource.getMetadata(entity);
    const knownColumns = new Set(metadata.columns.map((column) => column.propertyName));
    const unknown = options.expose.filter((propertyName) => !knownColumns.has(propertyName));

    if (unknown.length > 0) {
      throw new Error(
        `Unknown TypeORM columns in HATEOAS resource ${metadata.name}: ${unknown.join(', ')}`,
      );
    }
  }

  return defineSirenResource<TEntity, TContext>(entity, {
    ...options,
    properties,
  });
}
