# Security Policy

## Supported Versions

Security fixes are provided for the latest published minor version of each `@axonsdev/hateoas-*` package.

Pre-1.0 releases may include breaking changes, but security reports are still welcome and will be handled seriously.

## Reporting a Vulnerability

Please do not report security vulnerabilities through public GitHub issues.

Send security reports to:

```txt
nprin@axons.fr
```

Include as much detail as possible:

- affected package and version;
- affected API, transport, parser, or demo endpoint;
- reproduction steps;
- impact assessment;
- suggested fix, if known.

## Response Process

After receiving a report, maintainers will:

1. acknowledge the report when possible;
2. assess impact and reproducibility;
3. prepare a fix or mitigation;
4. publish patched packages when needed;
5. disclose details once users have a reasonable path to update.

## Scope

In scope:

- parser behavior that could lead to unsafe client behavior;
- request/action execution bugs in published packages;
- package supply-chain or publishing issues;
- demo API issues that affect documented usage.

Out of scope:

- denial-of-service reports against local demo servers;
- findings that require modifying a user's local machine or dependencies outside this repository;
- reports without a practical security impact.
