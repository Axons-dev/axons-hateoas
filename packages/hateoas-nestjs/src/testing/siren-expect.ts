import type { SirenEntity } from '@axons/hateoas-siren';

export function hasSirenAction(entity: SirenEntity, actionName: string): boolean {
  return Boolean(entity.actions?.some((action) => action.name === actionName));
}

export function hasSirenLink(entity: SirenEntity, rel: string): boolean {
  return Boolean(entity.links?.some((link) => link.rel.includes(rel)));
}

export function getSirenAction(entity: SirenEntity, actionName: string) {
  return entity.actions?.find((action) => action.name === actionName) ?? null;
}
