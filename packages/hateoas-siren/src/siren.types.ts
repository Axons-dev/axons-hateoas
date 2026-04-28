import type { HttpMethod } from '@axonsdev/hateoas-core';

export interface SirenLink {
  rel: string[];
  href: string;
  title?: string;
  type?: string;
}

export interface SirenField {
  name: string;
  type?: string;
  value?: unknown;
  title?: string;
  required?: boolean;
  options?: Array<{
    value: unknown;
    title?: string;
  }>;
}

export interface SirenAction {
  name: string;
  title?: string;
  method?: HttpMethod;
  href: string;
  type?: string;
  fields?: SirenField[];
}

export interface SirenEmbeddedEntity<TProperties = Record<string, unknown>> {
  rel: string[];
  class?: string[];
  properties?: TProperties;
  links?: SirenLink[];
  actions?: SirenAction[];
  entities?: SirenEmbeddedEntity[];
}

export interface SirenEntity<TProperties = Record<string, unknown>> {
  class?: string[];
  properties?: TProperties;
  links?: SirenLink[];
  actions?: SirenAction[];
  entities?: SirenEmbeddedEntity[];
}
