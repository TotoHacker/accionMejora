FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# La salida /dist se usará en Jenkins → Vercel
CMD ["npm", "run", "build"]
