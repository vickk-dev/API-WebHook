const { Sequelize } = require('sequelize');
const config = require('../../../../src/config');

const sequelize = new Sequelize(config.db.url, {
  dialect: config.db.dialect || 'postgres',
  logging: false,
});

module.exports = sequelize;