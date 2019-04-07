const Debug = require('debug');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = require('express').Router();
const models = require('../models');
const jwtSecret = require('../config/jwtConfig');

const { User } = models;
const debug = Debug('server');


/* POST registerUser */
router.post('/', (req, res, next) => {
  passport.authenticate('local-register', (error, registeredUser, info) => {
    // not user facing error in registration
    if (error) {
      debug(error);
    }

    // if an error message occured in passportAuth registration
    // info will not be undefined
    if (info !== undefined) {
      debug(info.message);

      res.send({
        success: false,
        message: info.message,
      });
    } else {
      // login must be called to use custom callback with passport-local
      // custom callback inserts userdata into the table (passport only creates the basics)
      // also creates a session for the user
      // and returns their auth token
      req.logIn(registeredUser, (error) => {
        const userData = {
          id: registeredUser.id,
          username: req.body.username,
        };

        User.findOne({
          where: {
            id: userData.id,
          },
        })
          .then((foundUser) => {
            foundUser.update({
              username: userData.username,
            })
              .then(() => {
                debug('User created in the database');
                const token = jwt.sign({ id: foundUser.id }, jwtSecret.secret);
                res.status(200).send({
                  success: true,
                  token,
                  message: 'User successfully created.',
                });
              });
          });
      });
    }
  })(req, res, next);
});

module.exports = router;
