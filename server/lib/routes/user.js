const User = require('../models/User');
const jwt = require('jsonwebtoken');
const randomstring = require('randomstring');
const sgMail = require('@sendgrid/mail');
const formatResponse = require('./util').formatResponse;

const finishLogin = (user, res) => {
  const payload = {
    id: user.get('id'),
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET);
  res.json(formatResponse({
    message: 'ok',
    token,
    user: user.toJSON(),
  }));
};

const checkAuth = (req, res) => {
  if (req.user) {
    res.json(formatResponse({
      message: 'ok',
      user: req.user.toJSON(),
    }));
  } else {
    res.json(formatResponse(null, 'User not logged in'));
  }
};

const login = (req, res) => {
  User.byEmail(req.body.email)
    .then((user) => {
      if (user && user.get('active') && user.verifyPassword(req.body.password)) {
        finishLogin(user, res);
      } else {
        res.json(formatResponse(null, 'Account not found or password invalid.'));
      }
    })
    .catch((err) => {
      res.json(formatResponse(null, err));
    });
};

const startReset = (req, res) => {
  User.byEmail(req.body.email)
    .then((user) => {
      if (user) {
        user.resetAccount();
        user.save().then(() => {
          // send reset email
          sendResetCodeEmail(req.body.email, user.get('reset_code'));
          res.json(formatResponse({
            message: 'Please check your email for reset instructions.',
          }));
        });
      } else {
        res.json(formatResponse(null, 'User with that email was not found.'));
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
            reset_code: null,
            reset_expiration: null,
          });
          const newPassword = randomstring.generate();
          user.setPassword(newPassword);
          user.save().then(() => {
            sendResetEmail(user.get('email'), newPassword);
            res.json(formatResponse({
              message: 'Password was successfully reset. Please check your email.',
            }));
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
    User.countAll()
      .then(count => {
        User.all(req.params.page)
          .then((users) => {
            const usersArr = users.filter((user) => {
              return req.user.getUserPermissions(user).view;
            }).map((object) => {
              return object.toJSON();
            });
            res.json(formatResponse({
              users: usersArr,
              count,
            }));
          });
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
          if (!user.get('active')) {
            // Reactivate User -- send welcome email
            sendWelcomeEmail(req.body.email, req.body.password);
          }
          user.set('email', req.body.email);
          user.set('role', req.body.role);
          user.set('active', true);
          saveUserHelper(user);
        } else {
          const newUser = new User({
            email: req.body.email,
            role: req.body.role,
            password: req.body.password,
            active: true,
          });
          // Send welcome email to new user
          sendWelcomeEmail(req.body.email, req.body.password);
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
          res.json(formatResponse(null, 'User does not exist.'));
        }
      });
  } else {
    res.json(formatResponse(null, 'User does not have permissions.'));
  }
};

const saveSettings = (req, res) => {
  if (req.body.old_password && req.body.new_password) {
    if (req.user.verifyPassword(req.body.old_password)) {
      req.user.setPassword(req.body.new_password);
    } else {
      return res.json(formatResponse(null, 'Incorrect old password'));
    }
  }
  if (req.body.signature !== null) {
    req.user.set('signature', req.body.signature);
  }
  req.user.save()
    .then(() => {
      res.json(formatResponse(req.user.toJSON()));
    });
};

const sendWelcomeEmail = (email, password) => {
  if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    sgMail.send({
      to: email,
      from: 'noreply_weeklyroundup@casefoundation.org',
      subject: 'Welcome to Weekly Roundup',
      text: `Welcome to Weekly Roundup! Your temporary password is ${password}. Please change your password after logging in.`,
    });
  }
};

const sendResetCodeEmail = (email, code) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  sgMail.send({
    to: email,
    from: 'noreply_weeklyroundup@casefoundation.org',
    subject: 'Weekly Roundup Reset Code',
    text: `Your reset code is ${code}`,
  });
};

const sendResetEmail = (email, password) => {
  if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    sgMail.send({
      to: email,
      from: 'noreply_weeklyroundup@casefoundation.org',
      subject: 'Weekly Roundup New Login',
      text: `Your temporary password is ${password}. Please change your password after logging in.`,
    });
  }
}

exports.init = (app, authenticate) => {
  app.get('/api/user/checkauth', authenticate, checkAuth);
  app.post('/api/user/login', login);
  app.post('/api/user/reset', startReset);
  app.get('/api/user/reset/:code', completeReset);
  app.get('/api/users/:page', authenticate, getUsers);
  app.get('/api/user/:id', authenticate, getUser);
  app.put('/api/user', authenticate, saveUser);
  app.post('/api/user', authenticate, saveUser);
  app.post('/api/user/remove', authenticate, removeUser);
  app.post('/api/settings', authenticate, saveSettings);
};
