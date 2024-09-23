FROM node:20

RUN corepack enable
 
COPY package.json package-lock.json ./
RUN npm install
COPY . .

ENV NODE_ENV production
CMD ["npm", "start"]