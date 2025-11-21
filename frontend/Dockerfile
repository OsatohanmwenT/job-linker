# ------------ Stage 1: Build the Next.js app ------------
FROM node:24-alpine AS base
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source files
COPY . .

# Build Next.js (App Router)
RUN npm run build

# ------------ Stage 2: Run Production Server ------------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
COPY package.json .

RUN addgroup appgroup && adduser -S appuser -G appgroup && chown -R appuser:appgroup /app
USER appuser

EXPOSE 3000
CMD ["pnpm", "start"]
