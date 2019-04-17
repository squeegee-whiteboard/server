/*
Defines the REST API endpoints used for authentication
See README for detailed documentation of each endpoint
*/
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = require('express').Router();
const bcrypt = require('bcrypt');
const models = require('../models');
const jwtSecret = require('../config/jwtConfig');

const { User } = models;
require('../config/passport')(passport);
const { saltRounds } = require('../config/bcryptConfig');


// POST - /auth/register
// Registers the user
// See README for detailed documentation
router.post('/register', (req, res) => {
  if (!req.body.username || !req.body.password || !req.body.email) {
    return res.json({ success: false, message: 'Please pass username, email, and password.' });
  }
  return User.findOne({
    where: {
      email: req.body.email,
    },
  }).then((foundUser) => {
    if (foundUser) {
      return res.json({ success: false, message: 'Email already exists.' });
    }

    return bcrypt.genSalt(saltRounds, (err, salt) => {
      bcrypt.hash(req.body.password, salt, (err2, hashedPassword) => User.create({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword,
        is_admin: false,
      }).then((createdUser) => {
        const token = jwt.sign({
          id: createdUser.id,
          password: createdUser.password,
        }, jwtSecret.secret);
        return res.json({
          success: true,
          token: `JWT ${token}`,
          message: 'User successfully created.',
        });
      }).catch(() => res.json({ success: false, message: 'Email invalid.' })));
    });
  });
});


// POST - /auth/login
// logs the user in
// See README for detailed documentation
// Login function taken from https://medium.com/front-end-weekly/learn-using-jwt-with-passport-authentication-9761539c4314
router.post('/login', (req, res) => {
  passport.authenticate('local', { session: false }, (err, user) => {
    if (err || !user) {
      return res.json({
        success: false,
        message: 'Incorrect email or password.',
      });
    }

    return req.login(user, { session: false }, (err2) => {
      if (err2) {
        res.send(err2);
      }
      const token = jwt.sign({
        id: user.id,
        password: user.password,
      }, jwtSecret.secret);

      res.json({
        success: true,
        token: `JWT ${token}`,
        message: 'User logged in.',
      });
    });
  })(req, res);
});


module.exports = router;
