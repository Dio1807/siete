const { DataTypes } = require("sequelize");
const db = require("../db/connection");

const Ciudad = db.define('Ciudad', {
    id_ciudad: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
    },
    nombre: { 
        type: DataTypes.STRING(50), 
        allowNull: true 
    }
}, {
    timestamps: true,
    tableName: 'ciudades'
});

module.exports = Ciudad;