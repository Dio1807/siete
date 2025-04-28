const { DataTypes } = require("sequelize");
const db = require("../db/connection");
const Periodo = require("./periodo"); // Asegurate que exista este modelo

const Empresa = db.define('Empresa', {
    id_empresa: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING, allowNull: false },
    ruc: { type: DataTypes.STRING, allowNull: false, unique: true },
    direccion: { type: DataTypes.STRING, allowNull: true },
    telefono: { type: DataTypes.STRING, allowNull: true },
    id_periodo: { type: DataTypes.INTEGER, allowNull: false },
    estado: { type: DataTypes.BOOLEAN, allowNull: false }
}, {
    timestamps: false,
    tableName: 'empresas'
});

Empresa.belongsTo(Periodo, {
    foreignKey: 'id_periodo'
});

module.exports = Empresa;
