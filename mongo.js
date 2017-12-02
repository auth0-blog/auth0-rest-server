const mongodb = require('mongodb');
const {promisify} = require('util');

// hiding connect and db
module.exports = {
  insert, find, findOne, deleteOne
};

// inserts data into a collection called `${userId}/${entity}`
async function insert(userId, entity, data) {
  const connection = await getConnection();
  const collection = connection.collection(`${userId}/${entity.name}`);
  if (!Array.isArray(data)) {
    await collection.insertOne(data);
  } else {
    await collection.insertMany(data);
  }
}

// retrieves data from a collection called `${userId}/${entity}`
async function find(userId, entity) {
  const connection = await getConnection();
  const collection = connection.collection(`${userId}/${entity.name}`);
  const result = await collection.find();
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
    console.log('==== connecting to database');
    console.log('==== db url: mongodb://' + process.env.MONGODB_URL);
    db = await asyncConnect('mongodb://' + process.env.MONGODB_URL);
    console.log(db);
  }
  return db;
}
