FROM node:20
WORKDIR /usr/src/app
COPY package*.json ./
COPY tsconfig*.json ./
COPY .env ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["sh", "-c", "npm run migration:run && npm run start:prod"]