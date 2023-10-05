FROM node:alpine
WORKDIR /usr/qxjourney-server
COPY . .
RUN npm install
RUN npm run build

ARG BASE_PATH

ENV NODE_SERVER_PORT 3001
CMD ["sed -i 's/\(<base href=\"\).*\(\">\)/\1${BASE_PATH}\2/' static/index.html"]
CMD ["node", "./dist/app.js", "$NODE_SERVER_PORT"]