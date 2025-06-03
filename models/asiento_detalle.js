const { DataTypes } = require("sequelize");
const db = require("../db/connection");
const Cuenta = require("./cuenta");

const DetalleAsiento = db.define('DetalleAsiento', {
    id_detalle: { 
        type: DataTypes.INTEGER.UNSIGNED, 
        primaryKey: true, 
        autoIncrement: true 
    },
    id_asiento: { 
        type: DataTypes.INTEGER.UNSIGNED, 
        allowNull: false 
    },
    id_cuenta: { 
        type: DataTypes.INTEGER, 
        allowNull: false 
    },
    monto: { 
        type: DataTypes.DECIMAL(15, 2), 
        allowNull: false 
    },
    tipo_movimiento: { 
        type: DataTypes.ENUM('D', 'C'), 
        allowNull: false 
    },
    descripcion: { 
        type: DataTypes.STRING(100), 
        allowNull: true 
    }
}, {
    timestamps: false,
    tableName: 'detalle_asiento'
});

// Relaciones
DetalleAsiento.belongsTo(Cuenta, { foreignKey: 'id_cuenta' });
Cuenta.hasMany(DetalleAsiento, { foreignKey: 'id_cuenta' });

module.exports = DetalleAsiento;