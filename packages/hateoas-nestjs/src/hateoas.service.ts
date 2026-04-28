import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { HypermediaComposer } from './composer/hypermedia-composer';
import { ResourceRegistry } from './registry/resource-registry';
import type { ServiceResolver } from './registry/resource-definition';
import { RouteUrlResolver } from './url/route-url-resolver';

export class NestServiceResolver implements ServiceResolver {
  constructor(private readonly moduleRef: ModuleRef) {}

  get<TService>(token: unknown): TService {
    return this.moduleRef.get(token as never, { strict: false });
  }
}

export class ResourceResponseBuilder<TEntity, TContext = unknown> {
  private profileName = 'detail';
  private contextValue = {} as TContext;

  constructor(
    private readonly entity: TEntity,
    private readonly composer: HypermediaComposer,
  ) {}

  profile(profile: string): this {
    this.profileName = profile;
    return this;
  }

  withContext(context: TContext): this {
    this.contextValue = context;
    return this;
  }

  async toResponse() {
    return this.composer.compose(this.entity, {
      profile: this.profileName,
      context: this.contextValue,
    });
  }
}

export class CollectionResponseBuilder<TEntity, TContext = unknown> {
  private profileName = 'list';
  private contextValue = {} as TContext;

  constructor(
    private readonly entityClass: abstract new (...args: any[]) => TEntity,
    private readonly entities: TEntity[],
    private readonly composer: HypermediaComposer,
  ) {}

  profile(profile: string): this {
    this.profileName = profile;
    return this;
  }

  withContext(context: TContext): this {
    this.contextValue = context;
    return this;
  }

  async toResponse() {
    return this.composer.composeCollection(this.entityClass, this.entities, {
      profile: this.profileName,
      context: this.contextValue,
    });
  }
}

@Injectable()
export class HateoasService {
  private readonly composer: HypermediaComposer;

  constructor(
    registry: ResourceRegistry,
    url: RouteUrlResolver,
    moduleRef: ModuleRef,
  ) {
    this.composer = new HypermediaComposer(registry, url, new NestServiceResolver(moduleRef));
  }

  resource<TEntity, TContext = unknown>(entity: TEntity): ResourceResponseBuilder<TEntity, TContext> {
    return new ResourceResponseBuilder<TEntity, TContext>(entity, this.composer);
  }

  collection<TEntity, TContext = unknown>(
    entityClass: abstract new (...args: any[]) => TEntity,
    entities: TEntity[],
  ): CollectionResponseBuilder<TEntity, TContext> {
    return new CollectionResponseBuilder<TEntity, TContext>(entityClass, entities, this.composer);
  }
}
