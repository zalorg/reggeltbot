FROM node:latest
RUN mkdir -p /usr/src/reggeltbot
WORKDIR /usr/src/reggeltbot
RUN mkdir cache
COPY package.json /usr/src/reggeltbot
RUN npm install\
        && npm install typescript -g
COPY . /usr/src/reggeltbot
RUN tsc
CMD ["node", "dist/manager.js"]