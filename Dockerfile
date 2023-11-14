FROM node:16-slim
ARG COMMIT_SHA
ENV IMAGE_TAG=$COMMIT_SHA
WORKDIR /

RUN apt-get update
RUN apt-get install -y make git

COPY . .

RUN make

CMD ["make", "cmd"]