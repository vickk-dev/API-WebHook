"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Contas", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      data_criacao: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("NOW()"),
      },
      produto: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      banco_codigo: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      cedente_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Cedentes",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      status: {
        type: Sequelize.ENUM("ativo", "inativo", "suspenso"),
        allowNull: false,
        defaultValue: "ativo",
      },
      configuracao_notificacao: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    
    await queryInterface.dropTable("Contas");
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Contas_status";');
  },
};
