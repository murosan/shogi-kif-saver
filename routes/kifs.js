'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const functions = require('./functions');
const uuid = require('uuid');
const User = require('../models/user');
const Collection = require('../models/collection');
const Kif = require('../models/kif');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

// ルート：　/collections/ ~
// 棋譜追加のページへ
router.get(
  '/:collectionId/kifs/newKIF',
  authenticationEnsurer,
  csrfProtection,
  (req, res, next) => {
    Collection.findOne({
      where: {
        collectionId: req.params.collectionId
      }
    }).then(collection => {
      res.render('newKIF', {
        user: req.user,
        collection: collection,
        csrfToken: req.csrfToken()
      });
    });
  }
);

// 棋譜 create
router.post(
  '/:collectionId/kifs',
  authenticationEnsurer,
  csrfProtection,
  (req, res, next) => {
    const kifId = uuid.v4();
    const createdDate = new Date();
    const collectionId = req.params.collectionId;
    Kif.create({
      kifId: kifId,
      kifDescription: req.body.kifDescription.slice(0, 255),
      createdDate: createdDate,
      kifdata: req.body.kifdata,
      comment: req.body.comment,
      userId: req.user.id,
      collectionId: collectionId
    }).then(kifs => {
      res.redirect('/collections/' + collectionId);
    });
  }
);

// kifviewer のページへ
router.get('/:collectionId/kifs/:kifId', authenticationEnsurer, (req, res, next) => {
  Kif.findOne({
    include: [
      {
        model: User,
        attributes: ['userId', 'username']
      }
    ],
    where: { kifId: req.params.kifId }
  }).then(kif => {
    if (kif && kif.collectionId === req.params.collectionId) {
      functions.timeFormatter(kif);
      res.render('kifviewer', {
        user: req.user,
        kif: kif
      });
    } else {
      functions.throwError('指定された棋譜はありません', 404, next);
    }
  });
});

// 棋譜の編集ページへ
router.get(
  '/:collectionId/kifs/:kifId/edit',
  authenticationEnsurer,
  csrfProtection,
  (req, res, next) => {
    Kif.findOne({
      where: { kifId: req.params.kifId }
    }).then(kif => {
      if (functions.isMine(req, kif)) {
        res.render('edit-kif', {
          user: req.user,
          kif: kif,
          csrfToken: req.csrfToken()
        });
      } else {
        functions.throwError('指定の棋譜がない、または編集権限がありません', 404, next);
      }
    });
  }
);

// edit で棋譜を編集・削除
router.post(
  '/:collectionId/kifs/:kifId',
  authenticationEnsurer,
  csrfProtection,
  (req, res, next) => {
    if (parseInt(req.query.edit) === 1) {
      Kif.findOne({
        where: { kifId: req.params.kifId }
      }).then(kif => {
        if (functions.isMine(req, kif)) {
          kif
            .update({
              kifId: kif.kifId,
              kifDescription: req.body.kifDescription.slice(0, 255),
              createdDate: kif.createdDate,
              kifdata: req.body.kifdata,
              comment: req.body.comment,
              userId: kif.userId,
              collectionId: kif.collectionId
            })
            .then(kif => {
              res.redirect(
                '/collections/' + req.params.collectionId + /kifs/ + req.params.kifId
              );
            });
        } else {
          functions.throwError('指定されたアルバムがない、または編集の権限がありません', 404, next);
        }
      });
    } else if (parseInt(req.query.delete) === 1) {
      Kif.findOne({
        where: { kifId: req.params.kifId }
      })
        .then(kif => {
          if (functions.isMine(req, kif)) {
            kif.destroy();
          } else {
            functions.throwError('指定された棋譜がない、または削除の権限がありません', 404, next);
          }
        })
        .then(() => {
          res.redirect('/collections/' + req.params.collectionId);
        });
    } else {
      functions.throwError('不正なアクセスです', 400, next);
    }
  }
);

module.exports = router;
