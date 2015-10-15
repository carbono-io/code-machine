FROM node
COPY . /code-machine
RUN mkdir /code

# NODE_ENV for configurations
ENV NODE_ENV HOM

EXPOSE 8000

# set the working dir to the code machine directory
WORKDIR /code-machine

CMD ["node", "index.js"]
