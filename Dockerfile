FROM node:alpine
WORKDIR /usr/qxjourney-server
COPY . .
RUN npm install
RUN npm run build

ARG BASE_PATH
ARG SOCKET_URL

ENV NODE_SERVER_PORT 3001
CMD ["sed -i 's/\(<base href=\"\).*\(\">\)/\1${BASE_PATH}\2/' static/index.html"]
CMD ["sed -i 's/\(<base href=\"\).*\(\">\)/\1${BASE_PATH}\2/' static/game.html"]
CMD ["sed -i \"s/\(ColyseusUtils.init(\)[^,]*\([^)]\+)\)/\1'${SOCKET_URL}'\2/\" static/game.html"]
CMD ["node", "./dist/app.js", "$NODE_SERVER_PORT"]