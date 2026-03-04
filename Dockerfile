# syntax = docker/dockerfile:1

FROM oven/bun:1 AS base

LABEL fly_launch_runtime="Bun"

WORKDIR /app

ENV NODE_ENV="production"


# ── Build stage ───────────────────────────────────────────────────────────────
FROM base AS build

# Install frontend deps and build static assets
COPY frontend/package.json frontend/bun.lock* ./frontend/
RUN bun install --cwd frontend

COPY frontend ./frontend
RUN bun run --cwd frontend build

# Install backend deps
COPY backend/package.json backend/bun.lock* ./backend/
RUN bun install --cwd backend

COPY backend ./backend


# ── Final stage ───────────────────────────────────────────────────────────────
FROM base

# Copy built application
COPY --from=build /app /app

# Uploads dir for temporary PDF processing
RUN mkdir -p /app/backend/uploads

EXPOSE 8080

CMD ["bun", "backend/server.ts"]
