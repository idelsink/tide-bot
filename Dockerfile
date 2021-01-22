FROM node:12

RUN mkdir /usr/src/app

COPY . /usr/src/app

WORKDIR /usr/src/app

ENV \
  # Service version, can be set during build time with
  # the corresponding ARG (--build-arg in Docker CLI)
  # Should not be overridden at runtime
  VERSION=${VERSION} \
  # Use production settings for libraries that use this convention
  # Should not be overridden at runtime
  NODE_ENV=production

RUN npm ci

USER node

CMD node .

LABEL \
  org.opencontainers.image.title="Tide" \
  org.opencontainers.image.description="Tide Discord bot" \
  org.opencontainers.image.url="https://github.com/idelsink/tide-discord-bot" \
  org.opencontainers.image.documentation="https://github.com/idelsink/tide-discord-bot" \
  org.opencontainers.image.vendor="idelsink"
