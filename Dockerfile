FROM node:latest
RUN mkdir -p /usr/src/reggeltbot
WORKDIR /usr/src/reggeltbot
COPY package.json /usr/src/reggeltbot
RUN npm install
COPY . /usr/src/reggeltbot
CMD ["node", "index.js"]