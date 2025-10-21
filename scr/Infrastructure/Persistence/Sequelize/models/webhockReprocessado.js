// Feito Por Gabriel
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class WebhookReprocessado extends Model {
    static associate(models) {
    
      WebhookReprocessado.belongsTo(models.Cedente, {
        foreignKey: 'cedente_id',
        as: 'cedente'
      });
    }
  }
  
  WebhookReprocessado.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    data: {
      type: DataTypes.JSONB, 
      allowNull: false
    },
    data_criacao: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    cedente_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Cedentes',
        key: 'id'
      }
    },
    kind: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    servico_id: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('servico_id');
        return rawValue ? JSON.parse(rawValue) : null;
      },
      set(value) {
        this.setDataValue('servico_id', JSON.stringify(value));
      }
    },
    protocolo: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'WebhookReprocessado',
    tableName: 'WebhookReprocessados',
    timestamps: false
  });

  return WebhookReprocessado;
};
