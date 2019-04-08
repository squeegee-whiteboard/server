const Debug = require('debug');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = require('express').Router();
const models = require('../models');
const jwtSecret = require('../config/jwtConfig').secret;
const express = require('express');
const bcrypt = require('bcrypt');



const { User } = models;
const debug = Debug('server');

require('../config/passport')(passport);

//MOVE THIS TO A CONFIG FILE TOMORROW!
const BCRYPT_SALT_ROUNDS = 12;

router.post('/register', (req, res) => {
  if (!req.body.username || !req.body.password || !req.body.email) {
    res.json({success: false, msg: 'Please pass username, email, and password.'});
    //console.log(req.body);
  } else {
    User.findOne({
      where: {
        //$or: [{username: req.body.username}, {email: req.body.email}]
        email: req.body.email
      },
    }).then((foundUser) => {
      if (foundUser){
        return res.json({success: false, msg: 'Username or email already exists.'});
      }
      else{
        bcrypt.genSalt(BCRYPT_SALT_ROUNDS, function(err, salt){
          bcrypt.hash(req.body.password, salt, function(err, hashedPassword){
            User.create({username: req.body.username, email: req.body.email, password: hashedPassword, is_admin: false})
            .then((createdUser) => {res.status(200).send({
                success: true,
                message: 'User successfully created.'
              });
            });
          });
        });
      }
    });
  }
}); //End of traditional JS staircase of doom.

//Login function taken from https://medium.com/front-end-weekly/learn-using-jwt-with-passport-authentication-9761539c4314
router.post('/login', function (req, res, next) {
    passport.authenticate('local', {session: false}, (err, user, info) => {
      console.log(err);
      if (err || !user) {
          return res.status(400).json({
              message: info ? info.message : 'Login failed',
              user   : user
          });
      }

      req.login(user, {session: false}, (err) => {
          if (err) {
              res.send(err);
          }

          const token = jwt.sign({
            id: user.id,
            password: user.password,
          }, jwtSecret);

          return res.json({user, token});
      });
    })
    (req, res);
});


module.exports = router;