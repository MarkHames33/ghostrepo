FROM node:22-bookworm-slim

ENV NODE_ENV=production
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable
WORKDIR /app/current

COPY edgardo-cms/current/ /app/current/
COPY edgardo-cms/content/ /app/content-seed/
COPY deploy/docker-entrypoint.sh /usr/local/bin/ghost-entrypoint

RUN pnpm install --prod --frozen-lockfile
RUN chmod +x /usr/local/bin/ghost-entrypoint

EXPOSE 10000
ENTRYPOINT ["ghost-entrypoint"]
