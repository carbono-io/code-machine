FROM node
COPY . /code-machine

EXPOSE 8000

ENTRYPOINT ["node", "/code-machine/index.js"]