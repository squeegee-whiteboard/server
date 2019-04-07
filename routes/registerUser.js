const Debug = require('debug');
const passport = require('passport');
const router = require('express').Router();
const models = require('../models');

const { User } = models;

const debug = Debug('server');


/* POST registerUser */
router.post('/', (req, res, next) => {
  passport.authenticate('local-register', (error, registeredUser, info) => {
    if (error) {
      debug(error);
    }
    if (info !== undefined) {
      debug(info.message);
      res.send(info.message);
    } else {
      req.logIn(registeredUser, (error) => {
        const userData = {
          email: registeredUser.email,
          username: req.body.username,
        };
        User.findOne({
          where: {
            email: userData.email,
          },
        }).then((foundUser) => {
          foundUser.update({
            username: userData.username,
          })
            .then(() => {
              debug('User created in the database');
              res.status(200).send({ message: 'User created.' });
            });
        });
      });
    }
  })(req, res, next);
});

module.exports = router;
