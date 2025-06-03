const { DataTypes } = require("sequelize");
const db = require("../db/connection");

const Cuenta = db.define('Cuenta', {
    id_cuenta: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
    },
    nombre: { 
        type: DataTypes.STRING(50), 
        allowNull: false 
    },
    nombre_alternativo: { 
        type: DataTypes.STRING(50),
        allowNull: true 
    },
    codigo: { 
        type: DataTypes.INTEGER, 
        allowNull: false 
    },
    asentable: { 
        type: DataTypes.ENUM('Si', 'No'), 
        allowNull: false 
    },
    moneda: { 
        type: DataTypes.STRING(20), 
        allowNull: true 
    },
    rubro: { 
        type: DataTypes.STRING(50), 
        allowNull: true 
    },
    descripcion: { 
        type: DataTypes.STRING(100), 
        allowNull: true 
    },
    id_padre: { 
        type: DataTypes.INTEGER, 
        allowNull: true 
    }
}, {
    timestamps: false,
    tableName: 'cuentas'
});

// Relación reflexiva (self-referencing)
Cuenta.belongsTo(Cuenta, { 
    foreignKey: 'id_padre', 
    as: 'cuentaPadre' 
});

Cuenta.hasMany(Cuenta, { 
    foreignKey: 'id_padre', 
    as: 'cuentasHijas' 
});

module.exports = Cuenta;