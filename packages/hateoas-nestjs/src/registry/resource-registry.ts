import type { HypermediaResourceDefinition } from './resource-definition';

export class ResourceRegistry {
  private readonly definitions = new Map<Function, HypermediaResourceDefinition>();

  constructor(definitions: HypermediaResourceDefinition[] = []) {
    definitions.forEach((definition) => this.register(definition));
  }

  register(definition: HypermediaResourceDefinition): void {
    this.definitions.set(definition.entity, definition);
  }

  getByEntity<TEntity>(entity: TEntity): HypermediaResourceDefinition<TEntity> {
    const constructor = (entity as object).constructor;
    const definition = this.definitions.get(constructor);

    if (!definition) {
      throw new Error(`No HATEOAS resource definition registered for entity: ${constructor.name}`);
    }

    return definition as HypermediaResourceDefinition<TEntity>;
  }

  getByClass<TEntity>(entityClass: abstract new (...args: any[]) => TEntity): HypermediaResourceDefinition<TEntity> {
    const definition = this.definitions.get(entityClass);

    if (!definition) {
      throw new Error(`No HATEOAS resource definition registered for class: ${entityClass.name}`);
    }

    return definition as HypermediaResourceDefinition<TEntity>;
  }
}
