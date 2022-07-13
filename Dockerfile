FROM node:18-slim as build

WORKDIR /app
COPY package*.json ./

RUN npm install 

COPY . .

RUN npm run build


FROM node:18-slim
WORKDIR /app
COPY package*.json .

ENV NODE_ENV production

RUN npm ci --only=production

COPY --from=build /app/dist ./dist

CMD npm run start:prod
