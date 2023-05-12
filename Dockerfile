FROM node:latest

RUN mkdir -p /usr/src/app/buildDependencies
WORKDIR /usr/src/app

COPY . ./buildDependencies

RUN yarn install --cwd ./buildDependencies/

RUN yarn --cwd ./buildDependencies/ run build

RUN mv ./buildDependencies/dist/* ./ && rm -rf ./buildDependencies

CMD ["node", "main.js"]