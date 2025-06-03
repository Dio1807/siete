const { DataTypes } = require("sequelize");
const db = require("../db/connection");
const Empresa = require("./empresa");

const AsientoCabecera = db.define('AsientoCabecera', {
    id_asiento: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
    },
    id_empresa: { 
        type: DataTypes.INTEGER, 
        allowNull: false 
    },
    id_sucursal: { 
        type: DataTypes.INTEGER, 
        allowNull: false 
    },
    id_tipo_asiento: { 
        type: DataTypes.ENUM('Manual', 'Compra', 'Venta', 'Ajuste'), 
        allowNull: false 
    },
    numero_asiento: { 
        type: DataTypes.STRING(20), 
        allowNull: false 
    },
    fecha: { 
        type: DataTypes.DATEONLY, 
        allowNull: false 
    },
    documento: { 
        type: DataTypes.STRING(50), 
        allowNull: true 
    },
    total_debe: { 
        type: DataTypes.DECIMAL(15, 2), 
        allowNull: false, 
        defaultValue: 0.00 
    },
    total_haber: { 
        type: DataTypes.DECIMAL(15, 2), 
        allowNull: false, 
        defaultValue: 0.00 
    },
    diferencia: { 
        type: DataTypes.VIRTUAL,
        get() {
            return parseFloat(this.total_debe || 0) - parseFloat(this.total_haber || 0);
        }
    },
    estado: { 
        type: DataTypes.ENUM('pendiente', 'procesado'), 
        allowNull: false, 
        defaultValue: 'pendiente' 
    }
}, {
    timestamps: true,
    tableName: 'asiento_cabecera',
    indexes: [
        {
            unique: true,
            fields: ['id_empresa', 'numero_asiento'],
            name: 'uq_asiento_empresa_numero'
        }
    ]
});

// Relaciones
AsientoCabecera.belongsTo(Empresa, {
    foreignKey: 'id_empresa',
    as: 'empresa'
});

module.exports = AsientoCabecera;