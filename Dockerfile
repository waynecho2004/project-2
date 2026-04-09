FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Default port (can be overridden by docker-compose env)
ENV PORT=3020
EXPOSE 3020

CMD ["npm", "start"]
