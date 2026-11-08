FROM node:22-slim

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
ENV NODE_OPTIONS=--max-old-space-size=2048
RUN pnpm run build

EXPOSE 8080

CMD ["node", "build/server/index.js"]
