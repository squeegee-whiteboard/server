/*
Defines the REST API endpoints used for getting board information
See README for detailed documentation of each endpoint
*/
const express = require('express');
const passport = require('passport');
const models = require('../models');

const router = express.Router();
const { Board } = models;
const BAD_TOKEN_MESSAGE = 'Invalid auth token.';


// GET - /boardInfo/owned
// Gets the list of boards owned by the user
// See README for detailed documentation
router.get('/owned', (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err || !user) return res.json({ success: false, message: BAD_TOKEN_MESSAGE });
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
  })(req, res, next);
});


// GET - /boardInfo/member
// Gets the list of boards the user is a member of
// See README for detailed documentation
router.get('/member', (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err || !user) return res.json({ success: false, message: BAD_TOKEN_MESSAGE });
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
  })(req, res, next);
});


// GET - /boardInfo/isMember
// Returns whether or not the requesting user is a member of the specified board
// See README for detailed documentation
router.get('/isMember', (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err || !user) return res.json({ success: false, message: BAD_TOKEN_MESSAGE });
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
  })(req, res, next);
});

module.exports = router;
