export type RouteFactory = (params: Record<string, any>) => string;

export class RouteUrlResolver {
  constructor(private readonly routes: Record<string, RouteFactory>) {}

  route(name: string, params: Record<string, any> = {}): string {
    const factory = this.routes[name];

    if (!factory) {
      throw new Error(`HATEOAS route not registered: ${name}`);
    }

    return factory(params);
  }
}
