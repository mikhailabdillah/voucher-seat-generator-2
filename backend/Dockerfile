FROM node:22-alpine AS base

WORKDIR /app

# Install pnpm globally
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy root workspace files for dependency installation
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml .npmrc ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Install dependencies
RUN pnpm install --filter backend...

# Copy backend source code and Prisma schema
COPY backend ./backend

WORKDIR /app/backend

# Generate Prisma Client
RUN pnpm prisma generate

# Build TypeScript code
RUN pnpm build

# Expose API port
EXPOSE 4000

ENV PORT=4000
ENV NODE_ENV=production
ENV DATABASE_URL="file:../data/vouchers.db"

# Create data directory for SQLite persistence
RUN mkdir -p /app/backend/data

# Entrypoint script to push DB schema and start server via bin/www.js
CMD ["sh", "-c", "pnpm prisma db push && node dist/bin/www.js"]
