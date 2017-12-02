const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const jwt = require('koa-jwt');
const {koaJwtSecret} = require('jwks-rsa');
const cors = require('kcors');
const endpoints = require('./endpoints');

const app = new Koa();
const router = new Router();

app.use(cors());

app.use(async function (ctx, next) {
  console.log('before');
  await next();
  console.log('after');
});

app.use(jwt({
  secret: koaJwtSecret({
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
    cache: true
  }),
  audience: process.env.AUTH0_AUDIENCE,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`
}));

function checkScopes(ctx, next) {
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
    return next();
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
