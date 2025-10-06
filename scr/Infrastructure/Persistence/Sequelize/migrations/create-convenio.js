"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Convenios", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      numero_convenio: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      data_criacao: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      conta_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Contas",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Convenios");
  },
};
