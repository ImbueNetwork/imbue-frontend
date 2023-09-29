FROM node:16-slim

WORKDIR /

RUN apt-get update
RUN apt-get install -y make

COPY . .

RUN make

CMD ["make", "cmd"]
