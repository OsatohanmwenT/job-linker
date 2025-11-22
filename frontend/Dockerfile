# ------------ Development Stage ------------
FROM node:24-alpine AS development
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@latest

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install all dependencies (including dev dependencies)
RUN pnpm install --frozen-lockfile

# Expose port
EXPOSE 3000

# Start dev server
CMD ["pnpm", "dev"]

# ------------ Build Stage ------------
FROM node:24-alpine AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@latest

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# Copy source files
COPY . .

# Build the application
RUN pnpm build

# ------------ Production Stage ------------
FROM node:24-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

# Create user first
RUN addgroup appgroup && adduser -S appuser -G appgroup

# Install pnpm
RUN npm install -g pnpm@latest

# Change ownership of /app directory
RUN chown -R appuser:appgroup /app

# Copy package files
COPY --chown=appuser:appgroup package.json pnpm-lock.yaml* ./

# Switch to appuser before installing dependencies
USER appuser

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built files from builder stage
COPY --from=builder --chown=appuser:appgroup /app/.next ./.next
COPY --from=builder --chown=appuser:appgroup /app/public ./public
COPY --from=builder --chown=appuser:appgroup /app/next.config.ts ./next.config.ts

EXPOSE 3000 
CMD ["pnpm", "start"]