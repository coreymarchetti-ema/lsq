FROM node:14-alpine
WORKDIR /usr/client/src
COPY webpack.config.js ./
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8080
CMD [ "npm", "run", "dev" ]