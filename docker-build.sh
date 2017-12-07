set -ex

USERNAME=brunokrebs
IMAGE=auth0-rest

docker build -t $USERNAME/$IMAGE .
