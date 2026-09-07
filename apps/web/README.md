# Web

React and TypeScript frontend powered by Vite. Biome provides linting, formatting,
and import organization through the shared root configuration. Playwright tests
the starter page, counter, and API integration in Chromium.

See the [workspace README](../../README.md) for setup, checks, and browser testing.

From the workspace root:

```sh
pnpm dev
pnpm --filter web lint
pnpm --filter web typecheck
pnpm --filter web build
pnpm test:e2e
pnpm test:e2e:docker # Test an already-running Docker stack
```

Add browser tests under `e2e/`. Playwright starts Vite on port 4173 and a compiled
API on port 3002 automatically. Normal development uses the API on port 3001.
Build contracts first with `pnpm --filter contracts build` when running frontend
typechecking or builds directly rather than through the root Turbo commands.
