#!/bin/bash

npm run build
touch ./build.txt
docker build . -t registry.local.tld:5000/frontend:develop
docker push registry.local.tld:5000/frontend:develop