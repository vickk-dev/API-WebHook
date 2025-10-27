const { Sequelize } = require('sequelize');
const sequelize = require('../database');

// Importar todos os modelos
const SoftwareHouse = require('./SoftwareHouse')(sequelize, Sequelize.DataTypes);
const Cedente = require('./Cedente')(sequelize, Sequelize.DataTypes);
const Conta = require('./Conta')(sequelize, Sequelize.DataTypes);
const Convenio = require('./convenio')(sequelize, Sequelize.DataTypes);
const Servico = require('./servico')(sequelize, Sequelize.DataTypes);
const WebhookReprocessado = require('./webhockReprocessado')(sequelize, Sequelize.DataTypes);

// Criar objeto com todos os modelos
const models = {
  SoftwareHouse,
  Cedente,
  Conta,
  Convenio,
  Servico,
  WebhookReprocessado,
  sequelize,
  Sequelize
};

// Configurar associações
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

module.exports = models;
