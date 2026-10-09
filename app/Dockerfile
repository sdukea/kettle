# Pillow: one container, one SQLite file on a mounted disk at /data.
FROM node:24-slim
WORKDIR /app
COPY package.json package-lock.json ./
COPY scripts ./scripts
RUN mkdir -p web/public && npm ci
COPY . .
RUN npx vite build
ENV NODE_ENV=production PORT=8080 DB_PATH=/data/pillow.db
EXPOSE 8080
CMD ["npx", "tsx", "server/index.ts"]
