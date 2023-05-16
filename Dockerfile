FROM node:latest

ARG PATH=/usr/src/app

RUN mkdir -p ${PATH}/buildDependencies

WORKDIR ${PATH}

COPY package.json yarn.lock ${PATH}/buildDependencies/

RUN yarn global add pm2

RUN yarn install --cwd ${PATH}/buildDependencies/

COPY . ${PATH}/buildDependencies/

RUN yarn --cwd ${PATH}/buildDependencies/ run build

RUN mv ${PATH}/buildDependencies/dist/* ${PATH}/ && rm -rf ${PATH}/buildDependencies

RUN mkdir -p ${PATH}/db

VOLUME ${PATH}/db

ENTRYPOINT ["pm2-runtime", "main.js"]