const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Conta = sequelize.define(
    "Conta",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      data_criacao: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      produto: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      banco_codigo: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      cedente_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      configuracao_notificacao: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
    },
    {
      tableName: "Contas",
      timestamps: false,
    }
  );

  Conta.associate = (models) => {
    Conta.belongsTo(models.Cedente, {
      foreignKey: "cedente_id",
      as: "cedente",
    });

    Conta.hasMany(models.Convenio, {
      foreignKey: "conta_id",
      as: "convenios",
    });
  };

  return Conta;
};
