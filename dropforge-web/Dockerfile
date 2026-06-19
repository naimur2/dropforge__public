# ── Stage 1: Builder ─────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy source
COPY . .

# Build the Vite application
RUN npm run build

# ── Stage 2: Production ───────────────────────────────────────────────────────
FROM nginx:alpine AS production

# Copy compiled output from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Overwrite default Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
