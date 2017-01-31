'use strict';
const loader = require('./sequelize-loader');
const Sequelize = loader.Sequelize;

const Kif = loader.database.define('kifdata', {
  kifId: {
    type: Sequelize.UUID,
    primaryKey: true,
    allowNull: false
  },
  kifDescription: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  createdDate: {
    type: Sequelize.DATE,
    allowNull: false
  },
  kifdata: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  comment: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  collectionId: {
    type: Sequelize.UUID,
    allowNull: false
  }
}, {
    freezeTableName: true,
    timestamps: false,
    indexes: [
      {
        fields: ['collectionId']
      }
    ]
  });

module.exports = Kif;