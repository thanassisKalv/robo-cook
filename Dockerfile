FROM node:10-alpine

RUN mkdir -p /home/node/robocook/node_modules && chown -R node:node /home/node/robocook

WORKDIR /home/node/robocook

COPY package*.json ./

USER node

RUN npm install

COPY --chown=node:node . .

EXPOSE 8080

CMD [ "node", "server.js" ]
