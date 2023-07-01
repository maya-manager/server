FROM node:lts

WORKDIR /usr/src/app

COPY package.json .

COPY yarn.lock .

COPY . .

RUN yarn install
RUN yarn prisma:generate
RUN yarn prisma:migrate

CMD [ "yarn", "start:dev" ]