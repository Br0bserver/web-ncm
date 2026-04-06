# Stage 1: Build frontend and prepare dependencies
FROM node:22-alpine AS builder

WORKDIR /app

# 1. Install root dependencies and build frontend
COPY package*.json ./
RUN npm install
COPY client/ ./client/
RUN npm run build

# 2. Prepare vendor API
COPY vendor/ ./vendor/
WORKDIR /app/vendor/api-enhanced
RUN npm install --omit=dev --ignore-scripts

# Stage 2: Lightweight Production Image
FROM node:22-alpine

WORKDIR /app

# 1. Install root production dependencies
COPY package*.json ./
RUN npm install --omit=dev --ignore-scripts && \
    npm cache clean --force

# 2. Copy backend source code
COPY server/ ./server/

# 3. Copy built frontend assets
COPY --from=builder /app/client/dist ./client/dist

# 4. Copy vendor API
COPY --from=builder /app/vendor/api-enhanced/module ./vendor/api-enhanced/module
COPY --from=builder /app/vendor/api-enhanced/util ./vendor/api-enhanced/util
COPY --from=builder /app/vendor/api-enhanced/data ./vendor/api-enhanced/data
COPY --from=builder /app/vendor/api-enhanced/node_modules ./vendor/api-enhanced/node_modules
COPY --from=builder /app/vendor/api-enhanced/app.js ./vendor/api-enhanced/app.js
COPY --from=builder /app/vendor/api-enhanced/package.json ./vendor/api-enhanced/package.json

# 5. Environment configuration
ENV NODE_ENV=production
ENV PORT=3000
ENV ACCESS_TOKEN=secret

EXPOSE 3000

CMD ["sh", "-c", "touch /tmp/anonymous_token && node server/app.js"]
