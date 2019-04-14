/*
Defines the REST API endpoints used for changing boards
See README for detailed documentation of each endpoint
*/
const express = require('express');
const passport = require('passport');
const models = require('../models');

const router = express.Router();
const { Board } = models;
const BAD_TOKEN_MESSAGE = 'Invalid auth token.';


// POST - /changeBoard/create
// Creates a new whiteboard
// See README for detailed documentation
router.post('/create', (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err || !user) return res.json({ success: false, message: BAD_TOKEN_MESSAGE });
    if (req.body.name) {
      try {
        return Board.create({
          board_name: req.body.name,
          is_enabled: true,
          owner_id: user.id,
        }).then(createdBoard => user.addBoard(createdBoard).then(() => res.json({
          success: true,
          message: 'Board created.',
          board_id: createdBoard.board_url,
        })).catch(() => res.json({ success: false, message: 'Failed to create board.' })));
      } catch (err2) {
        return res.json({ success: false, message: 'Failed to create board.' });
      }
    } else {
      return res.json({ success: false, message: 'No board name provided.' });
    }
  })(req, res, next);
});


// PATCH - /changeBoard/name
// Changes the name of a whiteboard
// See README for detailed documentation
router.patch('/name', (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err || !user) res.json({ success: false, message: BAD_TOKEN_MESSAGE });
    if (req.body.name && req.body.board_id) {
      try {
        if (user.is_admin) {
          return Board.findOne({ where: { board_url: req.body.board_id } })
            .then(foundBoard => foundBoard.update({ board_name: req.body.name })
              .then(() => res.json({ success: true, message: 'Board name updated.' }))
              .catch(() => res.json({ success: false, message: 'Failed to update name.' })))
            .catch(() => res.json({ success: false, message: 'Failed to update name.' }));
        }
        return user.getBoards({ where: { board_url: req.body.board_id } })
          .then((associatedBoards) => {
            if (associatedBoards.length > 0) {
              return associatedBoards[0].update({ board_name: req.body.name })
                .then(() => res.json({ success: true, message: 'Board name updated.' }))
                .catch(() => res.json({ success: false, message: 'Failed to update name.' }));
            }
            return res.json({ success: false, message: 'Failed to update name.' });
          }).catch(() => res.json({ success: false, message: 'Failed to update name.' }));
      } catch (err2) {
        return res.json({ success: false, message: 'Failed to update name.' });
      }
    } else {
      return res.json({ success: false, message: 'Board name and board_id must both be provided.' });
    }
  })(req, res, next);
});


// PUT - /changeBoard/addMember
// Adds a new user to the whiteboard
// See README for detailed documentation
router.put('/addMember', (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err || !user) return res.json({ success: false, message: BAD_TOKEN_MESSAGE });
    if (req.body.board_id) {
      try {
        return Board.findOne({
          where: {
            board_url: req.body.board_id,
            is_enabled: true,
          },
        }).then(foundBoard => user.addBoard(foundBoard)
          .then(() => res.json({ success: true, message: 'User added to board.' }))
          .catch(() => res.json({ success: false, message: 'Failed to add user to board.' })))
          .catch(() => res.json({ success: false, message: 'Failed to add user to board.' }));
      } catch (err2) {
        return res.json({ success: false, message: 'Failed to add user to board.' });
      }
    } else {
      return res.json({ success: false, message: 'No board_id provided.' });
    }
  })(req, res, next);
});


// POST - /changeBoard/delete
// Disabled (effectively deletes) a whiteboard
// See README for detailed documentation
router.post('/delete', (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err || !user) {
      return res.json({ success: false, message: BAD_TOKEN_MESSAGE });
    }
    if (req.body.board_id) {
      try {
        if (user.is_admin) {
          return Board.findOne({ where: { board_url: req.body.board_id } })
            .then(foundBoard => foundBoard.update({ is_enabled: false })
              .then(() => res.json({ success: true, message: 'Board disabled.' }))
              .catch(() => res.json({ success: false, message: 'Failed to disable board.' })))
            .catch(() => res.json({ success: false, message: 'Failed to disable board.' }));
        }
        return user.getBoards({ where: { board_url: req.body.board_id } })
          .then((associatedBoards) => {
            if (associatedBoards.length > 0) {
              return associatedBoards[0].update({ is_enabled: false })
                .then(() => res.json({ success: true, message: 'Board disabled.' }))
                .catch(() => res.json({ success: false, message: 'Failed to disable board.' }));
            }
            return res.json({ success: false, message: 'Failed to disable board.' });
          }).catch(() => res.json({ success: false, message: 'Failed to disable board.' }));
      } catch (err2) {
        return res.json({ success: false, message: 'Failed to disable board.' });
      }
    } else {
      return res.json({ success: false, message: 'No board_id provided.' });
    }
  })(req, res, next);
});

module.exports = router;
