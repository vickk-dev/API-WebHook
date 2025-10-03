//Feito por Felipe

'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('Cedentes', {
            id: {
              type: Sequelize.INTEGER,
              primaryKey: true,
              autoIncrement: true,
              allowNull: false,
            },
            data_criacao: {
              type: Sequelize.DATE,
              allowNull: false,
              defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            cnpj: {
              type: Sequelize.STRING(14),
              allowNull: false,
              unique: true,
            },
            token: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            softwarehouse_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'SoftwareHouse',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT',
            },
            status: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            configuracao_noti: {
                type: Sequelize.JSON,
                allowNull: true,
                defaultValue: null
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            }
        });
await queryInterface.addIndex('Cedentes', ['cnpj'], {
            unique: true,
            name: 'cedentes_cnpj_unique'
        });

        await queryInterface.addIndex('Cedentes', ['softwarehouse_id'], {
            name: 'cedentes_softwarehouse_id_index'
        });

        await queryInterface.addIndex('Cedentes', ['status'], {
            name: 'cedentes_status_index'
        });
    },

    down: async (queryInterface, Sequelize) => {

        await queryInterface.removeIndex('Cedentes', 'cedentes_cnpj_unique');
        await queryInterface.removeIndex('Cedentes', 'cedentes_softwarehouse_id_index');
        await queryInterface.removeIndex('Cedentes', 'cedentes_cpj_unique');

        await queryInterface.dropTable('Cedentes');
    }
};