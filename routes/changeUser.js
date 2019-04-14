/*
Defines the REST API endpoints used for changing details about the user
See README for detailed documentation of each endpoint
*/
const Debug = require('debug');
const Sequelize = require('sequelize');
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const models = require('../models');
const jwtSecret = require('../config/jwtConfig');
const { saltRounds } = require('../config/bcryptConfig');

const router = express.Router();
const debug = Debug('server');
const { Op } = Sequelize;
const { User } = models;
const BAD_TOKEN_MESSAGE = 'Invalid auth token.';


// GET - /changeUser/info
// Gets the information stored about the user from the server
// See README for detailed documentation
router.get('/info', (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err || !user) return res.json({ success: false, message: BAD_TOKEN_MESSAGE });
    try {
      return res.json({
        success: true,
        username: user.username,
        email: user.email,
        message: 'User info successfully retrieved.',
      });
    } catch (err2) {
      return res.json({ success: false, message: 'Failed to retrieve user info.' });
    }
  })(req, res, next);
});


// PATCH - /changeUser/username
// Changes the user's name
// See README for detailed documentation
router.patch('/username', (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err || !user) return res.json({ success: false, message: BAD_TOKEN_MESSAGE });
    if (req.body.username) {
      try {
        return user.update({
          username: req.body.username,
        }).then(() => {
          debug('Username updated');
          return res.json({ success: true, message: 'Username updated.' });
        }).catch(() => res.json({ success: false, message: 'Failed to change username.' }));
      } catch (err2) {
        return res.json({ success: false, message: 'Failed to change username.' });
      }
    } else {
      return res.json({ success: false, message: 'No new username provided.' });
    }
  })(req, res, next);
});


// PATCH - /changeUser/email
// Change's the user's email
// See README for detailed documentation
router.patch('/email', (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err || !user) return res.json({ success: false, message: BAD_TOKEN_MESSAGE });
    if (req.body.email) {
      try {
        return User.findOne({
        // Make sure another user isn't using this email, first.
          where: {
            email: req.body.email,
            id: { [Op.ne]: user.id },
          },
        }).then((existingUser) => {
          if (existingUser) {
            return res.json({ success: false, msg: 'Someone else is using that email!' });
          }
          return user.update({
            email: req.body.email,
          }).then(() => {
            debug('email updated');
            return res.json({ success: true, message: 'Email updated.' });
          }).catch(() => res.json({ success: false, message: 'Email invalid.' }));
        }).catch(() => res.json({ success: false, message: 'Failed to update email address.' }));
      } catch (err2) {
        return res.json({ success: false, message: 'Failed to update email address.' });
      }
    } else {
      return res.json({ success: false, message: 'No new email provided.' });
    }
  })(req, res, next);
});


// PATCH - /changeUser/password
// Change's the user's password
// See README for detailed documentation
router.patch('/password', (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err || !user) return res.json({ success: false, message: BAD_TOKEN_MESSAGE });
    if (req.body.newPassword && req.body.oldPassword) {
      try {
        return bcrypt.compare(req.body.oldPassword, user.password, (err2, isMatch) => {
          if (err2) {
            debug(err2);
            return res.json({ success: false, message: 'There was an error updating the password.' });
          }
          if (isMatch) {
            return bcrypt.genSalt(saltRounds, (err3, salt) => {
              bcrypt.hash(req.body.newPassword, salt, (err4, hashedPassword) => {
                user.update({ password: hashedPassword }).then(() => {
                  const token = jwt.sign({
                    id: user.id,
                    password: hashedPassword,
                  }, jwtSecret.secret);
                  return res.json({
                    success: true,
                    token: `JWT ${token}`,
                    message: 'Password successfully updated.',
                  });
                });
              });
            });
          }
          return res.json({ success: false, message: 'Wrong old password.' });
        }).catch(() => res.json({ success: false, message: 'There was an error updating the password.' }));
      } catch (err5) {
        return res.json({ success: false, message: 'There was an error updating the password.' });
      }
    } else {
      return res.json({ success: false, message: 'Request requires both oldPassword and newPassword fields.' });
    }
  })(req, res, next);
});

module.exports = router;
