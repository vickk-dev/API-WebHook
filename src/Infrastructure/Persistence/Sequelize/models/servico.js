// Feito Por Gabriel
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Servico extends Model {
    static associate(models) {
     
      Servico.belongsTo(models.Convenio, {
        foreignKey: 'convenio_id',
        as: 'convenio'
      });
    }
  }
  
  Servico.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    data_criacao: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    convenio_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Convenios',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Servico',
    tableName: 'Servicos',
    timestamps: false
  });

  return Servico;
};
