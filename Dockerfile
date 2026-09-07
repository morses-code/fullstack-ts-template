# syntax=docker/dockerfile:1
FROM node:24-bookworm-slim@sha256:ba849c60be29959425b8734d57b8b4b7d56f98edd9504c9af091d5281095a71e AS base
WORKDIR /app

FROM base AS manifests
RUN npm install --global pnpm@10.1.0
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/contracts/package.json packages/contracts/package.json

FROM manifests AS dependencies
RUN pnpm install --frozen-lockfile

FROM dependencies AS build
COPY . .
RUN pnpm build

FROM manifests AS production-dependencies
# Preserve pnpm's workspace links and exact locked versions without deploy's
# injected-workspace requirement in pnpm 10.1.
RUN pnpm --filter api... install --prod --frozen-lockfile

FROM base AS api
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3001
COPY --from=production-dependencies --chown=node:node /app/node_modules ./node_modules
COPY --from=production-dependencies --chown=node:node /app/apps/api/package.json ./apps/api/package.json
COPY --from=production-dependencies --chown=node:node /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=production-dependencies --chown=node:node /app/packages/contracts/package.json ./packages/contracts/package.json
COPY --from=production-dependencies --chown=node:node /app/packages/contracts/node_modules ./packages/contracts/node_modules
COPY --from=build --chown=node:node /app/apps/api/dist ./apps/api/dist
COPY --from=build --chown=node:node /app/packages/contracts/dist ./packages/contracts/dist
WORKDIR /app/apps/api
USER node
EXPOSE 3001
CMD ["node", "dist/server.js"]

FROM nginxinc/nginx-unprivileged:stable-alpine@sha256:442753882674b49ae2c1de83ed67896131c0777f56df5005e356e62bc3f7e7ce AS web
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
EXPOSE 8080
