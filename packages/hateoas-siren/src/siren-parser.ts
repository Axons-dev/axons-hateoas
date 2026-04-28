import type {
  HypermediaAction,
  HypermediaEmbeddedEntity,
  HypermediaField,
  HypermediaLink,
  HypermediaParser,
  HypermediaResourceModel,
  HttpMethod,
} from '@axons/hateoas-core';
import type { SirenAction, SirenEmbeddedEntity, SirenEntity, SirenField, SirenLink } from './siren.types';

export const SIREN_MEDIA_TYPE = 'application/vnd.siren+json';

export class SirenParser implements HypermediaParser {
  readonly mediaType = SIREN_MEDIA_TYPE;

  supports(contentType: string): boolean {
    return contentType.toLowerCase().includes(SIREN_MEDIA_TYPE);
  }

  parse<TProperties = unknown>(body: unknown): HypermediaResourceModel<TProperties> {
    const entity = body as SirenEntity<TProperties>;

    return {
      classes: entity.class ?? [],
      properties: (entity.properties ?? {}) as TProperties,
      links: this.mapLinks(entity.links),
      actions: this.mapActions(entity.actions),
      entities: this.mapEmbedded(entity.entities),
      raw: body,
    };
  }

  private mapLinks(links: SirenLink[] = []): HypermediaLink[] {
    return links.map((link) => ({
      rel: link.rel,
      href: link.href,
      title: link.title,
      type: link.type,
    }));
  }

  private mapActions(actions: SirenAction[] = []): HypermediaAction[] {
    return actions.map((action) => ({
      name: action.name,
      title: action.title,
      method: action.method ?? 'GET' as HttpMethod,
      href: action.href,
      type: action.type,
      fields: this.mapFields(action.fields),
    }));
  }

  private mapFields(fields: SirenField[] = []): HypermediaField[] {
    return fields.map((field) => ({
      name: field.name,
      type: field.type,
      title: field.title,
      value: field.value,
      required: field.required,
      options: field.options,
    }));
  }

  private mapEmbedded(entities: SirenEmbeddedEntity[] = []): HypermediaEmbeddedEntity[] {
    return entities.map((entity) => ({
      rel: entity.rel,
      classes: entity.class ?? [],
      properties: entity.properties ?? {},
      links: this.mapLinks(entity.links),
      actions: this.mapActions(entity.actions),
      entities: this.mapEmbedded(entity.entities),
      raw: entity,
    }));
  }
}

export function sirenParser(): SirenParser {
  return new SirenParser();
}
