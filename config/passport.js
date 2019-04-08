const JwtStrategy = require('passport-jwt').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const bcrypt = require('bcrypt');

// load up the user model
const models = require('../models');

const { User } = models;
const jwtSecret = require('./jwtConfig');

module.exports = function(passport){
  passport.use(new JwtStrategy({jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), secretOrKey: jwtSecret}, function(jwt_payload, done) {
    try {
      if (jwtPayload.id === undefined) {
        done(null, false, { message: BAD_TOKEN_MESSAGE });
      }
      User.findOne({
        where: {
          id: jwtPayload.id,
        },
      }).then((foundUser) => {
        if (foundUser) {
          // note the return is removed with passport JWT - add this return for passport local
          return done(null, foundUser);
        } else {
          return done(null, false, { message: BAD_TOKEN_MESSAGE });
        }
      });
    } catch (error) {
      return done(error, false);
    }
  }));

  passport.use(new LocalStrategy({
      usernameField: 'username',
      passwordField: 'password'
    },
    function (username, password, done){
      try {
        User.findOne({
          where: {
            username: username
          }
        }).then((foundUser) => {
          if (foundUser){
            bcrypt.compare(password, foundUser.password, function(err, isMatch){
              if (err){
                throw err;
              }
              else if (isMatch){
                return done(null, foundUser);
              }
              else {
                return done(null, false, {message: 'Incorrect username or password'});
              }
            });
          } else{
            return done(null, false, {message: 'Incorrect username or password'});
          }
        });
      } catch (error) {
        return done(error, false);
      }
    }
  ));
}