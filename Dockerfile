FROM node
COPY . /code-machine

EXPOSE 8000

ENTRYPOINT ["node", "/code-machine/cli/start.js"]