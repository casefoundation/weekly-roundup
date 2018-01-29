const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');
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
    app.use(express.static('./build'));
    app.use(logger('combined'));
  }

  // use this function in express routes to require authenticated traffic
  const authenticate = passport.authenticate('jwt', { session: false });

  // initialize routes
  userRoutes.init(app, authenticate);
  roundupRoutes.init(app, authenticate);
  articleGroupRoutes.init(app, authenticate);
  articleRoutes.init(app, authenticate);

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
