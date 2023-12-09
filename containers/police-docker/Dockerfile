FROM --platform=linux/x86_64 node:18

#RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

RUN chown -R node:node /home/node/app

#COPY package*.json ./

USER node

#RUN npm install

##COPY --chown=node:node . .

EXPOSE 22
EXPOSE 3000

#RUN dir -s

CMD [ "npx", "nodemon", "app.mjs" ]


