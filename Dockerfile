# syntax=docker/dockerfile:1.7-labs

# --------------------------
# Base image with pnpm cache
# --------------------------
FROM node:20-alpine AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install libc6-compat for some native deps, and bash for scripts
RUN apk add --no-cache libc6-compat

WORKDIR /app

# --------------------------
# Dependencies (install only)
# --------------------------
FROM base AS deps

# Copy lockfile and package manifest only
COPY package.json pnpm-lock.yaml* ./

# Install dependencies (no scripts for safety)
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile --ignore-scripts

# --------------------------
# Builder (compile TypeScript)
# --------------------------
FROM base AS builder
WORKDIR /app

# Copy node_modules from deps and all sources
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm build

# --------------------------
# Production deps (no dev)
# --------------------------
FROM base AS prod-deps
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --prod --frozen-lockfile --ignore-scripts

# --------------------------
# Production runner image
# --------------------------
FROM node:20-alpine AS runner

# Create non-root user
RUN addgroup -S nodejs && adduser -S nodejs -G nodejs
USER nodejs

WORKDIR /app

# Set NODE_ENV to production
ENV NODE_ENV=production
# Default app port (overridden by env)
ENV PORT=3004

# Copy compiled dist and production node_modules only
COPY --from=builder /app/dist ./dist
COPY --from=prod-deps /app/node_modules ./node_modules
COPY package.json ./

# Expose the port
EXPOSE 3004

# Start command
CMD ["node", "dist/main.js"]
