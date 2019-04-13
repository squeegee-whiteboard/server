const Debug = require('debug');
const Sequelize = require('sequelize');

const express = require('express');

const router = express.Router();
const passport = require('passport');


const debug = Debug('server');

const { Op } = Sequelize;

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const models = require('../models');
const jwtSecret = require('../config/jwtConfig');
const { saltRounds } = require('../config/bcryptConfig');

const { User } = models;

const BAD_TOKEN_MESSAGE = 'Invalid auth token.';

router.get('/info', (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err || !user) return res.json({ success: false, message: BAD_TOKEN_MESSAGE });
    try {
      User.findOne({
        where: { id: user.id },
      }).then(foundUser => res.json({
        success: true,
        username: foundUser.username,
        email: foundUser.email,
        message: 'User info successfully retrieved.',
      }));
    } catch (err2) {
      return res.json({ success: false, message: 'Failed to retrieve user info.' });
    }
  })(req, res, next);
});

router.patch('/username', (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err || !user) return res.json({ success: false, message: BAD_TOKEN_MESSAGE });
    if (req.body.username) {
      try {
        User.findOne({
          where: { id: user.id },
        }).then((foundUser) => {
          foundUser.update({
            username: req.body.username,
          })
            .then(() => {
              debug('Username updated');

              return res.json({ success: true, message: 'Username updated.' });
            });
        });
      } catch (err2) {
        return res.json({ success: false, message: 'Failed to change username.' });
      }
    } else {
      return res.json({ success: false, message: 'No new username provided.' });
    }
  })(req, res, next);
});

router.patch('/email', (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err || !user) return res.json({ success: false, message: BAD_TOKEN_MESSAGE });
    if (req.body.email) {
      try {
        User.findOne({
        // Make sure another user isn't using this email, first.
          where: {
            email: req.body.email,
            id: { [Op.ne]: user.id },
          },
        }).then((existingUser) => {
          if (existingUser) {
            return res.json({ success: false, msg: 'Someone else is using that email!' });
          }
          User.findOne({
            where: { id: user.id },
          }).then((foundUser) => {
            foundUser.update({
              email: req.body.email,
            })
              .then(() => {
                debug('email updated');

                return res.json({ success: true, message: 'Email updated.' });
              });
          });
        });
      } catch (err2) {
        return res.json({ success: false, message: 'Failed to update email address.' });
      }
    } else {
      return res.json({ success: false, message: 'No new email provided.' });
    }
  })(req, res, next);
});

router.patch('/password', (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err || !user) return res.json({ success: false, message: BAD_TOKEN_MESSAGE });
    if (req.body.newPassword && req.body.oldPassword) {
      try {
        User.findOne({
          where: { id: user.id },
        }).then((foundUser) => {
          bcrypt.compare(req.body.oldPassword, foundUser.password, (err2, isMatch) => {
            if (err2) {
              debug(err2);
              return res.json({ success: false, message: 'There was an error updating the password.' });
            } if (isMatch) {
              bcrypt.genSalt(saltRounds, (err3, salt) => {
                bcrypt.hash(req.body.newPassword, salt, (err4, hashedPassword) => {
                  foundUser.update({ password: hashedPassword })
                    .then(() => {
                      const token = jwt.sign({
                        id: foundUser.id,
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
            } else {
              return res.json({ success: false, message: 'Wrong old password.' });
            }
          });
        });
      } catch (err5) {
        return res.json({ success: false, message: 'There was an error updating the password.' });
      }
    } else {
      return res.json({ success: false, message: 'Request requires both oldPassword and newPassword fields.' });
    }
  })(req, res, next);
});

module.exports = router;
