const { DataTypes } = require("sequelize");
const db = require("../db/connection");
const Ciudad = require("./ciudad");
const Empresa = require("./empresa");

const Proveedor = db.define('Proveedor', {
    id_proveedor: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
    },
    razon_social: { 
        type: DataTypes.STRING(100), 
        allowNull: false 
    },
    numero_identificacion: { 
        type: DataTypes.STRING(20), 
        allowNull: false 
    },
    direccion: { 
        type: DataTypes.STRING(150), 
        allowNull: true 
    },
    telefono: { 
        type: DataTypes.STRING(20), 
        allowNull: true 
    },
    correo: { 
        type: DataTypes.STRING(100), 
        allowNull: true 
    },
    estado: { 
        type: DataTypes.BOOLEAN, 
        allowNull: false,
        defaultValue: true
    },
    id_ciudad: { 
        type: DataTypes.INTEGER, 
        allowNull: false 
    },
    id_empresa: { 
        type: DataTypes.INTEGER, 
        allowNull: false 
    }
}, {
    timestamps: true,
    tableName: 'proveedores'
});

// Relaciones
Proveedor.belongsTo(Ciudad, {
    foreignKey: 'id_ciudad'
});

Proveedor.belongsTo(Empresa, {
    foreignKey: 'id_empresa'
});

module.exports = Proveedor;