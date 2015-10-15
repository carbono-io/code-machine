# Code Machine (CM)

Description

===========

This module provides a Docker container image with the microservice responsible 

for process the source code being edited by the user.

Dependency installation

=======================

```npm install```

Image creation and running

==========================

To build the image

------------------

```docker build -t <image_name> .```

This step is only necessary in case of the image is not available on the registry

server or the goal be to update and upload it.

To run the service from a new container

---------------------------------------

Once the image is on the registry server (and it is accessible), execute:

```docker run -dP -v /path/to/front-end-project:/code <registry_server>/<image_name>```

Running and testing

===================

```gulp serve``` or ```node .```

```mocha test --timeout 5000``` (in another terminal)


