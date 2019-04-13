const JwtStrategy = require('passport-jwt').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const { ExtractJwt } = require('passport-jwt');
const bcrypt = require('bcrypt');

// load up the user model
const models = require('../models');

const { User } = models;
const jwtSecret = require('./jwtConfig');

const BAD_TOKEN_MESSAGE = 'Invalid auth token.';
const BAD_LOGIN_MESSAGE = 'Incorrect email or password.';

module.exports = (passport) => {
  passport.use('jwt', new JwtStrategy({ jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('JWT'), secretOrKey: jwtSecret.secret }, ((jwtPayload, done) => {
    try {
      if (jwtPayload.id === undefined || jwtPayload.password === undefined) {
        return done(null, false, { message: BAD_TOKEN_MESSAGE });
      }

      return User.findOne({
        where: {
          id: jwtPayload.id,
          password: jwtPayload.password,
        },
      }).then((foundUser) => {
        if (foundUser) {
          return done(null, foundUser);
        }
        return done(null, false, { message: BAD_TOKEN_MESSAGE });
      });
    } catch (error) {
      return done(null, false, { message: 'An error was encountered' });
    }
  })));

  passport.use('local', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
  },
  ((email, password, done) => {
    try {
      return User.findOne({
        where: {
          email,
        },
      }).then((foundUser) => {
        if (foundUser) {
          return bcrypt.compare(password, foundUser.password, (err, isMatch) => {
            if (err) {
              throw err;
            } else if (isMatch) {
              return done(null, foundUser);
            } else {
              return done(null, false, { message: BAD_LOGIN_MESSAGE });
            }
          });
        }
        return done(null, false, { message: BAD_LOGIN_MESSAGE });
      });
    } catch (error) {
      return done(error, false);
    }
  })));
};
