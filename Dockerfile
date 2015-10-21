FROM node
COPY . /code-machine
RUN mkdir /code

EXPOSE 8000

CMD ["/bin/sh", "-c", "cd /code-machine && node ."]
