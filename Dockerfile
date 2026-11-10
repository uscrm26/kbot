FROM node:22-slim

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts

COPY . .
ENV NODE_OPTIONS=--max-old-space-size=4096
ENV DATA_DIR=/app/data
RUN mkdir -p /app/data
RUN pnpm run build

EXPOSE 8080

CMD ["node", "server/index.js"]
