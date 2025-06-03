const { DataTypes } = require("sequelize");
const db = require("../db/connection");
const AsientoCabecera = require("./asiento_cabecera");
const Cuenta = require("./cuenta");

const AsientoDetalle = db.define('AsientoDetalle', {
    id_detalle: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
    },
    id_asiento: { 
        type: DataTypes.INTEGER, 
        allowNull: false 
    },
    id_cuenta: { 
        type: DataTypes.INTEGER, 
        allowNull: false 
    },
    debe: { 
        type: DataTypes.DECIMAL(15, 2), 
        allowNull: false, 
        defaultValue: 0.00 
    },
    haber: { 
        type: DataTypes.DECIMAL(15, 2), 
        allowNull: false, 
        defaultValue: 0.00 
    },
    concepto: { 
        type: DataTypes.STRING(100), 
        allowNull: true 
    }
}, {
    timestamps: true,
    tableName: 'asiento_detalle'
});

// Relaciones
AsientoDetalle.belongsTo(AsientoCabecera, {
    foreignKey: 'id_asiento',
    as: 'asientoCabecera',
    onDelete: 'CASCADE'
});

AsientoDetalle.belongsTo(Cuenta, {
    foreignKey: 'id_cuenta',
    as: 'cuenta'
});

// Relaciones inversas
AsientoCabecera.hasMany(AsientoDetalle, {
    foreignKey: 'id_asiento',
    as: 'asientoDetalles'
});

Cuenta.hasMany(AsientoDetalle, {
    foreignKey: 'id_cuenta',
    as: 'asientoDetalles'
});

module.exports = AsientoDetalle;