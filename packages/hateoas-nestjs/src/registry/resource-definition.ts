import type { SirenAction, SirenLink } from '@axons/hateoas-siren';
import type { RouteUrlResolver } from '../url/route-url-resolver';

export interface ResourceComposeContext<TEntity, TContext = unknown> {
  entity: TEntity;
  context: TContext;
  url: RouteUrlResolver;
  services: ServiceResolver;
}

export interface ServiceResolver {
  get<TService>(token: unknown): TService;
}

export type ResourcePropertySelector<TEntity, TContext> =
  | keyof TEntity
  | ((input: ResourceComposeContext<TEntity, TContext>) => unknown | Promise<unknown>);

export type ResourceLinkResolver<TEntity, TContext> = (
  input: ResourceComposeContext<TEntity, TContext>,
) => SirenLink | Promise<SirenLink>;

export type ResourceActionResolver<TEntity, TContext> = (
  input: ResourceComposeContext<TEntity, TContext>,
) => SirenAction | null | false | undefined | Promise<SirenAction | null | false | undefined>;

export interface ResourceProfile<TEntity, TContext = unknown> {
  expose: string[];
  links?: string[];
  actions?: string[];
  embedded?: string[];
}

export interface HypermediaResourceDefinition<TEntity = unknown, TContext = unknown> {
  entity: abstract new (...args: any[]) => TEntity;
  name: string;
  classes: string[];
  id: (entity: TEntity) => string;
  properties: Record<string, ResourcePropertySelector<TEntity, TContext>>;
  links?: Record<string, ResourceLinkResolver<TEntity, TContext>>;
  actions?: Record<string, ResourceActionResolver<TEntity, TContext>>;
  profiles?: Record<string, ResourceProfile<TEntity, TContext>>;
}

export function defineSirenResource<TEntity, TContext = unknown>(
  entity: abstract new (...args: any[]) => TEntity,
  definition: Omit<HypermediaResourceDefinition<TEntity, TContext>, 'entity'>,
): HypermediaResourceDefinition<TEntity, TContext> {
  return {
    entity,
    ...definition,
  };
}
