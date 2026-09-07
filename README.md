# Fullstack TypeScript template

A pnpm workspace with a React + Vite frontend, shared Biome configuration, and
Playwright browser tests. Turborepo coordinates development, builds, and tests.

## Setup

Use Node.js 24 (also configured in `mise.toml`) and pnpm 10.1.0, as pinned in the
root `package.json`. Run installation commands from the workspace root:

```sh
pnpm install --frozen-lockfile
pnpm --filter web exec playwright install chromium
pnpm dev
```

On Linux, install browser system dependencies with
`pnpm --filter web exec playwright install --with-deps chromium`.

`apps/web` contains the working frontend. `apps/api` and `packages/contracts` are
empty placeholders with dependencies selected for Fastify, Vitest, and Zod.
Add source code, TypeScript configuration, and appropriate scripts when building
those packages; they do not currently start a server or run checks/tests.

The root lockfile and package-manager declaration apply to the entire workspace.
Installed dependencies and generated output are not committed.

## Code quality

```sh
pnpm lint          # Check lint rules, formatting, and import organization
pnpm lint:fix      # Apply safe lint fixes, formatting, and import organization
pnpm format        # Format supported project files
pnpm typecheck     # Check frontend, Vite config, and browser test TypeScript
pnpm build         # Build the frontend for production
pnpm check         # Run lint, typecheck, tests, and build
```

Biome uses the root `biome.json`, including in individual packages. It preserves
the frontend's two-space indentation, single JavaScript quotes, and optional
semicolons. Install the Biome extension for your editor to use the same settings.

## Browser tests

```sh
pnpm test              # Run workspace tests, currently the Chromium suite
pnpm test:e2e          # Run just the browser tests
pnpm test:e2e:ui       # Explore and debug tests in Playwright UI mode
pnpm test:e2e:report   # Open the last HTML report
```

Tests live in `apps/web/e2e`. Playwright starts and stops Vite automatically at
`http://127.0.0.1:4173`. Locally, it can reuse a Vite server already running at that
address; CI always starts a fresh server. The tests cover the starter heading and
counter interaction. Add API integration tests after implementing the API.

The suite runs Chromium by default. Add projects in the Playwright configuration
and install their browsers to extend coverage to Firefox or WebKit.

CI installs Chromium and its system dependencies, runs `pnpm check`, and uploads
HTML reports and failure artifacts. It uses one worker, two retries, traces on
the first retry, and screenshots on failure. Browser tests bypass Turbo caching.
Reports and artifacts are ignored by Git and Biome.
