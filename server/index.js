require('dotenv').config();
const web = require('./lib/web');
const database = require('./lib/database');
const User = require('./lib/models/User');

if (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'production') {
  throw new Error('Invalid NODE_ENV. Accepted values: test, production');
}

module.exports = database.init()
  .then(() => User.seedAdmin())
  .then(() => web.init(true))
  .then(() => {
    console.log('Running');
  })
  .catch((err) => {
    console.error(err);
  });
