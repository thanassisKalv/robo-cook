FROM node:12-alpine

RUN mkdir -p /home/node/robocook-open/node_modules && chown -R node:node /home/node/robocook-open

WORKDIR /home/node/robocook-open

COPY package*.json ./

USER node

RUN npm install

RUN npm install nodemailer --save

COPY --chown=node:node . .

COPY . /home/node/robocook-open

EXPOSE 8085

CMD [ "node", "server.js" ]