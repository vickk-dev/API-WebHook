module.exports = (Sequelize, DataTypes) => {

    const SoftwareHouse = Sequelize.define("SoftwareHouse", {

        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        data_criacao: {
            type: DataTypes.DATA,
            allownull: false,
            defaultValue: DataTypes.NOW
        },

        cnpj: {
            type: DataTypes.STRING(14),
            allowNull: false,
            unique: true,
            validate: {
                len: [14, 14],
                isNumeric: true
            }
        },

        token: {
            type: DataTypes.STRING,
            alloeNull: false
        },

        status: {
            type: Sequelize.ENUM("ativo", "inativo"),
            allowNull: false
        }

    }, {
        tableName: "SoftwareHouse",

        timestamp: false
    });

    SoftwareHouse.associate = (models) => {
    SoftwareHouse.hasMany(models.Cedente, { foreignKey: "softwarehouse_id" });
  };

    return SoftwareHouse;
}