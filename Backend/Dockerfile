# Stage 1: Dependency Installation Stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Production Lightweight Runtime Image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Copy production dependencies and application source
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
COPY src ./src

# Use non-root node user for security hardening
USER node

EXPOSE 5000

CMD ["node", "src/server.js"]
