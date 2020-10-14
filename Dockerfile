FROM node:12

RUN mkdir /usr/src/app

COPY . /usr/src/app

WORKDIR /usr/src/app

RUN npm ci

USER node

CMD node .

LABEL \
  org.opencontainers.image.title="Tide" \
  org.opencontainers.image.description="Tide Discord bot" \
  org.opencontainers.image.url="https://github.com/idelsink/tide-discord-bot" \
  org.opencontainers.image.documentation="https://github.com/idelsink/tide-discord-bot" \
  org.opencontainers.image.vendor="idelsink"
