const Debug = require('debug');
const passport = require('passport');
const router = require('express').Router();
const models = require('../models');

const { User } = models;
const debug = Debug('server');

/* PATCH /updateUsername */
router.patch('/', (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (error, updateUser, info) => {
    // not user facing error in login
    if (error) {
      debug(error);
    }

    // if an error message occured in passportAuth
    // info will not be undefined
    if (info !== undefined) {
      debug(info.message);
      res.status(403).send({
        success: false,
        message: info.message,
      });
    } else {
      // find a user with matching id and update
      // TODO: can I just instantly update this user model?
      User.findOne({
        where: {
          id: updateUser.id,
        },
      }).then((foundUser) => {
        if (foundUser != null) {
          debug(`User with email ${foundUser.email} found in database.`);
          debug(req.body);
          foundUser
            .update({
              username: req.body.username,
            })
            .then(() => {
              debug('Username updated');

              res.status(200).send({ success: true, message: 'Username updated' });
            });
        } else {
          debug(`User with email ${foundUser.email} does not exist in database.`);

          res.status(401).send({
            success: false,
            message: 'Failed to update username',
          });
        }
      });
    }
  })(req, res, next);
});

module.exports = router;
