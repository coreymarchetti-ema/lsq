FROM hayd/alpine-deno:1.9.2
WORKDIR /usr/server/src
USER deno
COPY . /usr/server
RUN deno cache ./deps.ts
RUN deno cache ./server.ts
EXPOSE 3000
CMD ["run", "--allow-net", "--allow-read", "server.ts"]