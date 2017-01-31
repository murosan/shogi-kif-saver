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
// アルバム作成のページへ
router.get('/newC', authenticationEnsurer, csrfProtection, (req, res, next) => {
  res.render('newC', { user: req.user, csrfToken: req.csrfToken() });
});

// アルバムcreate
router.post('/', authenticationEnsurer, csrfProtection, (req, res, next) => {
  const collectionId = uuid.v4();
  Collection.create({
    collectionId: collectionId,
    userId: req.user.id,
    collectionName: req.body.collectionName.slice(0, 255)
  }).then((collection) => {
    res.redirect('/collections/' + collectionId);
  });
});

// アルバムのページへ
router.get('/:collectionId', authenticationEnsurer, (req, res, next) => {
  let storedCollection = null;
  Collection.findOne({
    include: [
      {
        model: User,
        attributes: ['userId', 'username']
      }],
    where: {
      collectionId: req.params.collectionId
    }
  }).then((collection) => {
    if (collection) {
      storedCollection = collection;
      return Kif.findAll({ // 棋譜を抽出
        where: { collectionId: collection.collectionId },
        order: '"createdDate" DESC'
      });
    } else {
      functions.throwError('指定されたアルバムはありません', 404, next);
    }
  }).then((extractedkif) => {
    extractedkif.forEach((kif) => {
      functions.timeFormatter(kif);
    });
    res.render('collection', {
      user: req.user,
      collection: storedCollection,
      kifs: extractedkif,
      users: [req.user]
    });
  });
});

// アルバム編集ページへ
router.get('/:collectionId/edit', authenticationEnsurer, csrfProtection, (req, res, next) => {
  Collection.findOne({
    include: [{
      model: User,
      attributes: ['userId', 'username']
    }],
    where: {
      collectionId: req.params.collectionId
    }
  }).then((collection) => {
    if (functions.isMine(req, collection)) { // 作成者自身かどうか
      Kif.findAll({
        where: { collectionId: collection.collectionId },
        order: '"createdDate" ASC'
      }).then((extractedkif) => {
        extractedkif.forEach((kif) => {
          functions.timeFormatter(kif);
        });
        res.render('edit-col', {
          user: req.user,
          collection: collection,
          kifs: extractedkif,
          csrfToken: req.csrfToken()
        });
      });
    } else {
      functions.throwError('指定のアルバムがない、または編集権限がありません', 404, next);
    }
  });
});

// editでアルバム名を編集・削除
router.post('/:collectionId/', authenticationEnsurer, csrfProtection, (req, res, next) => {
  if (parseInt(req.query.edit) === 1) {
    Collection.findOne({
      where: {
        collectionId: req.params.collectionId
      }
    }).then((collection) => {
      if (functions.isMine(req, collection)) { // 作成者自身かどうか
        collection.update({
          collectionId: collection.collectionId,
          userId: req.user.id,
          collectionName: req.body.collectionName.slice(0, 255)
        }).then((updatedCollection) => {
          res.redirect('/collections/' + updatedCollection.collectionId);
        });
      } else {
        functions.throwError('指定されたアルバムがない、または編集の権限がありません', 404, next);
      }
    });
  } else if (parseInt(req.query.delete) === 1) {
    functions.deleteCollection(req.params.collectionId, () => {
      res.redirect('/');
    });
  } else {
    functions.throwError('不正なリクエストです', 400, next);
  }
});

module.exports = router;