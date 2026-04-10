FROM node:22-slim

# Install build deps for node-pty (native)
RUN apt-get update && apt-get install -y python3 make g++ libkrb5-dev && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY src/ ./src/
COPY entrypoint.sh ./
COPY package.json ./
RUN npm ci --only=production

# Create data dir for certs & token
VOLUME ["/data"]
ENV NODE_ENV=production
ENV PORT=5273
EXPOSE 5273

ENTRYPOINT ["/app/entrypoint.sh"]
