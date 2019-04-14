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

router.get('/owned', (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err || !user) res.json({ success: false, message: BAD_TOKEN_MESSAGE });
    try {
      return Board.findAll({
        where: {
          owner_id: user.id,
          is_enabled: true,
        },
      }).then((foundBoards) => {
        const boardList = [];

        foundBoards.forEach((board) => {
          boardList.push(board.toSimpleObject());
        });
        return res.json({
          success: true,
          message: 'Successfully retrieved owned boards.',
          boards: boardList,
        });
      }).catch(() => res.json({ success: false, message: 'Failed to retrieve owned boards.' }));
    } catch (err2) {
      return res.json({ success: false, message: 'Failed to retrieve owned boards.' });
    }
  })(req, res, next);
});

router.get('/member', (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err || !user) return res.json({ success: false, message: BAD_TOKEN_MESSAGE });
    try {
      if (user.is_admin) {
        return Board.findAll({
          where: { is_enabled: true },
        }).then((foundBoards) => {
          const boardList = [];

          foundBoards.forEach((board) => {
            boardList.push(board.toSimpleObject());
          });
          return res.json({
            success: true,
            message: 'Successfully retrieved all boards.',
            boards: boardList,
          });
        }).catch(() => res.json({ success: false, message: 'Failed to retrieve member boards.' }));
      }

      return user.getBoards({
        where: { is_enabled: true },
      }).then((foundBoards) => {
        const boardList = [];

        foundBoards.forEach((board) => {
          boardList.push(board.toSimpleObject());
        });
        return res.json({
          success: true,
          message: 'Successfully retrieved member boards.',
          boards: boardList,
        });
      }).catch(() => res.json({ success: false, message: 'Failed to retrieve member boards.' }));
    } catch (err2) {
      return res.json({ success: false, message: 'Failed to retrieve member boards.' });
    }
  })(req, res, next);
});

// GET /boardInfo/isMember endpoint
// Returns whether or not the requesting user is a member of the specified board
router.get('/isMember', (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err || !user) res.json({ success: false, message: BAD_TOKEN_MESSAGE });
    try {
      if (user.is_admin) {
        return Board.findOne({
          where: {
            board_url: req.body.board_id,
            is_enabled: true,
          },
        }).then(() => res.json({
          success: true,
          message: 'Membership found.',
          is_member: true,
        })).catch(() => res.json({ success: false, message: 'Failed to determine membership status.' }));
      }

      return user.getBoards({
        where: {
          board_url: req.body.board_id,
          is_enabled: true,
        },
      }).then((foundBoard) => {
        if (foundBoard.length >= 1) {
          return res.json({
            success: true,
            message: 'Membership found.',
            is_member: true,
          });
        }
        return res.json({
          success: true,
          message: 'Membership not found.',
          is_member: false,
        });
      }).catch(() => res.json({ success: false, message: 'Failed to determine membership status.' }));
    } catch (err2) {
      return res.json({ success: false, message: 'Failed to determine membership status.' });
    }
  })(req, res, next);
});

module.exports = router;
