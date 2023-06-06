FROM node:lts

WORKDIR /usr/src/app

RUN yarn global add typescript
RUN yarn global add expo

COPY package.json .

COPY yarn.lock .

RUN yarn install

COPY . .

EXPOSE 19000
EXPOSE 19001
EXPOSE 19002
EXPOSE 19006

CMD ["yarn", "start"]
