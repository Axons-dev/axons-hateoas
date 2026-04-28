import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const resolve = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  test: {
    include: ['packages/**/*.spec.ts', 'apps/**/*.spec.ts'],
    globals: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: 'coverage',
      include: ['packages/*/src/**/*.ts'],
      exclude: [
        'packages/*/src/**/*.spec.ts',
        'packages/*/src/index.ts',
        'packages/*/src/**/*.types.ts',
        'packages/hateoas-core/src/model/**/*.ts',
        'packages/hateoas-core/src/client/hypermedia-client.ts',
        'packages/hateoas-core/src/parser/hypermedia-parser.ts',
        'packages/hateoas-core/src/resource/hypermedia-*.ts',
        'packages/hateoas-core/src/transport/hypermedia-*.ts',
        'packages/*/dist/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@axonsdev/hateoas-core': resolve('./packages/hateoas-core/src/index.ts'),
      '@axonsdev/hateoas-siren': resolve('./packages/hateoas-siren/src/index.ts'),
      '@axonsdev/hateoas-fetch': resolve('./packages/hateoas-fetch/src/index.ts'),
      '@axonsdev/hateoas-nestjs': resolve('./packages/hateoas-nestjs/src/index.ts'),
      '@axonsdev/hateoas-angular': resolve('./packages/hateoas-angular/src/index.ts'),
    },
  },
});
