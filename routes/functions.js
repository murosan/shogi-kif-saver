'use strict';
const moment = require('moment-timezone');
const Collection = require('../models/collection');
const Kif = require('../models/kif');

// エラー出力
function throwError(e, n, next) {
  const err = new Error(e);
  err.status = n;
  return next(err);
}

// 自身の物か判定
function isMine(req, dataModel) {
  return dataModel && dataModel.userId === parseInt(req.user.id);
}

// 時間表示をフォーマット
function timeFormatter(t) {
  return (t.formattedCreatedDate = moment(t.createdDate)
    .tz('Asia/Tokyo')
    .format('YYYY.MM.DD HH:mm'));
}

// アルバム削除
function deleteCollection(collectionId, done) {
  Kif.findAll({
    where: { collectionId }
  }).then(kifs => {
    const promises = kifs.map(k => {
      return k.destroy();
    });
    Promise.all(promises).then(() => {
      Collection.findById(collectionId).then(c => {
        c.destroy();
      });
      done();
    });
  });
}

module.exports = {
  throwError,
  isMine,
  timeFormatter,
  deleteCollection
};
