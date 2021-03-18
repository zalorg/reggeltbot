FROM node:14.0.0
RUN mkdir -p /usr/src/reggeltbot
WORKDIR /usr/src/reggeltbot
RUN mkdir cache
COPY package.json /usr/src/reggeltbot
RUN npm install\
        && npm install typescript -g
COPY . /usr/src/reggeltbot
RUN tsc
ENV PORT=3000
CMD ["node", "dist/index.js"]