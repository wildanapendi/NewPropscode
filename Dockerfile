# ============================================
# Stage 1: Build frontend (React + Vite)
# ============================================
FROM node:24-alpine AS frontend-build

WORKDIR /app

# ponytail: copy package files first → layer cache on npm ci
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

COPY index.html vite.config.js eslint.config.js ./
COPY src/ src/
COPY public/ public/

RUN npm run build

# ============================================
# Stage 2: Install server production deps
# ============================================
FROM node:24-alpine AS server-deps

WORKDIR /app/server

COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts

# ============================================
# Stage 3: Production image
# ============================================
FROM node:24-alpine

RUN apk add --no-cache nginx supervisor

WORKDIR /app

# Copy built frontend → nginx
COPY --from=frontend-build /app/dist /usr/share/nginx/html

# Copy server code + production deps
COPY server/ /app/server/
COPY --from=server-deps /app/server/node_modules /app/server/node_modules

# Copy .env.example as fallback (actual .env injected by Coolify env vars)
COPY .env.example /app/.env.example

# Nginx config
COPY nginx.conf /etc/nginx/http.d/default.conf

# Supervisord config
COPY supervisord.conf /etc/supervisord.conf

# Upload volume
VOLUME ["/app/server/uploads"]

# Expose single port — Coolify maps this
EXPOSE 80

# ponytail: healthcheck via backend /api/health
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/health || exit 1

CMD ["supervisord", "-c", "/etc/supervisord.conf"]
