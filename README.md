## Auth0 REST Server

This is a flexible [Koa](koajs.com) REST API secured by Auth0. By flexible, I mean that you don't have to do anything to
get a server capable of creating, updating, retrieving, and removing JSON objects. To be even more clear, let's say that
you are going to start developing a new SPA with Angular that is going to enable users to manage (CRUD) contracts. Of
this SPA app will need a backend to persist this data. And of course we need this data to be secure.

In this situation, what we could do is tailor a backend to fulfill our needs, or we could use this project to hold data
for us temporarily. How does this works? Simple, you develop the Angular app and integrate it with an Auth0 Client to
retrieve an `access_token` loaded with some scopes (e.g. `get:contracts delete:contracts`). After that you can issue
HTTP requests to this backend.

At this point, you might be wondering: how exactly Auth0 secures this data? That's also simple. It' based on conventions.
In the example above, if we get an `access_token` loaded with both `get:contracts` and `delete:contracts` scopes, the
backend will only accept `GET` and `DELETE` requests targeting the `/contracts` endpoint.

Another important characteristic of this REST server is that data is persisted on separated collections per user and entity.
What I mean is that if a user with id `1234` submits a JSON object to `contracts`, this objects will be persisted on a
collection called `1234/contracts`. Note that this also means that users issuing `GET` requests to `contracts` will
receive only their data. You get the idea.

### Summarizing

To summarize: a user with id `xyz123` and scopes `get:books`, `post:books`, and `delete:books` will be able to:

- `GET` all documents in the `xyz123/books` collection through the `http://localhost:3001/books` endpoint.
- `GET` one document, with id `987`, from the `xyz123/books` collection through the `http://localhost:3001/books/987` endpoint.
- `POST` a new document through `http://localhost:3001/books/`.
- `DELETE` the document with id `987` through `http://localhost:3001/books/987`.

### Running with Node.js

No matter how and where we run this application, we have to set three environment variables. They are:

- `AUTH0_DOMAIN`: [The domain of our Auth0 account](https://manage.auth0.com/).
- `AUTH0_AUDIENCE`: [The audience/identifier that represents this API on Auth0](https://manage.auth0.com/#/apis)
- `MONGODB_URL`: a MongoDB URL to persist our data. We can host our on on the cloud, use some Mongo as a Service like [mLab](https://mlab.com/),
or host locally (the easiest way is with Docker).

Let's take a look into how we can bootstrap RestFlex from a terminal:

```bash
export AUTH0_DOMAIN=digituz-corp.auth0.com
export AUTH0_AUDIENCE=https://digituz-corp.auth0.com/contacts
export MONGODB_URL=http://localhost:27017/contacts
```

### Running with Docker

To run this project on Docker, [we can use the public image available on Docker Hub](https://hub.docker.com/r/brunokrebs/secured-wildcard/).
We can also use the `Dockerfile` available in this repository.

Below, you can find a few Docker-related commands. The first one downloads the image from Docker Hub and runs it with the
properties passed through parameters.

```bash
docker run --name secured-wildcard-mongo \
  --network digituz \
  -p 27017:27017 \
  -d mongo

docker run --name secured-wildcard \
  --network digituz \
  -e "MONGODB_URL=secured-wildcard-mongo:27017/contacts" \
  -e "AUTH0_DOMAIN=bk-samples.auth0.com" \
  -e "AUTH0_AUDIENCE=https://contacts.digituz.com.br" \
  -d brunokrebs/secured-wildcard
```

If it is already running there, we will need to stop, remove, and remove the image so we can fetch an up-to-date image:

```
docker stop secured-wildcard
docker rm secured-wildcard
docker rmi brunokrebs/secured-wildcard
```

### Updating Docker Hub Image

There is a script that builds the image, generates the tag, and push it to Docker Hub:

```bash
./docker-push
```
