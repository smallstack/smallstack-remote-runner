FROM node:6.6.0-wheezy

MAINTAINER Maximilian Friedmann
RUN apt-get update && apt-get install -y git curl

RUN useradd -ms /bin/bash node -G sudo
RUN chown -R node:node /home/node
RUN echo %sudo ALL=NOPASSWD: ALL >> /etc/sudoers
WORKDIR /home/node
ENV HOME /home/node
USER node

# install meteor
curl https://install.meteor.com/ | sh

# Create app directory
RUN mkdir -p /home/node/app
WORKDIR /home/node/app

# Install app dependencies
COPY package.json /home/node/app/
RUN npm install

# Bundle app source
COPY . /home/node/app

EXPOSE 8080
CMD npm start
