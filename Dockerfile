FROM node:latest

# Create the directory!
RUN mkdir -p /usr/src/reggeltbot
WORKDIR /usr/src/reggeltbot

# Copy and Install our bot
COPY package.json /usr/src/reggeltbot
RUN npm install

# Our precious bot
COPY . /usr/src/reggeltbot

# Start me!
CMD ["node", "index.js"]