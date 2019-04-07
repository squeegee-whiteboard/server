const Debug = require('debug');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = require('express').Router();
const models = require('../models');
const jwtSecret = require('../config/jwtConfig');

const { User } = models;
const debug = Debug('server');

/* GET /loginUser */
router.get('/', (req, res, next) => {
  passport.authenticate('local-login', (error, loginUser, info) => {
    // not user facing error in login
    if (error) {
      debug(error);
    }

    // if an error message occured in passportAuth
    // info will not be undefined
    if (info !== undefined) {
      debug(info.message);
      res.send({
        success: false,
        message: info.message,
      });
    } else {
      // login must be called to use custom callback with passport-local
      // also creates a session for the user
      // and returns their auth token
      req.logIn(loginUser, (error) => {
        User.findOne({
          where: {
            id: loginUser.id,
          },
        }).then((foundUser) => {
          const token = jwt.sign({ id: foundUser.id }, jwtSecret.secret);
          res.status(200).send({
            success: true,
            token,
            message: 'User found and logged in',
          });
        });
      });
    }
  })(req, res, next);
});


module.exports = router;
