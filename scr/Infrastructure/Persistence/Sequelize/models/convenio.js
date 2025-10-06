/// Feito por Gabriel

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Convenio extends Model {
    static associate(models) {
      Convenio.belongsTo(models.Conta, {
        foreignKey: "conta_id",
        as: "conta",
      });

      Convenio.hasMany(models.Servico, {
        foreignKey: "convenio_id",
        as: "servicos",
      });
    }
  }

  Convenio.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      numero_convenio: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      data_criacao: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      conta_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Convenio",
      tableName: "Convenios",
      timestamps: false,
    }
  );

  return Convenio;
};

