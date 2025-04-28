const {  DataTypes } = require("sequelize");
const db = require("../db/connection");

const Periodo = db.define('Periodo', {
    id_periodo:{ type: DataTypes.INTEGER, primaryKey:true },
    nombre_periodo:{ type: DataTypes.STRING, allowNull:false },
},{
    createdAt: false,
    updatedAt: false,
    tableName: 'periodos'    
});

module.exports = Periodo;