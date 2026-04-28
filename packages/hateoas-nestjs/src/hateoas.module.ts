import { DynamicModule, Global, Module } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { HateoasService } from './hateoas.service';
import { ResourceRegistry } from './registry/resource-registry';
import type { HypermediaResourceDefinition } from './registry/resource-definition';
import { RouteUrlResolver, type RouteFactory } from './url/route-url-resolver';

export interface HateoasModuleOptions {
  resources: Array<HypermediaResourceDefinition<any, any>>;
  routes: Record<string, RouteFactory>;
}

@Global()
@Module({})
export class HateoasModule {
  static forRoot(options: HateoasModuleOptions): DynamicModule {
    return {
      module: HateoasModule,
      providers: [
        {
          provide: ResourceRegistry,
          useValue: new ResourceRegistry(options.resources),
        },
        {
          provide: RouteUrlResolver,
          useValue: new RouteUrlResolver(options.routes),
        },
        {
          provide: HateoasService,
          useFactory: (registry: ResourceRegistry, url: RouteUrlResolver, moduleRef: ModuleRef) =>
            new HateoasService(registry, url, moduleRef),
          inject: [ResourceRegistry, RouteUrlResolver, ModuleRef],
        },
      ],
      exports: [HateoasService, ResourceRegistry, RouteUrlResolver],
    };
  }
}
