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

const { Board } = models;

const BAD_TOKEN_MESSAGE = 'Invalid auth token.';

router.post('/create', (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err || !user) return res.json({ success: false, message: BAD_TOKEN_MESSAGE });
    if (req.body.name) {
      try {
        return Board.create({
          board_name: req.body.name,
          is_enabled: true,
          owner_id: user.id,
        }).then((createdBoard) => {
          user.addBoard(createdBoard);
          return res.json({
            success: true,
            message: 'Board created.',
            board_id: createdBoard.board_url,
          });
        });
      } catch (err2) {
        return res.json({ success: false, message: 'Failed to create board.' });
      }
    } else {
      return res.json({ success: false, message: 'No board name provided.' });
    }
  })(req, res, next);
});

router.patch('/name', (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err || !user) res.json({ success: false, message: BAD_TOKEN_MESSAGE });
    if (req.body.name && req.body.board_id) {
      try {
        return user.getBoards({ where: { board_url: req.body.board_id } })
          .then((associatedBoards) => {
            if (associatedBoards.length > 0) {
              return associatedBoards[0].update({ board_name: req.body.name })
                .then(() => res.json({ success: true, message: 'Board name updated.' }));
            }
            return res.json({ success: false, message: 'Failed to update name.' });
          });
      } catch (err2) {
        return res.json({ success: false, message: 'Failed to update name.' });
      }
    } else {
      return res.json({ success: false, message: 'Board name and board_id must both be provided.' });
    }
  })(req, res, next);
});

router.put('/addMember', (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err || !user) return res.json({ success: false, message: BAD_TOKEN_MESSAGE });
    if (req.body.board_id) {
      try {
        return Board.findOne({ where: { board_url: req.body.board_id } })
          .then(foundBoard => user.addBoard(foundBoard))
          .then(() => res.json({ success: true, message: 'User added to board.' }));
      } catch (err2) {
        return res.json({ success: false, message: 'No board_id provided.' });
      }
    } else {
      return res.json({ success: false, message: 'No board_id provided.' });
    }
  })(req, res, next);
});

router.post('/delete', (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err || !user) {
      return res.json({ success: false, message: BAD_TOKEN_MESSAGE });
    }
    if (req.body.board_id) {
      try {
        return user.getBoards({ where: { board_url: req.body.board_id } })
          .then((associatedBoards) => {
            if (associatedBoards.length > 0) {
              return associatedBoards[0].update({ is_enabled: false })
                .then(() => res.json({ success: true, message: 'Board disabled.' }));
            }
            return res.json({ success: false, message: 'Failed to disable board.' });
          });
      } catch (err2) {
        return res.json({ success: false, message: 'Failed to disable board.' });
      }
    } else {
      return res.json({ success: false, message: 'No board_id provided.' });
    }
  })(req, res, next);
});

module.exports = router;
