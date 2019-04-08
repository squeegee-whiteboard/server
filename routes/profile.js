const Debug = require('debug');
const Sequelize = require('sequelize');

var express = require('express');
var router = express.Router();

const models = require('../models');

const { User } = models;
const debug = Debug('server');

const Op = Sequelize.Op

const bcrypt = require('bcrypt');

//MOVE THIS TO A CONFIG FILE TOMORROW!
const BCRYPT_SALT_ROUNDS = 12;

router.patch('/', (req, res, next) => {
  if (req.body.username){
    User.findOne({
      where: {
        username: req.username,
        id: {[Op.ne]: req.user.id}
      },
    }).then((existingUser) => {
      if (existingUser){
        res.json({success: false, msg: 'Someone else is using that username!'});
      }
      else {
        User.findOne({
          where: {id: req.user.id}
        }).then((foundUser) =>{
          foundUser.update({
            username: req.body.username,
          })
          .then(() => {
            debug('Username updated');

            res.status(200).send({ success: true, message: 'Username updated' });
          });
        });
      }
    });
  }
  
  if (req.email){
    User.findOne({
      //Make sure another user isn't using this email, first.
      where: {
        email: req.body.email,
        id: {[Op.ne]: req.user.id}
      },
    }).then((existingUser) => {
      if (existingUser){
        res.json({success: false, msg: 'Someone else is using that email!'});
      }
      else {
        User.findOne({
          where: {id: req.user.id}
        }).then((foundUser) =>{
          foundUser.update({
            email: req.body.email,
          })
          .then(() => {
            debug('email updated');

            res.status(200).send({ success: true, message: 'Email updated' });
          });
        });
      }
    });
  }
  
  if (req.newPassword && req.oldPassword){
    User.findOne({
      where: {id: req.user.id}
    }).then((foundUser) =>{
      bcrypt.compare(req.body.oldPassword, foundUser.password, function(err, isMatch){
        if (err){
          debug(err);
          res.json({success: false, msg: 'There was an error updating the password.'});
        }
        else if (isMatch){
          bcrypt.genSalt(BCRYPT_SALT_ROUNDS, function(err, salt){
            bcrypt.hash(req.body.newPassword, salt, function(err, hashedPassword){
              foundUser.update({password: hashedPassword})
              .then(() => {res.status(200).send({
                  success: true,
                  message: 'Password successfully updated.'
                });
              });
            });
          });
        }
        else {
          res.json({success: false, msg: 'Wrong old password.'});
        }
      });
    });
  }
    
});

module.exports = router;
