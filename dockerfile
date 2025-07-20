FROM node:22-slim AS builder
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile && yarn cache clean

COPY . .
RUN ./scripts/build.sh

# =========================
FROM node:22-alpine AS runner
WORKDIR /app

COPY package.json yarn.lock drizzle.config.ts ./
COPY drizzle ./drizzle

COPY --from=builder /app/dist ./dist
COPY --link --chmod=755 scripts/docker-entrypoint.sh /usr/local/bin/

RUN yarn install --frozen-lockfile --production && yarn cache clean
RUN chmod -R 777 ./dist/static

VOLUME ["/downloads"]
VOLUME ["/database"]

ENV NODE_ENV=production
ENV PORT=3000
ENV BASE_PATH=""
ENV DOWNLOAD_DIR=/downloads
ENV DATABASE_PATH=/database/nime-fetch.db
ENV SCHEMA_PATH=/app/dist/db/schemas/*

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}${BASE_PATH}/healthcheck || exit 1

EXPOSE $PORT

ENTRYPOINT ["docker-entrypoint.sh"]
