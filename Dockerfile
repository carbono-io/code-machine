FROM node
COPY . /code-machine
RUN mkdir /code

EXPOSE 8000

ENTRYPOINT ["node", "/code-machine/cli/start.js"]