FROM node:0.10.39
RUN mkdir code-machine
ADD . /code-machine
ENTRYPOINT ['node', '/code-machine']
