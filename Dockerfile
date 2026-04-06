# Stage 1: Build frontend and prepare dependencies
FROM node:18-alpine AS builder

WORKDIR /app

# 1. Install root dependencies and build frontend
COPY package*.json ./
RUN npm install
COPY client/ ./client/
RUN npm run build

# 2. Install vendor API production dependencies
WORKDIR /app/vendor/api-enhanced
COPY vendor/api-enhanced/package*.json ./
RUN npm install --production

# Stage 2: Lightweight Production Image
FROM node:18-alpine

WORKDIR /app

# 1. Install root production dependencies
COPY package*.json ./
RUN npm install --production && \
    npm cache clean --force

# 2. Copy backend source code
COPY server/ ./server/

# 3. Copy built frontend assets
COPY --from=builder /app/client/dist ./client/dist

# 4. Copy vendor API with its production node_modules
COPY --from=builder /app/vendor/api-enhanced/module ./vendor/api-enhanced/module
COPY --from=builder /app/vendor/api-enhanced/util ./vendor/api-enhanced/util
COPY --from=builder /app/vendor/api-enhanced/data ./vendor/api-enhanced/data
COPY --from=builder /app/vendor/api-enhanced/node_modules ./vendor/api-enhanced/node_modules

# 5. Environment configuration
ENV NODE_ENV=production
ENV PORT=3000
# Default token for URL access, can be overridden via docker run -e ACCESS_TOKEN=xxx
ENV ACCESS_TOKEN=secret

EXPOSE 3000

CMD ["node", "server/app.js"]