FROM node:18-slim

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build:shttp

EXPOSE 3000
CMD ["node", ".smithery/index.cjs"]