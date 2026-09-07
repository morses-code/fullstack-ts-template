# Fullstack TypeScript template

A pnpm workspace with React + Vite, a Fastify API, shared Zod contracts, Biome,
Vitest, and Playwright. Turborepo coordinates development, builds, and tests.

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

`pnpm dev` builds the shared contracts, then starts Vite, the API, and a contracts
watcher. Open the Vite URL printed in the terminal. The API listens on
`http://127.0.0.1:3001`; the frontend calls it through Vite's `/api` proxy.

`apps/web` contains the frontend, `apps/api` contains Fastify, and
`packages/contracts` exports shared Zod schemas and inferred TypeScript types.

The root lockfile and package-manager declaration apply to the entire workspace.
Installed dependencies and generated output are not committed.

## Docker production preview

With Docker Engine and Compose installed, run from the workspace root:

```sh
docker compose up --build
```

Open `http://localhost:8080`. Docker builds everything from source; host Node.js,
pnpm, and existing build output are not required. Nginx serves the compiled React
app and proxies `/api` to the compiled Fastify server on the private Compose
network. Both containers run as non-root users. Only the web port is published,
bound to localhost by default.

The equivalent pnpm shortcuts are:

```sh
pnpm docker:up       # Build, start in the background, and wait for health checks
pnpm docker:logs     # Follow container logs
pnpm test:e2e:docker # Test the running Docker stack (requires host test setup)
pnpm docker:down     # Stop and remove this project's containers and network
```

For another host port, use `WEB_PORT=8081 pnpm docker:up` and
`PLAYWRIGHT_BASE_URL=http://127.0.0.1:8081 pnpm test:e2e:docker`. Compose also reads
`WEB_PORT` from a root `.env` file. Docker builds exclude environment files.
The Docker test command never starts local Vite or API processes and expects the
containers to be running already.

Use `pnpm dev` for hot reload. Docker runs built artifacts without source mounts;
rerun `pnpm docker:up` after changes to rebuild and recreate the affected services.
Health checks gate startup, and services restart unless explicitly stopped.

The root Dockerfile has `api` and `web` runtime targets. Build them independently
with `docker build --target api -t template-api .` or
`docker build --target web -t template-web .`. The API image includes its compiled
contracts and production dependencies; the web image contains static assets and
Nginx. Base-image digests and pnpm are pinned: update these pins deliberately when
upgrading the template. Docker's build stages install the frozen workspace lockfile.

This setup is a local production preview and a starting point for deployment.
Configure your hosting platform's HTTPS termination and ingress separately. The
Nginx configuration expects a Compose service named `api` on port 3001 and uses
Docker DNS to recover after API container replacement. Standalone web deployments
must provide equivalent networking or adapt that upstream configuration.

CI runs the existing checks and a separate Docker job that builds the images,
waits for healthy containers, and runs the same Chromium suite against Nginx.
Docker reports are saved separately under `playwright-report/docker`, uploaded
with failure artifacts, and containers are torn down after the job.

## Code quality

```sh
pnpm lint          # Check lint rules, formatting, and import organization
pnpm lint:fix      # Apply safe lint fixes, formatting, and import organization
pnpm format        # Format supported project files
pnpm typecheck     # Check all packages and test TypeScript
pnpm build         # Build contracts, API, and frontend
pnpm check         # Run lint, typecheck, tests, and build
```

Biome uses the root `biome.json`, including in individual packages. It preserves
the frontend's two-space indentation, single JavaScript quotes, and optional
semicolons. Install the Biome extension for your editor to use the same settings.

## API

| Endpoint | Response |
| --- | --- |
| `GET /api/health` | `{ "status": "ok" }` |
| `GET /api/greeting` | `{ "message": "Hello, World!" }` |
| `GET /api/greeting?name=Ada` | `{ "message": "Hello, Ada!" }` |

Names are trimmed and must contain 1–100 characters. Invalid names return HTTP
400. The frontend validates the greeting response with the shared Zod schema and
shows a fallback message if the request fails or the response is invalid.

`src/app.ts` creates the Fastify instance and defines routes; `src/server.ts`
handles listening, logging, and graceful shutdown on SIGINT/SIGTERM. Add routes
in the app and put reusable request/response schemas in the contracts package.
There is no database or authentication configured.

The server accepts `HOST` (default `127.0.0.1`) and `PORT` (default `3001`) as
environment variables. Set `HOST=0.0.0.0` when it must be reachable outside the
machine or container. Set Vite's `API_PROXY_TARGET` to change the proxy target.
Environment variables must be supplied by the shell or deployment environment;
the API does not automatically load `.env` files.

```sh
pnpm --filter api... build  # Build the API and its contracts dependency
pnpm --filter api start    # Run the compiled server
pnpm --filter api test     # Run API tests after building contracts
```

The production frontend build requires a reverse proxy routing `/api` to Fastify;
Vite's development proxy is not part of the static build. Keep the workspace and
its installed dependencies available when running the compiled API.

## Tests

```sh
pnpm test              # Run API tests and the Chromium suite
pnpm test:e2e          # Run just the browser tests
pnpm test:e2e:ui       # Explore and debug tests in Playwright UI mode
pnpm test:e2e:report   # Open the last HTML report
```

API tests live in `apps/api/test` and exercise real routes with Fastify injection,
without opening a network port. Browser tests live in `apps/web/e2e`.
Playwright builds the API and contracts and starts the compiled API on port 3002
and Vite on port 4173, with the proxy pointed at the test API. Both servers stop
after tests. These ports are separate from normal development.

Locally, Playwright can reuse compatible servers on those ports; a reused Vite
server must have `API_PROXY_TARGET=http://127.0.0.1:3002`. CI always starts fresh
servers. Tests cover the starter page, counter, real API greeting, failed requests,
and invalid response data.

The suite runs Chromium by default. Add projects in the Playwright configuration
and install their browsers to extend coverage to Firefox or WebKit.

CI installs Chromium and its system dependencies, runs `pnpm check`, and uploads
HTML reports and failure artifacts. It uses one worker, two retries, traces on
the first retry, and screenshots on failure. Browser tests bypass Turbo caching.
Reports and artifacts are ignored by Git and Biome.
