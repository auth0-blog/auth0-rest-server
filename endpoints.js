const mongo = require('./mongo');

module.exports = {
  getEntities, getEntity, addNewEntity, deleteEntity
};

async function getEntities(ctx) {
  ctx.body = await mongo.find(ctx.state.user.sub, ctx.state.entity) || [];
  ok(ctx);
}

async function getEntity(ctx) {
  ctx.body = await mongo.findOne(ctx.state.user.sub, ctx.state.entity);
  ctx.body ? ok(ctx) : notFound(ctx);
}

async function addNewEntity(ctx) {
  await mongo.insert(ctx.state.user.sub, ctx.state.entity, ctx.request.body);
  ok(ctx);
}

async function deleteEntity(ctx) {
  (await mongo.deleteOne(ctx.state.user.sub, ctx.state.entity)).deletedCount > 0 ? ok(ctx) : notFound(ctx);
}

function ok(ctx) {
  ctx.status = 200;
  ctx.body = ctx.body || {message: "Ok"};
}

function notFound(ctx) {
  ctx.status = 404;
  ctx.body = {
    message: "Not Found"
  }
}
