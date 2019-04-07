const bcrypt = require('bcrypt');
const Debug = require('debug');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const jwtSecret = require('./jwtConfig');
const models = require('../models');

const { User } = models;

const BCRYPT_SALT_ROUNDS = 12;
const debug = Debug('server');

// defines the local register strategy
passport.use(
  'local-register',
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      session: false,
    },
    (email, password, done) => {
      try {
        User.findOne({
          where: {
            email,
          },
        }).then((foundUser) => {
          if (foundUser != null) {
            debug(`Email "${email}" is already in use.`);
            return done(null, false, { message: 'Email is already in use.' });
          }
          bcrypt.hash(password, BCRYPT_SALT_ROUNDS).then((hashedPassword) => {
            User.create(
              {
                email,
                password: hashedPassword,
              },
            ).then((createdUser) => {
              debug(`User created with email ${email}`);
              // note the return needed with passport local - remove this return for passport JWT to work
              return done(null, createdUser);
            });
          });
        });
      } catch (error) {
        done(error);
      }
    },
  ),
);

const BAD_LOGIN_MESSAGE = 'Incorrect email or password.';

// defines local-login strategy
passport.use(
  'local-login',
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      session: false,
    },
    (email, password, done) => {
      try {
        User.findOne({
          where: {
            email,
          },
        }).then((foundUser) => {
          if (foundUser === null) {
            debug(`User with email ${email} does not exist`);
            return done(null, false, { message: BAD_LOGIN_MESSAGE });
          }
          bcrypt.compare(password, foundUser.password).then((response) => {
            if (response !== true) {
              debug(`Passwords do not match for email ${email}`);
              return done(null, false, { message: BAD_LOGIN_MESSAGE });
            }
            debug(`User with email ${email} found & authenticated`);
            // note the return needed with passport local - remove this return for passport JWT
            return done(null, foundUser);
          });
        });
      } catch (error) {
        done(error);
      }
    },
  ),
);

const BAD_TOKEN_MESSAGE = 'Invalid auth token.';

const opts = {
  jwtFromRequest: ExtractJWT.fromAuthHeaderWithScheme('JWT'),
  secretOrKey: jwtSecret.secret,
};

passport.use(
  'jwt',
  new JWTstrategy(opts, (jwtPayload, done) => {
    try {
      if (jwtPayload.id === undefined || jwtPayload.password === undefined) {
        done(null, false, { message: BAD_TOKEN_MESSAGE });
      }

      User.findOne({
        where: {
          id: jwtPayload.id,
          password: jwtPayload.password,
        },
      }).then((foundUser) => {
        if (foundUser) {
          debug(`User with email ${foundUser.email} found in database in passport`);
          // note the return is removed with passport JWT - add this return for passport local
          done(null, foundUser);
        } else {
          debug(`User with id ${jwtPayload.id} and that password hash does not exist`);
          done(null, false, { message: BAD_TOKEN_MESSAGE });
        }
      });
    } catch (error) {
      done(error);
    }
  }),
);
