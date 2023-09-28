# Production image, copy all the files and run next
FROM node:18-slim AS base
ARG IMAGE_TAG
ARG COMMIT_SHA
ARG NEXT_PUBLIC_BASE_URL
RUN apt-get update
RUN apt-get install -y make
WORKDIR /app
COPY . .
RUN yarn
RUN yarn autoclean --force
# COPY --from=builder --chown=nxtjs:nodejs /app /app
ENV NODE_ENV production
ENV IMAGE_TAG=$COMMIT_SHA
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL

EXPOSE 3000

ENV PORT 3000
# set hostname to localhost
ENV HOSTNAME "0.0.0.0"

CMD ["make", "cmd"]