FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json /app/
RUN npm ci

COPY frontend /app/frontend
COPY vite.config.ts /app/vite.config.ts
COPY tsconfig.json tsconfig.app.json tsconfig.node.json /app/
COPY tailwind.config.ts postcss.config.js eslint.config.js components.json /app/

EXPOSE 8080

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "8080"]

