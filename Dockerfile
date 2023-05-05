FROM node:latest

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json  ./
COPY yarn.lock ./

RUN yarn install

COPY . .

CMD ["yarn", "start"]