const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');
const http = require('http');
const User = require('./models/User');
const auth = require('./auth');
const routes = require('./routes');
const passport = require('passport');

exports.init = (serve) => {
  const app = express();
  app.use(bodyParser.json({
    'extended': true
  }));
  auth.init(app);
  if (process.env.NODE_ENV !== 'test') {
    app.use(express.static('./build'));
    app.use(logger('combined'));
  }

  //use this function in express routes to require authenticated traffic
  const authenticate = passport.authenticate('jwt', { 'session': false });

  app.post('/api/user/login',routes.user.login);
  app.post('/api/user/reset',routes.user.startReset);
  app.get('/api/user/reset/:code',routes.user.completeReset);
  app.get('/api/user',authenticate,routes.user.getUsers);
  app.get('/api/user/:user',authenticate,routes.user.getUser);
  app.put('/api/user',authenticate,routes.user.saveUser);
  app.post('/api/user/:user',authenticate,routes.user.saveUser);

  if (serve) {
    return new Promise((resolve,reject) => {
      app.listen(process.env.PORT || 8000,(err) => {
        if (err) {
          reject(err);
        } else {
          resolve(app);
        }
      })
    })
  } else {
    return app;
  }
}
