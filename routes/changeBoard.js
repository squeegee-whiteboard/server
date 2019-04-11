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

router.post('/create', (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err || !user) res.json({ success: false, message: BAD_TOKEN_MESSAGE });
    if (req.body.name) {
      try {
        User.findOne({
          where: { id: user.id },
        }).then((foundUser) => {
          Board.create({
            board_name: req.body.name,
            is_enabled: true,
            owner_id: user.id,
          }).then((createdBoard) => {
            foundUser.addBoard(createdBoard);
            res.json({
              success: true,
              message: 'Board created.',
              board_id: createdBoard.id,
            });
          });
        });
      } catch (err2) {
        res.json({ success: false, message: 'Failed to create board.' });
      }
    } else {
      res.json({ success: false, message: 'No board name provided.' });
    }
  })(req, res, next);
});

router.patch('/name', (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err || !user) res.json({ success: false, message: BAD_TOKEN_MESSAGE });
    if (req.body.name && req.body.board_id) {
      try {
        User.findOne({
          where: { id: user.id },
        }).then((foundUser) => {
          foundUser.getBoards({ where: { id: req.body.board_id } }).then((associatedBoards) => {
            if (associatedBoards.length > 0) {
              associatedBoards[0].update({ board_name: req.body.name }).then(() => {
                res.json({ success: true, message: 'Board name updated.' });
              });
            } else {
              res.json({ success: false, message: 'Failed to update name.' });
            }
          });
        });
      } catch (err2) {
        res.json({ success: false, message: 'Failed to update name.' });
      }
    } else {
      res.json({ success: false, message: 'Board name and board_id must both be provided.' });
    }
  })(req, res, next);
});

router.put('/addMember', (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err || !user) res.json({ success: false, message: BAD_TOKEN_MESSAGE });
    if (req.body.board_id) {
      try {
        User.findOne({
          where: { id: user.id },
        }).then((foundUser) => {
          Board.findOne({ where: { id: req.body.board_id } }).then((foundBoard) => {
            foundUser.addBoard(foundBoard);
          }).then(() => {
            res.json({ success: true, message: 'User added to board.' });
          });
        });
      } catch (err2) {
        res.json({ success: false, message: 'No board_id provided.' });
      }
    }
  })(req, res, next);
});

router.delete('/delete', (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err || !user) res.json({ success: false, message: BAD_TOKEN_MESSAGE });
    if (req.body.board_id) {
      try {
        User.findOne({
          where: { id: user.id },
        }).then((foundUser) => {
          foundUser.getBoards({ where: { id: req.body.board_id } }).then((associatedBoards) => {
            if (associatedBoards.length > 0) {
              associatedBoards[0].update({ is_enabled: false }).then(() => {
                res.json({ success: true, message: 'Board disabled.' });
              });
            } else {
              res.json({ success: false, message: 'Failed to disable board.' });
            }
          });
        });
      } catch (err2) {
        res.json({ success: false, message: 'Failed to disable board.' });
      }
    } else {
      res.json({ success: false, message: 'No board_id provided.' });
    }
  })(req, res, next);
});

module.exports = router;
