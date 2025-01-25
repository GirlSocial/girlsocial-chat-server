FROM node:22 AS dev

WORKDIR /app

COPY package.json .

RUN npm install

COPY src/. src/.
COPY public/. public/.
COPY next.config.ts .
COPY tsconfig.json .
COPY postcss.config.mjs .
COPY tailwind.config.ts .

CMD ["npm", "run", "dev"]

FROM node:22 AS build

WORKDIR /app

COPY package.json .

RUN npm install && npm cache clean --force

COPY src/. src/.
COPY public/. public/.
COPY next.config.ts .
COPY tsconfig.json .
COPY postcss.config.mjs .
COPY tailwind.config.ts .
COPY LICENSE .

RUN npm build

FROM node:22

WORKDIR /app

COPY package.json .

RUN npm install --production && npm cache clean --force

COPY src/. src/.
COPY public/. public/.
COPY next.config.ts .
COPY tsconfig.json .
COPY postcss.config.mjs .
COPY tailwind.config.ts .
COPY LICENSE .
COPY --from=build /app/.next/. /app/.next/.

CMD ["npm", "run", "start"]
