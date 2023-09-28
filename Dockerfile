FROM node:16-slim AS builder

WORKDIR /app
ARG IMAGE_TAG
ARG COMMIT_SHA
ARG NEXT_PUBLIC_BASE_URL

RUN apt-get update
RUN apt-get install -y make

COPY . .
RUN yarn install
RUN yarn build

# Production image, copy all the files and run next
FROM node:18-alpine AS base
ARG IMAGE_TAG
ARG COMMIT_SHA
ARG NEXT_PUBLIC_BASE_URL
RUN apt-get install -y make

WORKDIR /app

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

RUN npm install knex -g
ENV NODE_ENV production
ENV IMAGE_TAG=$COMMIT_SHA
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL
USER nextjs

EXPOSE 3000

ENV PORT 3000
# set hostname to localhost
ENV HOSTNAME "0.0.0.0"

CMD ["make", "cmd"]
