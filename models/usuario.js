const {  DataTypes } = require("sequelize");
const db = require("../db/connection");
const Rol = require("./rol");

const Usuario = db.define('Usuario', {
    id_usuario:{ type: DataTypes.INTEGER, primaryKey:true, autoIncrement: true },
    nombre:{ type: DataTypes.STRING, allowNull:false },
    cedula:{ type: DataTypes.STRING, allowNull:false },
    correo:{ type: DataTypes.STRING, allowNull:false },
    contra:{ type: DataTypes.STRING, allowNull:false },
    id_rol:{ type: DataTypes.INTEGER, allowNull:false },
    estado:{ type: DataTypes.BOOLEAN, allowNull:false, defaultValue:true },
    telefono:{ type: DataTypes.STRING, allowNull:false }
},{
    timestamps: true,
    tableName: 'usuarios'    
});

Usuario.belongsTo(Rol, {
    foreignKey: 'id_rol'
});    

module.exports = Usuario;
