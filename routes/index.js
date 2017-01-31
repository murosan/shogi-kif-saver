'use strict';
const express = require('express');
const router = express.Router();
const Collection = require('../models/collection');
const User = require('../models/user');

/* GET home page. */
router.get('/', (req, res, next) => {
  const title = '将棋の棋譜保存サイト';
  if (req.user) {
    Collection.findAll({
      include: [
        {
          model: User,
          attributes: ['userId', 'username']
        }],
      where: {
        userId: req.user.id
      },
      order: '"username" ASC'
    }).then((collections) => {
      res.render('index', {
        title: title,
        user: req.user,
        collections: collections,
        users: [req.user]
      });
    });
  } else {
    res.render('index', { title: title, user: req.user });
  }
});

module.exports = router;