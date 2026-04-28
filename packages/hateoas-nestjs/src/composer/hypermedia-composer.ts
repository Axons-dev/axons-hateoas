import type { SirenAction, SirenEntity, SirenLink } from '@axonsdev/hateoas-siren';
import type { HypermediaResourceDefinition, ResourceComposeContext, ServiceResolver } from '../registry/resource-definition';
import { ResourceRegistry } from '../registry/resource-registry';
import { RouteUrlResolver } from '../url/route-url-resolver';

export interface ComposeOptions<TContext = unknown> {
  profile?: string;
  context: TContext;
}

export class HypermediaComposer {
  constructor(
    private readonly registry: ResourceRegistry,
    private readonly url: RouteUrlResolver,
    private readonly services: ServiceResolver,
  ) {}

  async compose<TEntity, TContext = unknown>(
    entity: TEntity,
    options: ComposeOptions<TContext>,
  ): Promise<SirenEntity> {
    const definition = this.registry.getByEntity(entity) as HypermediaResourceDefinition<TEntity, TContext>;
    return this.composeWithDefinition(entity, definition, options);
  }

  async composeCollection<TEntity, TContext = unknown>(
    entityClass: abstract new (...args: any[]) => TEntity,
    entities: TEntity[],
    options: ComposeOptions<TContext>,
  ): Promise<SirenEntity> {
    const definition = this.registry.getByClass(entityClass) as HypermediaResourceDefinition<TEntity, TContext>;

    const embedded = await Promise.all(
      entities.map(async (entity) => ({
        rel: ['item'],
        ...(await this.composeWithDefinition(entity, definition, options)),
      })),
    );

    return {
      class: [`${definition.name}-collection`],
      properties: {
        total: entities.length,
      },
      entities: embedded as never,
      links: [],
      actions: [],
    };
  }

  private async composeWithDefinition<TEntity, TContext>(
    entity: TEntity,
    definition: HypermediaResourceDefinition<TEntity, TContext>,
    options: ComposeOptions<TContext>,
  ): Promise<SirenEntity> {
    const profile = options.profile ? definition.profiles?.[options.profile] : undefined;
    const composeContext: ResourceComposeContext<TEntity, TContext> = {
      entity,
      context: options.context,
      url: this.url,
      services: this.services,
    };

    return {
      class: definition.classes,
      properties: await this.composeProperties(entity, definition, composeContext, profile?.expose),
      links: await this.composeLinks(definition, composeContext, profile?.links),
      actions: await this.composeActions(definition, composeContext, profile?.actions),
      entities: [],
    };
  }

  private async composeProperties<TEntity, TContext>(
    entity: TEntity,
    definition: HypermediaResourceDefinition<TEntity, TContext>,
    context: ResourceComposeContext<TEntity, TContext>,
    allowed?: string[],
  ): Promise<Record<string, unknown>> {
    const properties: Record<string, unknown> = {};
    const entries = Object.entries(definition.properties).filter(([name]) => !allowed || allowed.includes(name));

    for (const [name, selector] of entries) {
      if (typeof selector === 'function') {
        properties[name] = await selector(context);
      } else {
        properties[name] = entity[selector as keyof TEntity];
      }
    }

    return properties;
  }

  private async composeLinks<TEntity, TContext>(
    definition: HypermediaResourceDefinition<TEntity, TContext>,
    context: ResourceComposeContext<TEntity, TContext>,
    allowed?: string[],
  ): Promise<SirenLink[]> {
    const links: SirenLink[] = [];
    const entries = Object.entries(definition.links ?? {}).filter(([name]) => !allowed || allowed.includes(name));

    for (const [, resolver] of entries) {
      links.push(await resolver(context));
    }

    return links;
  }

  private async composeActions<TEntity, TContext>(
    definition: HypermediaResourceDefinition<TEntity, TContext>,
    context: ResourceComposeContext<TEntity, TContext>,
    allowed?: string[],
  ): Promise<SirenAction[]> {
    const actions: SirenAction[] = [];
    const entries = Object.entries(definition.actions ?? {}).filter(([name]) => !allowed || allowed.includes(name));

    for (const [, resolver] of entries) {
      const action = await resolver(context);
      if (action) {
        actions.push(action);
      }
    }

    return actions;
  }
}
