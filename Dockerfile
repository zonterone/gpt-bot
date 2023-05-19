FROM node:latest

RUN mkdir -p /usr/src/app/buildDependencies

WORKDIR /usr/src/app/

COPY package.json yarn.lock ./buildDependencies/

RUN yarn install --cwd ./buildDependencies/

COPY . ./buildDependencies/

RUN yarn --cwd ./buildDependencies/ run build

RUN mv ./buildDependencies/dist/* ./ && rm -rf ./buildDependencies

RUN mkdir -p ./db

ENTRYPOINT ["node", "main.js"]