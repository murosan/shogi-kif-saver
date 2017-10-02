'use strict';
const request = require('supertest');
const app = require('../app');
const passportStub = require('passport-stub');
const User = require('../models/user');
const Collection = require('../models/collection');
const Kif = require('../models/kif');
const deleteCollection = require('../routes/functions').deleteCollection;
const assert = require('assert');

describe('/login', () => {
  before(() => {
    passportStub.install(app);
    passportStub.login({ username: 'testuser' });
  });

  after(() => {
    passportStub.logout();
    passportStub.uninstall(app);
  });

  it('ログインのためのリンクが含まれる', done => {
    request(app)
      .get('/login')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(/<a href="\/auth\/github"/)
      .expect(200, done);
  });

  it('ログイン時はユーザー名が表示される', done => {
    request(app)
      .get('/login')
      .expect(/testuser/)
      .expect(200, done);
  });
});

describe('/logout', () => {
  it('/ にリダイレクトされる', done => {
    request(app)
      .get('/logout')
      .expect('Location', '/')
      .expect(302, done);
  });
});

describe('/collections', () => {
  before(() => {
    passportStub.install(app);
    passportStub.login({ id: 0, username: 'testuser' });
  });

  after(() => {
    passportStub.logout();
    passportStub.uninstall(app);
  });

  it('アルバムの作成・表示ができる', done => {
    User.upsert({ userId: 0, username: 'testuser' }).then(() => {
      request(app)
        .post('/collections')
        .send({ collectionName: 'テストアルバム1' })
        .expect('Location', `/collections/${collectionId}`)
        .expect(302)
        .end((err, res) => {
          const createdCollectionPath = res.headers.location;
          request(app)
            .get(createdCollectionPath)
            .expect(/テストアルバム1/)
            .expect(200)
            .end(() => {
              deleteCollection(createdCollectionPath.split('/collections/')[1], done);
            });
        });
    });
  });
});

describe('/collecions/:collectionId', () => {
  before(() => {
    passportStub.install(app);
    passportStub.login({ id: 0, username: 'testuser' });
  });

  after(() => {
    passportStub.logout();
    passportStub.uninstall(app);
  });

  it('アルバムのタイトルが変更できる', done => {
    User.upsert({ userId: 0, username: 'testuser' }).then(() => {
      request(app)
        .post('/collections')
        .send({ collectionName: 'テストアルバム1' })
        .end((err, res) => {
          const createdCollectionPath = res.headers.location;
          const collectionId = createdCollectionPath.split('/collections/')[1];
          //タイトル変更
          request(app)
            .post(`/collections/${collectionId}?edit=1`)
            .send({ collectionName: 'テストアルバム2' })
            .end(() => {
              Collection.findById(collectionId).then(c => {
                assert.equal(c.collectionName, 'テストアルバム2');
                deleteCollection(collectionId, done);
              });
            });
        });
    });
  });
});

describe('/collections/:collectionId/kifs/', () => {
  before(() => {
    passportStub.install(app);
    passportStub.login({ id: 0, username: 'testuser' });
  });

  after(() => {
    passportStub.logout();
    passportStub.uninstall(app);
  });

  it('棋譜の保存ができ、表示できる', done => {
    User.upsert({ userId: 0, username: 'testuser' }).then(() => {
      request(app)
        .post('/collections')
        .send({ collectionName: 'テストアルバム1' })
        .end((err, res) => {
          const createdCollectionPath = res.headers.location;
          const collectionId = createdCollectionPath.split('/collections/')[1];
          //棋譜保存
          request(app)
            .post(`/collections/${collectionId}/kifs/`)
            .send({
              kifDescription: 'テスト棋譜タイトル1',
              kifdata: 'テスト棋譜1',
              kifComment: 'テスト棋譜コメント1'
            })
            .expect('Location', `/collections/${collectionId}/kifs/${kifId}`)
            .expect(302)
            .end((err, res) => {
              deleteCollection(collectionId, done);
            });
        });
    });
  });
});

describe('/collections/:collectionId/kifs/:kifId', () => {
  before(() => {
    passportStub.install(app);
    passportStub.login({ id: 0, username: 'testuser' });
  });

  after(() => {
    passportStub.logout();
    passportStub.uninstall(app);
  });

  it('棋譜の更新ができる', done => {
    User.upsert({ userId: 0, username: 'testuser' }).then(() => {
      request(app)
        .post('/collections')
        .send({ collectionName: 'テストアルバム1' })
        .end((err, res) => {
          const createdCollectionPath = res.headers.location;
          const collectionId = createdCollectionPath.split('/collections/')[1];
          //棋譜保存
          request(app)
            .post(`/collections/${collectionId}/kifs/`)
            .send({
              kifDescription: 'テスト棋譜タイトル1',
              kifdata: 'テスト棋譜1',
              kifComment: 'テスト棋譜コメント1'
            })
            .end((err, res) => {
              const createdKifPath = res.headers.location;
              const kifId = createdCollectionPath.split('/kifs/')[1];
              //棋譜更新
              request(app)
                .post(`collections/${collectionId}/kifs/${kifId}?edit=1`)
                .send({
                  kifDescription: 'テスト棋譜タイトル2',
                  kifdata: 'テスト棋譜2',
                  kifComment: 'テスト棋譜コメント2'
                })
                .end(() => {
                  Kif.findById(kifId).then(k => {
                    assert.equal(k.kifDescription, 'テスト棋譜タイトル2');
                    assert.equal(kifdata, 'テスト棋譜2');
                    assert.equal(kifComment, 'テスト棋譜コメント2');
                    deleteCollection(collectionId, done);
                  });
                });
            });
        });
    });
  });
});

describe('/collections/:collectionId/kifs/:kifId', () => {
  before(() => {
    passportStub.install(app);
    passportStub.login({ id: 0, username: 'testuser' });
  });

  after(() => {
    passportStub.logout();
    passportStub.uninstall(app);
  });

  it('アルバム及びその中の棋譜が削除できる', done => {
    User.upsert({ userId: 0, username: 'testuser' }).then(() => {
      request(app)
        .post('/collections')
        .send({ collectionName: 'テストアルバム1' })
        .end((err, res) => {
          const createdCollectionPath = res.headers.location;
          const collectionId = createdCollectionPath.split('/collections/')[1];

          // 棋譜保存
          const promiseKif = Collection.findOne({
            where: { collectionId: collectionId }
          }).then(collection => {
            return Promise(resolve => {
              request(app)
                .post(`/collections/${collectionId}/kifs/`)
                .send({
                  kifDescription: 'テスト棋譜タイトル1',
                  kifdata: 'テスト棋譜1',
                  kifComment: 'テスト棋譜コメント1'
                })
                .end(() => {
                  resolve();
                });
            });
          });

          // 削除
          const promiseDeleted = Promise.all([promiseKif]).then(() => {
            return new Promise(resolve => {
              request(app)
                .post(`/collections/${collectionId}?delete=1`)
                .end(() => {
                  resolve();
                });
            });
          });

          // テスト
          promiseDeleted.then(() => {
            const p1 = Kif.findAll({
              where: { collectionId: collectionId }
            }).then(kifs => {
              kifs.assert.equal(kifs.length, 0);
            });
            const p2 = Collection.findOne({
              where: { collectionId: collectionId }
            }).then(collection => {
              collection.assert.equal(collection.length, 0);
            });
            Promise.all([p1, p2]).then(() => {
              done();
            });
          });
        });
    });
  });
});
