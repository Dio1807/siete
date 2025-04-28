const {  DataTypes } = require("sequelize");
const db = require("../db/connection");

const Rol = db.define('Rol', {
    id_rol:{ type: DataTypes.INTEGER, primaryKey:true },
    nombre_rol:{ type: DataTypes.STRING, allowNull:false },
},{
    createdAt: false,
    updatedAt: false,
    tableName: 'roles'    
});

module.exports = Rol;