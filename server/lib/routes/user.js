const User = require('../models/User');
const jwt = require('jsonwebtoken');
const randomstring = require('randomstring');

const finishLogin = (user,res) => {
  const payload = {
    'id': user.get('id')
  }
  const token = jwt.sign(payload,process.env.JWT_SECRET);
  res.send({
    'message': 'ok',
    'token': token,
    'id': user.get('id')
  });
}

exports.login = (req,res,next) => {
  User.byEmail(req.body.email)
    .then((user) => {
      if (user && user.get('active') && user.verifyPassword(req.body.password)) {
        finishLogin(user,res);
      } else {
        res.status(401);
        next(new Error('Account not found or password invalid.'));
      }
    })
    .catch((err) => {
      next(err);
    });
}

exports.startReset = (req,res,next) => {
  User.byEmail(req.body.email)
    .then((user) => {
      if (user) {
        return user.resetAccount().then(() => {
          res.send({'message': 'Please check your email for reset instructions.'});
        });
      } else {
        res.sendStatus(404);
      }
    })
    .catch((err) => {
      next(err);
    });
}

exports.completeReset = (req,res,next) => {
  if (req.params.code) {
    User.byCode(req.params.code)
      .then((user) => {
        if (user) {
          user.set({
            'resetCode': null,
            'resetExpiration': null
          });
          return user.save().then(() => {
            finishLogin(user,res);
          });
        } else {
          res.sendStatus(404);
        }
      });
  } else {
    res.sendStatus(401);
  }
}

exports.getUsers = (req,res,next) => {
  User.all()
    .then((users) => {
      res.json(users.filter((user) => {
        return req.user.getUserPermissions(user).view;
      }).map((object) => {
        return object.toJSON();
      }));
    });
}

exports.getUser = (req,res,next) => {
  if (req.user.getUserPermissions(req._user).view) {
    res.json(req._user.toJSON());
  } else {
    res.sendStatus(401);
  }
}

exports.saveUser = (req,res,next) => {
  const saveUser = (user) => {
    if (req.body.password && req.body.password.trim().length > 0) {
      user.setPassword(req.body.password);
    }
    user.save()
      .then(() => {
        res.json(user.toJSON());
      })
      .catch((err) => {
        next(err);
      });
  }
  if (!req._user) {
    const user = new User({
      'email': req.body.email,
      'role': req.body.role,
      'password': randomstring.generate(),
      'active': req.body.active
    });
    saveUser(user);
  } else {
    if (req.user.isAdmin()) {
      req._user.set('email',req.body.email);
      req._user.set('role',req.body.role);
      req._user.set('active',req.body.active);
      req._user.set('ready',req.body.ready);
    }
    saveUser(req._user);
  } 
}
