# 1. Base image with Alpine for smallest footprint and fastest pulls
FROM node:22-alpine AS base
RUN apk add --no-network --no-cache libc6-compat openssl
WORKDIR /app

# 2. Dependencies - Only runs when package.json or prisma schema changes
FROM base AS deps
COPY package.json package-lock.json* ./
COPY prisma ./prisma/
# Mount cache for faster npm installs in future builds
RUN --mount=type=cache,target=/root/.npm \
    npm ci
# Generate Prisma client here so it's cached with node_modules
RUN npx prisma generate

# 3. Builder - Rebuilds only when source code changes
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# 4. Runner - The final production image (Ultra-slim)
FROM base AS runner
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set permissions for the standalone server
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

# Use the standalone server entry point for maximum performance
CMD ["node", "server.js"]