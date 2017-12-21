const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const jwt = require('koa-jwt');
const {koaJwtSecret} = require('jwks-rsa');
const cors = require('kcors');
const endpoints = require('./endpoints');

const app = new Koa();
const router = new Router();

app.use(async function exceptionHandler(ctx, next) {
  try {
    await next();
  } catch (err) {
    ctx.status = 400;
    if (err.message && err.message.indexOf('Unexpected token') === 0 && err.message.indexOf('JSON') > 1){
      ctx.body = { 'message': 'It looks like the filter parameter passed contains a wrong structure.' }
    } else {
      console.error('### Oooops!');
      console.error(`### An error occurred on ${(new Date()).toString()}`);
      console.error(err);
    }
  }
});
app.use(cors());

const {DOMAIN, AUTH0_DOMAIN, AUTH0_AUDIENCE, MONGODB_URL} = process.env;
if (!DOMAIN || !AUTH0_DOMAIN || !AUTH0_AUDIENCE || !MONGODB_URL) {
  console.log('Please, set the following environment variables: DOMAIN, AUTH0_DOMAIN, AUTH0_AUDIENCE, and MONGODB_URL');
  process.exit(1);
}

console.log(`### The topic of this microservice is '${DOMAIN}'.`);
console.log(`### We will enforce '${AUTH0_DOMAIN}' as the domain issuer for tokens.`);
console.log(`### We will expect that the token is issued for the '${AUTH0_AUDIENCE}' audience.`);
console.log(`### Our data will be persisted to the '${MONGODB_URL}' MongoDB database.`);

app.use(jwt({
  secret: koaJwtSecret({
    jwksUri: `https://${AUTH0_DOMAIN}/.well-known/jwks.json`,
    cache: true
  }),
  audience: AUTH0_AUDIENCE,
  issuer: `https://${AUTH0_DOMAIN}/`,
  debug: true
}));

async function checkScopes(ctx, next) {
  const {id} = ctx.params;
  const scopes = ctx.state.user.scope.split(' ');
  const scopeNeeded = ctx.method.toLowerCase() + ':' + DOMAIN;
  const hasScopes = scopes.find(element => {
    return element === scopeNeeded;
  });
  if (hasScopes) {
    ctx.state.entity = {
      name: DOMAIN,
      id: id
    };
    return await next();
  }
  return ctx.status = 401;
}

router.get('/', checkScopes, endpoints.getEntities);
router.get('/:id', checkScopes, endpoints.getEntity);
router.post('/', checkScopes, endpoints.addNewEntity);
router.put('/:id', checkScopes, endpoints.updateEntity);
router.delete('/:id', checkScopes, endpoints.deleteEntity);

app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3001);
console.log('### Listening on port 3001. Have fun!');
