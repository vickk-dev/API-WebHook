module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Servicos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      data_criacao: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      convenio_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Convenios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Servicos');
  }
};
