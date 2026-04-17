FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable
ENV HUSKY=0

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm prisma generate
RUN pnpm build
RUN pnpm prune --prod --ignore-scripts

FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY package.json pnpm-lock.yaml prisma.config.ts ./

EXPOSE 4000

CMD ["node", "dist/src/main"]
