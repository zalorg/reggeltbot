FROM node:latest
RUN mkdir -p /usr/src/reggeltbot
WORKDIR /usr/src/reggeltbot
RUN apt update
RUN apt install ffmpeg -y
RUN ffmpeg -version
COPY package.json /usr/src/reggeltbot
RUN npm install\
        && npm install typescript -g
COPY . /usr/src/reggeltbot
RUN tsc
CMD ["node", "dist/index.js"]