const mongodb = require('mongodb');
const {promisify} = require('util');
const assert = require('assert');

// hiding connect and db
module.exports = {
  insert, update, find, findOne, deleteOne
};

// inserts data into a collection called `${userId}/${entity}`
async function insert(userId, entity, data) {
  assert(!data.hasOwnProperty('_id'), 'Do not send ids when inserting new entities.');
  const connection = await getConnection();
  const collection = connection.collection(`${userId}/${entity.name}`);
  if (!Array.isArray(data)) {
    await collection.insertOne(data);
  } else {
    await collection.insertMany(data);
  }
}

async function update(userId, entity, data) {
  const connection = await getConnection();
  const collection = connection.collection(`${userId}/${entity.name}`);
  if (!Array.isArray(data)) {
    delete data._id;
    await collection.updateOne({_id: mongodb.ObjectId(entity.id) }, { $set: { ...data } });
  }
}

// retrieves data from a collection called `${userId}/${entity}`
async function find(userId, entity, filter) {
  console.log(`- Querying ${userId}/${entity.name} with filter: ${filter}`);
  const connection = await getConnection();
  const collection = connection.collection(`${userId}/${entity.name}`);
  const result = await collection.find(filter);
  return await result.toArray();
}

// retrieves document from a collection called `${userId}/${entity}` by id
async function findOne(userId, entity) {
  const connection = await getConnection();
  const collection = connection.collection(`${userId}/${entity.name}`);
  return await collection.findOne({"_id": mongodb.ObjectId(entity.id)});
}

// deletes a document from a collection called `${userId}/${entity}` by id
async function deleteOne(userId, entity) {
  const connection = await getConnection();
  const collection = connection.collection(`${userId}/${entity.name}`);
  return await collection.deleteOne({"_id": mongodb.ObjectId(entity.id)});
}

// singleton db instance
let db;

// db accessor
async function getConnection() {
  if (!db) {
    const asyncConnect = promisify(mongodb.MongoClient.connect);
    db = await asyncConnect('mongodb://' + process.env.MONGODB_URL);
  }
  return db;
}
