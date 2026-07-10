FROM node:20-slim
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY src ./src

RUN chown -R node:node /app
USER node

EXPOSE 4000
CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]
