FROM node:16.20.2-bullseye
RUN apt-get -y update && apt-get -y install git

COPY package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /usr/qxjourney-server && cp -a /tmp/node_modules /usr/qxjourney-server

WORKDIR /usr/qxjourney-server
COPY . /usr/qxjourney-server
RUN npm install
RUN npm run build
RUN mkdir dist/pages
ADD src/pages/not_found.html dist/pages

ARG BASE_PATH

ENV NODE_SERVER_PORT 3001
RUN sed -i "s/\(<base href=\"\).*\(\">\)/\1\/${BASE_PATH}\/game\/\2/" /usr/qxjourney-server/static/index.html
RUN sed -i "s/\(<base href=\"\).*\(\">\)/\1\/${BASE_PATH}\/game\/\2/" /usr/qxjourney-server/static/game.html

EXPOSE ${NODE_SERVER_PORT}
CMD ["node", "./dist/app.js", "$NODE_SERVER_PORT"]