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
      Board.findAll({ 
          where: { 
            owner_id: user.id,
            is_enabled: true,
          } 
        }).then((foundBoards) => {
        let boardList = [];

        foundBoards.forEach((board) => {
          boardList.push(board.toSimpleObject());
        });
        return res.json({
          success: true,
          message: 'Successfully retrieved owned boards.',
          boards: boardList,
        });
      });
    } catch (err2) {
      return res.json({ success: false, message: 'Failed to retrieve owned boards.' });
    }
  })(req, res, next);
});

router.get('/member', (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err || !user) return res.json({ success: false, message: BAD_TOKEN_MESSAGE });
    try {
      if(user.is_admin) {
        Board.findAll().then((foundBoards) => {
          let boardList = [];

          foundBoards.forEach((board) => {
            boardList.push(board.toSimpleObject());
          });
          return res.json({
            success: true,
            message: 'Successfully retrieved all boards.',
            boards: boardList,
          });
        });
      }
    
      User.findOne({
        where: { id: user.id },
      }).then((foundUser) => {
        foundUser.getBoards({
          where: { is_enabled: true },
        }).then((foundBoards) => {
          let boardList = [];

          foundBoards.forEach((board) => {
            boardList.push(board.toSimpleObject());
          });
          return res.json({
            success: true,
            message: 'Successfully retrieved member boards.',
            boards: boardList,
          });
        });
      });
    } catch (err2) {
      return res.json({ success: false, message: 'Failed to retrieve member boards.' });
    }
  })(req, res, next);
});

module.exports = router;
