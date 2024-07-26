#!/bin/bash
set -e
OLD_VERSION=`cat version.txt`
NEW_VERSION=`expr $OLD_VERSION + 1`
echo $NEW_VERSION > version.txt
git add version.txt
git commit -m "bump version.txt"
#
IMAGE_NAME=example/auth:$NEW_VERSION
DOCKER_BUILDKIT=1 docker build -t $IMAGE_NAME . --platform linux/amd64
docker image save $IMAGE_NAME | ssh hostinger docker load
ssh hostinger "docker tag $IMAGE_NAME dokku/api:latest && dokku deploy api latest"