FROM node:alpine
WORKDIR /usr/qxjourney-server
COPY . .
RUN npm install
RUN npm run build
RUN mkdir dist/pages
ADD src/pages/not_found.html dist/pages

#ARG BASE_PATH

ENV NODE_SERVER_PORT 3001
#RUN sed -i "s/\(<base href=\"\).*\(\">\)/\1\/${BASE_PATH}\/\2/" /usr/qxjourney-server/static/index.html
#RUN sed -i "s/\(<base href=\"\).*\(\">\)/\1\/${BASE_PATH}\/\2/" /usr/qxjourney-server/static/game.html
CMD ["node", "./dist/app.js", "$NODE_SERVER_PORT"]