FROM node:20-alpine

WORKDIR /app

COPY server/package*.json server/
RUN cd server && npm install

COPY server/ server/
COPY client/dist/ client/dist/

EXPOSE 5000

CMD ["node", "server/index.js"]
