'use strict';
const loader = require('./sequelize-loader');
const Sequelize = loader.Sequelize;

const Collection = loader.database.define('collections', {
  collectionId: {
    type: Sequelize.UUID,
    primaryKey: true,
    allowNull: false
  },
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  collectionName: {
    type: Sequelize.TEXT,
    allowNull: false
  }
}, {
    freezeTableName: true,
    timestamps: false,
  });

module.exports = Collection;