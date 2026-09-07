# Web

React and TypeScript frontend powered by Vite. Biome provides linting, formatting,
and import organization through the shared root configuration. Playwright tests
the starter page and counter in Chromium.

See the [workspace README](../../README.md) for setup, checks, and browser testing.

From the workspace root:

```sh
pnpm --filter web dev
pnpm --filter web lint
pnpm --filter web typecheck
pnpm --filter web build
pnpm test:e2e
```

Add browser tests under `e2e/`. Playwright starts Vite automatically on port 4173.
The Vite `/api` proxy targets port 3001; the API package is still a placeholder.
