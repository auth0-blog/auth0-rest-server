# Deploying RestFlex on Digituz

## Cloning the Repository

```bash
git clone https://github.com/auth0-blog/auth0-rest-server.git ~/git/auth0-rest-server
cd ~/git/auth0-rest-server
```

## Creating Docker Instances

First, we need to create a Docker network:

```bash
DIGITUZ_NETWORK=digituz

docker network create $DIGITUZ_NETWORK
```

Then, before starting a dockerized RestFlex instance, we need to bootstrap a MongoDB instance:

```bash
docker run --name secured-wildcard-mongo \
  --network $DIGITUZ_NETWORK \
  -p 27017:27017 \
  -d mongo
```

After all, we can bootstrap RestFlex:

```bash
DOMAIN=transactions
MONGODB_URL=secured-wildcard-mongo:27017/$DOMAIN
AUTH0_DOMAIN=digituz-corp.auth0.com
AUTH0_AUDIENCE=https://$DOMAIN.digituz.com.br/

docker run --name $DOMAIN-rest \
  --network digituz \
  -e "DOMAIN="$DOMAIN \
  -e "MONGODB_URL="$MONGODB_URL \
  -e "AUTH0_DOMAIN="$AUTH0_DOMAIN \
  -e "AUTH0_AUDIENCE="$AUTH0_AUDIENCE \
  -d brunokrebs/secured-wildcard
```
