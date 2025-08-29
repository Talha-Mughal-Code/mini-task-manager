const mongoose = require('mongoose');
const env = require('./env');

async function connectToDatabase() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.mongoUri, {
    autoIndex: true,
  });
  return mongoose.connection;
}

module.exports = { connectToDatabase };
