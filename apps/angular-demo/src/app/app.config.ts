import type { Provider } from '@angular/core';
import { HATEOAS_CLIENT } from '@axons/hateoas-angular';
import { createHateoasClient } from '@axons/hateoas-core';
import { fetchTransport } from '@axons/hateoas-fetch';
import { sirenParser } from '@axons/hateoas-siren';
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
