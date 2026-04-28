# Contributing

Thank you for considering a contribution to Axons HATEOAS.

This project is an open source TypeScript workspace published as separate npm packages under the `@axons` scope. Contributions should keep the packages small, composable, and framework-specific only where that package boundary requires it.

## Code of Conduct

By participating in this project, you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Before You Start

For larger changes, open an issue first and describe:

- the problem you want to solve;
- the package or demo area affected;
- the proposed API or behavior change;
- any compatibility risk for existing users.

Small documentation fixes, test improvements, and narrow bug fixes can be proposed directly as a pull request.

## Development Setup

Install dependencies:

```bash
pnpm install
```

Build all packages:

```bash
pnpm build:packages
```

Run tests:

```bash
pnpm test
```

Run coverage:

```bash
pnpm test:coverage
```

Validate package contents:

```bash
pnpm pack:packages
```

## Workspace Layout

Application demos live in `apps/`.

Reusable libraries live in `packages/`:

- `@axons/hateoas-core`: framework-agnostic client primitives;
- `@axons/hateoas-siren`: Siren parsing;
- `@axons/hateoas-fetch`: Fetch transport;
- `@axons/hateoas-angular`: Angular integration;
- `@axons/hateoas-nestjs`: NestJS response composition;
- `@axons/hateoas-nestjs-typeorm`: optional TypeORM helpers.

Keep cross-package dependencies directed from integrations toward core packages. Do not add framework-specific imports to `@axons/hateoas-core`.

## Contribution Rules

- Keep public APIs explicit and documented with English JSDoc.
- Add or update tests for behavior changes.
- Keep demos in English.
- Avoid unrelated refactors in feature or bug-fix pull requests.
- Do not commit generated artifacts such as `dist/`, `coverage/`, `.angular/`, `.tgz`, or `*.tsbuildinfo`.
- Keep package boundaries clean. A package should not depend on a demo app.
- Prefer small, reviewable pull requests over large mixed changes.

## Commit Messages

Use clear, imperative commit messages. Conventional Commit style is preferred:

```txt
feat(core): add action payload validation
fix(angular): avoid duplicate detail fetches
docs(nestjs): document resource composition
test(siren): cover embedded entities
```

## Pull Request Checklist

Before opening a pull request, make sure:

- `pnpm build:packages` passes;
- `pnpm test` passes;
- package documentation is updated when public behavior changes;
- new public APIs include JSDoc;
- package contents remain publishable with `pnpm pack:packages`.

## Releases

Packages are published individually to npm from GitHub Actions.

Release tags must use the package version format:

```bash
v0.1.0
```

The release workflow only publishes when the tagged commit is contained in `main`, and the tag version must match every package version in `packages/*`.

## License

By contributing, you agree that your contribution is licensed under the [Mozilla Public License 2.0](LICENSE).
