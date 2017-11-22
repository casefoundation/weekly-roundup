require('dotenv').config();
const web = require('./lib/web');
const database = require('./lib/database');
const User = require('./lib/models/User');

database.init()
  .then(() => User.seedAdmin())
  .then(() => web.init(true))
  .then(() => {
    console.log('Running');
  })
  .catch((err) => {
    console.error(err);
  })
