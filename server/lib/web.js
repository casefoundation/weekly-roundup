const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');
const path = require('path');
const auth = require('./auth');
const userRoutes = require('./routes/user');
const roundupRoutes = require('./routes/roundup');
const articleGroupRoutes = require('./routes/articlegroup');
const articleRoutes = require('./routes/article');
const passport = require('passport');
const scraper = require('./scraper');

let server;

exports.init = (serve) => {
  const app = express();
  app.use(bodyParser.urlencoded({
    extended: true,
  }));
  app.use(bodyParser.json());
  auth.init(app);
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, '..', '..', 'client', 'build')));
    app.use(logger('combined'));
  }
  app.use(express.static(path.resolve(__dirname, 'images')));

  // use this function in express routes to require authenticated traffic
  const authenticate = passport.authenticate('jwt', { session: false });

  // initialize routes
  userRoutes.init(app, authenticate);
  roundupRoutes.init(app, authenticate);
  articleGroupRoutes.init(app, authenticate);
  articleRoutes.init(app, authenticate);

  // Always return the main index.html, so react-router renders the route in the client
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', '..', 'client', 'build', 'index.html'));
  });

  if (serve) {
    return new Promise((resolve, reject) => {
      server = app.listen(process.env.PORT || 8000, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(app);
        }
      });
    });
  }

  return app;
};

exports.close = () => {
  const browsers = scraper.getBrowsers();
  const promises = [];
  Object.keys(browsers).forEach(k => {
    promises.push(browsers[k].close());
  });
  return Promise.all(promises)
    .then(() => {
      if (server) {
        return server.close();
      }
    });
};
