FROM node:16-slim
ARG COMMIT_SHA
WORKDIR /
ARG IMAGE_TAG

RUN apt-get update
RUN apt-get install -y make

COPY . .
ENV NODE_ENV production
ENV IMAGE_TAG=$COMMIT_SHA
RUN make

CMD ["make", "cmd"]
