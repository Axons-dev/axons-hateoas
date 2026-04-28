import { describe, expect, it } from 'vitest';
import { ModuleRef } from '@nestjs/core';
import { HateoasModule } from './hateoas.module';
import { HateoasService } from './hateoas.service';
import { ResourceRegistry } from './registry/resource-registry';
import { RouteUrlResolver } from './url/route-url-resolver';

describe('HateoasModule', () => {
  it('registers registry, route resolver, and service providers', () => {
    const module = HateoasModule.forRoot({
      resources: [],
      routes: {
        root: () => '/api',
      },
    });

    expect(module.module).toBe(HateoasModule);
    expect(module.exports).toEqual([HateoasService, ResourceRegistry, RouteUrlResolver]);
    expect(module.providers).toHaveLength(3);

    const registryProvider = module.providers?.[0] as { provide: unknown; useValue: unknown };
    const routeProvider = module.providers?.[1] as { provide: unknown; useValue: RouteUrlResolver };
    const serviceProvider = module.providers?.[2] as {
      provide: unknown;
      inject: unknown[];
      useFactory: (registry: ResourceRegistry, url: RouteUrlResolver, moduleRef: ModuleRef) => HateoasService;
    };

    expect(registryProvider.provide).toBe(ResourceRegistry);
    expect(registryProvider.useValue).toBeInstanceOf(ResourceRegistry);
    expect(routeProvider.provide).toBe(RouteUrlResolver);
    expect(routeProvider.useValue.route('root')).toBe('/api');
    expect(serviceProvider.provide).toBe(HateoasService);
    expect(serviceProvider.inject).toEqual([ResourceRegistry, RouteUrlResolver, ModuleRef]);
    expect(serviceProvider.useFactory(new ResourceRegistry(), new RouteUrlResolver({}), {} as ModuleRef)).toBeInstanceOf(HateoasService);
  });
});
