FROM --platform=linux/x86_64 node:18

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY package*.json ./

USER node

RUN npm install --omit=dev

COPY --chown=node:node . .

ENV PORT=8080
ENV ENV=pro
ENV GOOGLE_APPLICATION_CREDENTIALS=/home/node/app/llaves/ejfexperiments-c2ef2a890ca5.json

EXPOSE 8080

CMD [ "node", "app.mjs" ]