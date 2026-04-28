import type { Provider } from '@angular/core';
import { HATEOAS_CLIENT } from '@axonsdev/hateoas-angular';
import { createHateoasClient } from '@axonsdev/hateoas-core';
import { fetchTransport } from '@axonsdev/hateoas-fetch';
import { sirenParser } from '@axonsdev/hateoas-siren';
import { DemoRoleService } from './shared/demo-role.service';

export const appConfigProviders: Provider[] = [
  DemoRoleService,
  {
    provide: HATEOAS_CLIENT,
    deps: [DemoRoleService],
    useFactory: (roles: DemoRoleService) =>
      createHateoasClient({
        transport: fetchTransport({
          baseUrl: 'http://localhost:3000',
          headers: () => ({
            'x-demo-user-id': roles.userId(),
            'x-demo-role': roles.role(),
          }),
        }),
        parsers: [sirenParser()],
      }),
  },
];
