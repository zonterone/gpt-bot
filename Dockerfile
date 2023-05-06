FROM node:latest

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json  ./
COPY yarn.lock ./

RUN yarn install

COPY . .

RUN yarn build

CMD ["node", "dist/bot.js"]