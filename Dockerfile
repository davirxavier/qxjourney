FROM node:alpine
WORKDIR /usr/qxjourney-server
COPY . .
RUN npm install
RUN npm run build

ENV NODE_SERVER_PORT 3001

CMD ["node", "./dist/app.js", "$NODE_SERVER_PORT"]