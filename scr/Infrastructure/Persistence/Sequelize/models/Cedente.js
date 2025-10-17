//Feito por Felipe

const {DataTypes} = require('sequelize');
const sequelize = require('../config/database');

const Cedente = sequelize.define('Cedente', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    data_criacao: {
        type: DataTypes.DAte,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    cnpj: {
        type: DataTypes.STRING(14),
        allowNull: false,
        unique: true,
        validate: {
            len: [14, 14],
            isNumeric: true,
        }
    },
    token: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    softwarehouse_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'SoftwareHouse',
      key: 'id'
        }
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [['ativo', 'inativo']],
        }
    },
    configuracao_noti: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: null
    }
}, {
    tableName: 'Cedentes',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['cnpj']
        },
        {
            fields: ['softwarehouse_id']
        },
        {
            fields: ['status']
        }
    ]
});

Cedente.associate = (models) => {
    Cedente.belongsTo(models.SoftwareHouse, 
        {
        foreignKey: 'softwarehouse_id',
         as: 'SoftwareHouse',
        });

    Cedente.hasMany(models.Conta,{
        foreignKey: 'cedente_id',
        as: 'contas'
    });
};
module.exports = Cedente;