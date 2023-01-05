#!/bin/bash

docker build . -t registry.xxx.com/frontend:develop
docker push registry.xxx.com/frontend:develop