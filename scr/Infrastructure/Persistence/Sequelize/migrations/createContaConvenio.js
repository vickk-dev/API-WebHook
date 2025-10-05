module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Conta", {
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
          model: "Cedente",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      configuracao_notificacao: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
    });

    await queryInterface.createTable("Convenio", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      numero_convenio: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      data_criacao: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("NOW()"),
      },

      conta_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Conta",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Convenio");
    await queryInterface.dropTable("Conta");
  },
};
