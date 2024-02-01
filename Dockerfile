FROM node:20
WORKDIR /app
COPY package.json .
RUN npm i

ARG NODE_ENV
RUN if [ "$NODE_ENV" = "development" ]; \
        then npm i; \
        else npm i --only=production; \
        fi

COPY . ./
EXPOSE 3000
CMD ["node", "index.js"]