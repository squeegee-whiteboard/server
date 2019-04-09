// const Debug = require('debug');
// const Sequelize = require('sequelize');

const express = require('express');

const router = express.Router();
const passport = require('passport');


// const debug = Debug('server');

// const { Op } = Sequelize;

// const jwt = require('jsonwebtoken');
const models = require('../models');
// const jwtSecret = require('../config/jwtConfig');
// const { saltRounds } = require('../config/bcryptConfig');

const { User, Board } = models;

const BAD_TOKEN_MESSAGE = 'Invalid auth token.';

router.get('/owned', (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err || !user) res.json({ success: false, message: BAD_TOKEN_MESSAGE });
    try {
      Board.findAll({ where: { owner_id: user.id } }).then((foundBoards) => {
        res.json({
          success: true,
          message: 'Successfully retrieved owned boards.',
          boards: foundBoards,
        });
      });
    } catch (err2) {
      res.json({ success: false, message: 'Failed to retrieve owned boards.' });
    }
  })(req, res, next);
});

router.get('/member', (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err || !user) res.json({ success: false, message: BAD_TOKEN_MESSAGE });
    try {
      User.findOne({
        where: { id: user.id },
      }).then((foundUser) => {
        foundUser.getBoards().then((foundBoards) => {
          res.json({
            success: true,
            message: 'Successfully retrieved owned boards.',
            boards: foundBoards,
          });
        });
      });
    } catch (err2) {
      res.json({ success: false, message: 'Failed to retrieve owned boards.' });
    }
  })(req, res, next);
});

module.exports = router;
