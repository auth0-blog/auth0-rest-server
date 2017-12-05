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
    if (err.message && err.message.indexOf('Unexpected token') === 0 && err.message.indexOf('JSON') > 1){
      ctx.status = 400;
      ctx.body = { 'message': 'It looks like the filter parameter passed contains a wrong structure.' }
    }
  }
});
app.use(cors());

const {AUTH0_DOMAIN, AUTH0_AUDIENCE, MONGODB_URL} = process.env;
if (!AUTH0_DOMAIN || !AUTH0_AUDIENCE || !MONGODB_URL) {
  console.log('Please, set the following environment variables: AUTH0_DOMAIN, AUTH0_AUDIENCE, and MONGODB_URL');
  process.exit(1);
}

console.log(`### Enforcing '${process.env.AUTH0_DOMAIN}' as the domain issuer for tokens.`);
console.log(`### Enforcing '${process.env.AUTH0_AUDIENCE}' as the audience for tokens.`);
console.log(`### Using '${process.env.MONGODB_URL}' to connect to MongoDB.`);

app.use(jwt({
  secret: koaJwtSecret({
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
    cache: true
  }),
  audience: process.env.AUTH0_AUDIENCE,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`
}));

async function checkScopes(ctx, next) {
  const {entity, id} = ctx.params;
  const scopes = ctx.state.user.scope.split(' ');
  const scopeNeeded = ctx.method.toLowerCase() + ':' + entity;
  const hasScopes = scopes.find(element => {
    return element === scopeNeeded;
  });
  if (hasScopes) {
    ctx.state.entity = {
      name: entity,
      id: id
    };
    return await next();
  }
  return ctx.status = 401;
}

router.get('/:entity', checkScopes, endpoints.getEntities);
router.get('/:entity/:id', checkScopes, endpoints.getEntity);
router.post('/:entity', checkScopes, endpoints.addNewEntity);
router.delete('/:entity/:id', checkScopes, endpoints.deleteEntity);

app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3001);
console.log('### Listening on port 3001. Have fun!');
