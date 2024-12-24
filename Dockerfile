FROM --platform=$BUILDPLATFORM node:alpine3.21 AS build

ARG PUBLIC_SUPABASE_ANON_KEY=supabase-anon-key

WORKDIR /app
COPY package.json package-lock.json ./

RUN npm ci

COPY . .
RUN npm run build

ENV PORT=3001 \
	ORIGIN=http://localhost:3001 \
	NODE_ENV=production

EXPOSE 3001

CMD ["node", "build"]