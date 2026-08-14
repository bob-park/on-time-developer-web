## base
FROM node:24-alpine AS base
ARG GITHUB_NPM_AUTH_TOKEN
ENV GITHUB_NPM_AUTH_TOKEN=$GITHUB_NPM_AUTH_TOKEN

RUN apk add --no-cache libc6-compat \
    && rm -f /usr/local/bin/yarn /usr/local/bin/yarnpkg \
    && npm install -g corepack@latest \
    && corepack enable

ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0


# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* .yarnrc.yml ./
COPY ./public ./public
RUN corepack prepare yarn@4.14.1 --activate
RUN yarn install --immutable


# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN corepack prepare yarn@4.14.1 --activate
RUN yarn build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

RUN apk add --no-cache curl

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=10s --retries=5 CMD curl --fail http://localhost:3000/api/health || exit 1

ENV PORT=3000

ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
