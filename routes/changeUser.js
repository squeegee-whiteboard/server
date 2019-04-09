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

router.patch('/username', (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err || !user) res.json({ success: false, message: BAD_TOKEN_MESSAGE });
    if (req.body.username) {
      User.findOne({
        where: { id: user.id },
      }).then((foundUser) => {
        foundUser.update({
          username: req.body.username,
        })
          .then(() => {
            debug('Username updated');

            res.json({ success: true, message: 'Username updated.' });
          });
      });
    }
  })(req, res, next);
});

router.patch('/email', (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err || !user) res.json({ success: false, message: BAD_TOKEN_MESSAGE });
    if (req.body.email) {
      User.findOne({
        // Make sure another user isn't using this email, first.
        where: {
          email: req.body.email,
          id: { [Op.ne]: user.id },
        },
      }).then((existingUser) => {
        if (existingUser) {
          res.json({ success: false, msg: 'Someone else is using that email!' });
        } else {
          User.findOne({
            where: { id: user.id },
          }).then((foundUser) => {
            foundUser.update({
              email: req.body.email,
            })
              .then(() => {
                debug('email updated');

                res.status(200).send({ success: true, message: 'Email updated.' });
              });
          });
        }
      });
    }
  })(req, res, next);
});

router.patch('/password', (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err || !user) res.json({ success: false, message: BAD_TOKEN_MESSAGE });
    if (req.body.newPassword && req.body.oldPassword) {
      User.findOne({
        where: { id: user.id },
      }).then((foundUser) => {
        bcrypt.compare(req.body.oldPassword, foundUser.password, (err2, isMatch) => {
          if (err) {
            debug(err);
            res.json({ success: false, message: 'There was an error updating the password.' });
          } else if (isMatch) {
            bcrypt.genSalt(saltRounds, (err3, salt) => {
              bcrypt.hash(req.body.newPassword, salt, (err4, hashedPassword) => {
                foundUser.update({ password: hashedPassword })
                  .then(() => {
                    console.log("get here");
                    const token = jwt.sign({
                      id: foundUser.id,
                      password: hashedPassword,
                    }, jwtSecret.secret);
                    res.json({
                      success: true,
                      token: `JWT ${token}`,
                      message: 'Password successfully updated.',
                    });
                  });
              });
            });
          } else {
            res.json({ success: false, message: 'Wrong old password.' });
          }
        });
      });
    }
  })(req, res, next);
});

module.exports = router;
