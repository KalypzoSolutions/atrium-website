# syntax=docker/dockerfile:1

# ---------- Build: statische Website erzeugen ----------
FROM node:24-alpine AS build
WORKDIR /app

COPY package.json package-lock.json .npmrc ./
RUN npm ci --no-audit --no-fund

COPY . .

# Basis-URL für Canonical-Links, hreflang, Sitemap und robots.txt
ARG PUBLIC_SITE_URL=https://atrium.kalypzo.de
ENV PUBLIC_SITE_URL=${PUBLIC_SITE_URL}

RUN npm run build

# ---------- Runtime: nginx ohne Root-Rechte (UID 101, Port 8080) ----------
FROM nginxinc/nginx-unprivileged:stable-alpine AS runtime

LABEL org.opencontainers.image.title="Kalypzo Atrium Website" \
      org.opencontainers.image.description="Produktwebsite und Dokumentation für Kalypzo Atrium (statischer SvelteKit-Build, ausgeliefert mit nginx)" \
      org.opencontainers.image.source="https://github.com/KalypzoSolutions/atrium-website" \
      org.opencontainers.image.url="https://atrium.kalypzo.de" \
      org.opencontainers.image.vendor="Kalypzo Solutions"

ENV NGINX_ENTRYPOINT_QUIET_LOGS=1

COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY deploy/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY --from=build /app/build /usr/share/nginx/html

USER 101
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1
