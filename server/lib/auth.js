const passport = require('passport');
const passportJWT = require('passport-jwt');

const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;
const User = require('./models/User');

exports.init = (app) => {
  app.use(passport.initialize());

  const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
  };

  passport.use(new JwtStrategy(jwtOptions, (jwtPayload, done) => {
    User.byId(jwtPayload.id)
      .then((user) => {
        if (user && user.get('active')) {
          done(null, user);
        } else {
          done(null, false);
        }
      })
      .catch((err) => done(err));
  }));
};
