FROM node:lts

WORKDIR /usr/src/app

RUN yarn global add typescript
RUN yarn global add prisma

COPY package.json .

COPY yarn.lock .

RUN yarn install
RUN prisma migrate dev --name init --preview-feature --create-only
RUN prisma generate

COPY . .


CMD [ "yarn", "start:dev" ]