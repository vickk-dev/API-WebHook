module.exports = (sequelize, DataTypes) => {

    const SoftwareHouse = sequelize.define("SoftwareHouse", {

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
            allowNull: false
        },

        status: {
            type: DataTypes.ENUM("ativo", "inativo"),
            allowNull: false
        }

    }, {
        tableName: "softwarehouse",   // tava SoftwareHouse
        timestamps: true             // tava false
    });

    SoftwareHouse.associate = (models) => {
        SoftwareHouse.hasMany(models.Cedente, { foreignKey: "softwarehouse_id" });
    };

    return SoftwareHouse;
}