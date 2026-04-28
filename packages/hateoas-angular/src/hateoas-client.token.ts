import { InjectionToken } from '@angular/core';
import type { HypermediaClient } from '@axonsdev/hateoas-core';

export const HATEOAS_CLIENT = new InjectionToken<HypermediaClient>('HATEOAS_CLIENT');
