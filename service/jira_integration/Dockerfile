FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev

COPY jira-integration.js ./

EXPOSE 8082

CMD ["npm", "start"]