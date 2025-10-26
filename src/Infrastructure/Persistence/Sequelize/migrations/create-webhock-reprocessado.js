module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('WebhookReprocessados', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      data: {
        type: Sequelize.JSONB, // Use JSONB for PostgreSQL, change to JSON for MySQL
        allowNull: false
      },
      data_criacao: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      cedente_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Cedentes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      kind: {
        type: Sequelize.STRING,
        allowNull: false
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      servico_id: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      protocolo: {
        type: Sequelize.STRING,
        allowNull: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('WebhookReprocessados');
  }
};
