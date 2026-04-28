import type { HttpMethod } from '@axons/hateoas-core';
import type { SirenAction, SirenEntity, SirenField, SirenLink } from '@axons/hateoas-siren';

export class SirenEntityBuilder<TProperties = Record<string, unknown>> {
  private readonly classes = new Set<string>();
  private propertiesValue?: TProperties;
  private readonly linksValue: SirenLink[] = [];
  private readonly actionsValue: SirenAction[] = [];
  private readonly entitiesValue: SirenEntity[] = [];

  addClass(className: string): this {
    this.classes.add(className);
    return this;
  }

  properties(properties: TProperties): this {
    this.propertiesValue = properties;
    return this;
  }

  link(link: SirenLink): this {
    this.linksValue.push(link);
    return this;
  }

  action(action: SirenAction): this {
    this.actionsValue.push(action);
    return this;
  }

  actionIf(condition: boolean, action: SirenAction): this {
    if (condition) {
      this.action(action);
    }
    return this;
  }

  entity(entity: SirenEntity): this {
    this.entitiesValue.push(entity);
    return this;
  }

  build(): SirenEntity<TProperties> {
    return {
      class: [...this.classes],
      properties: this.propertiesValue,
      links: this.linksValue,
      actions: this.actionsValue,
      entities: this.entitiesValue as never,
    };
  }
}

export class SirenActionBuilder {
  private action: SirenAction;

  constructor(name: string) {
    this.action = {
      name,
      method: 'GET',
      href: '',
      fields: [],
    };
  }

  title(title: string): this {
    this.action.title = title;
    return this;
  }

  method(method: HttpMethod): this {
    this.action.method = method;
    return this;
  }

  href(href: string): this {
    this.action.href = href;
    return this;
  }

  type(type: string): this {
    this.action.type = type;
    return this;
  }

  field(field: SirenField): this {
    this.action.fields = [...(this.action.fields ?? []), field];
    return this;
  }

  build(): SirenAction {
    return this.action;
  }
}

export function sirenEntity<TProperties = Record<string, unknown>>(): SirenEntityBuilder<TProperties> {
  return new SirenEntityBuilder<TProperties>();
}

export function sirenAction(name: string): SirenActionBuilder {
  return new SirenActionBuilder(name);
}

export function sirenLink(rel: string | string[], href: string, extra: Omit<SirenLink, 'rel' | 'href'> = {}): SirenLink {
  return {
    rel: Array.isArray(rel) ? rel : [rel],
    href,
    ...extra,
  };
}

export function sirenField(field: SirenField): SirenField {
  return field;
}
