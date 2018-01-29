const User = require('../models/User');
const jwt = require('jsonwebtoken');
const randomstring = require('randomstring');
const formatResponse = require('./util').formatResponse;

const finishLogin = (user, res) => {
  const payload = {
    id: user.get('id'),
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET);
  res.json(formatResponse({
    message: 'ok',
    token,
    id: user.get('id'),
  }));
};

const login = (req, res) => {
  User.byEmail(req.body.email)
    .then((user) => {
      if (user && user.get('active') && user.verifyPassword(req.body.password)) {
        finishLogin(user, res);
      } else {
        formatResponse(null, 'Account not found or password invalid.');
      }
    })
    .catch((err) => {
      formatResponse(null, err);
    });
};

const startReset = (req, res) => {
  User.byEmail(req.body.email)
    .then((user) => {
      if (user) {
        return user.resetAccount().then(() => {
          res.json(formatResponse({
            message: 'Please check your email for reset instructions.',
          }));
        });
      }
    })
    .catch((err) => {
      formatResponse(null, err);
    });
};

const completeReset = (req, res) => {
  if (req.params.code) {
    User.byCode(req.params.code)
      .then((user) => {
        if (user) {
          user.set({
            resetCode: null,
            resetExpiration: null,
          });
          user.save().then(() => {
            finishLogin(user, res);
          });
        } else {
          res.json(formatResponse(null, 'User not found with reset code'));
        }
      });
  } else {
    res.json(formatResponse(null, 'No reset code found.'));
  }
};

const getUsers = (req, res) => {
  if (req.user.isAdmin()) {
    User.all()
      .then((users) => {
        res.json(formatResponse(users.filter((user) => {
          return req.user.getUserPermissions(user).view;
        }).map((object) => {
          return object.toJSON();
        })));
      });
  } else {
    res.json(formatResponse(null, 'User does not have permissions.'));
  }
};

const getUser = (req, res) => {
  User.byId(req.params.id)
    .then((user) => {
      if (!user || !user.get('active')) {
        res.json(formatResponse(null, 'User does not exist'));
      } else if (req.user.getUserPermissions(user).view) {
        res.json(formatResponse(user.toJSON()));
      } else {
        res.json(formatResponse(null, 'User does not have permissions.'));
      }
    });
};

const removeUser = (req, res) => {
  if (req.user.isAdmin()) {
    User.byId(req.body.id)
      .then((user) => {
        if (!user) {
          res.json(formatResponse(null, 'User does not exist.'));
        }
        user.set('active', false);
        user.save()
          .then(() => {
            res.json(formatResponse(user.toJSON()));
          });
      });
  } else {
    res.json(formatResponse(null, 'User does not have permissions.'));
  }
};

const saveUser = (req, res) => {
  const saveUserHelper = (user) => {
    if (req.body.password && req.body.password.trim().length > 0) {
      user.setPassword(req.body.password);
    }
    user.save()
      .then(() => {
        res.json(formatResponse(user.toJSON()));
      })
      .catch((err) => {
        res.json(formatResponse(null, err));
      });
  };
  if (!req.body.id && req.user.isAdmin()) {
    User.byEmail(req.body.email)
      .then((user) => {
        if (user) {
          user.set('email', req.body.email);
          user.set('role', req.body.role);
          saveUserHelper(user);
        } else {
          const newUser = new User({
            email: req.body.email,
            role: req.body.role,
            password: randomstring.generate(),
            active: true,
          });
          saveUserHelper(newUser);
        }
      });
  } else if (req.user.isAdmin()) {
    User.byId(req.body.id)
      .then((user) => {
        if (user) {
          user.set('email', req.body.email);
          user.set('role', req.body.role);
          saveUserHelper(user);
        } else {
          res.formatResponse(null, 'User does not exist.');
        }
      });
  } else {
    res.formatResponse(null, 'User does not have permissions.');
  }
};

exports.init = (app, authenticate) => {
  app.post('/api/user/login', login);
  app.post('/api/user/reset', startReset);
  app.get('/api/user/reset/:code', completeReset);
  app.get('/api/user', authenticate, getUsers);
  app.get('/api/user/:id', authenticate, getUser);
  app.put('/api/user', authenticate, saveUser);
  app.post('/api/user', authenticate, saveUser);
  app.post('/api/user/remove', authenticate, removeUser);
};
