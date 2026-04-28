import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { DemoRole, DemoUser } from './demo-user.types';

const allowedRoles = new Set<DemoRole>(['CREATOR', 'REVIEWER', 'ADMIN']);

/**
 * Reads the demo identity from request headers.
 *
 * This is intentionally lightweight: the demo needs changing user context to
 * show different hypermedia actions, not a full authentication stack.
 */
export const CurrentDemoUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): DemoUser => {
    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
    }>();

    const rawRole = getHeader(request.headers, 'x-demo-role');
    const role: DemoRole = allowedRoles.has(rawRole as DemoRole) ? rawRole as DemoRole : 'CREATOR';

    return {
      id: getHeader(request.headers, 'x-demo-user-id') ?? 'user-1',
      role,
    };
  },
);

function getHeader(headers: Record<string, string | string[] | undefined>, name: string): string | undefined {
  const value = headers[name.toLowerCase()];

  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}
