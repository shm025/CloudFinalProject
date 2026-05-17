# ── Stage 1: Build & test ─────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first (better layer caching)
COPY package*.json ./

# Install ALL deps including devDependencies (needed for tests)
RUN npm ci

# Copy source
COPY . .

# Run tests — pipeline will fail here if tests fail
RUN npm test

# ── Stage 2: Production image ─────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production deps only
RUN npm ci --omit=dev

# Copy source and public folder
COPY src/ ./src/
COPY public/ ./public/

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "src/app.js"]
