const AsientoCabecera = require("../models/asiento_cabecera");
const AsientoDetalle = require("../models/asiento_detalle");
const Empresa = require("../models/empresa");
const Cuenta = require("../models/cuenta");
const { Op } = require('sequelize');
const db = require('../db/connection');

// Obtener todos los asientos con paginación
const getAsientos = async (req, res) => {
    let { desde, limite, id_empresa, estado, fecha_desde, fecha_hasta } = req.query;

    try {
        limite = parseInt(limite) || 10;
        desde = parseInt(desde) || 0;
        
        // Construir filtros
        const whereClause = {};
        if (id_empresa) whereClause.id_empresa = id_empresa;
        if (estado) whereClause.estado = estado;
        if (fecha_desde && fecha_hasta) {
            whereClause.fecha = {
                [Op.between]: [fecha_desde, fecha_hasta]
            };
        }

        let asientos, total;

        if (desde >= 0 && limite > 0) {
            [total, asientos] = await Promise.all([
                AsientoCabecera.count({ where: whereClause }),
                AsientoCabecera.findAll({
                    where: whereClause,
                    offset: desde,
                    limit: limite,
                    include: [
                        {
                            model: Empresa,
                            as: 'empresa',
                            attributes: ['nombre']
                        },
                        {
                            model: AsientoDetalle,
                            as: 'asientoDetalles',
                            include: [
                                {
                                    model: Cuenta,
                                    as: 'cuenta',
                                    attributes: ['nombre', 'codigo']
                                }
                            ]
                        }
                    ],
                    order: [['fecha', 'DESC'], ['numero_asiento', 'DESC']]
                })
            ]);
        } else {
            [total, asientos] = await Promise.all([
                AsientoCabecera.count({ where: whereClause }),
                AsientoCabecera.findAll({
                    where: whereClause,
                    include: [
                        {
                            model: Empresa,
                            as: 'empresa',
                            attributes: ['nombre']
                        },
                        {
                            model: AsientoDetalle,
                            as: 'asientoDetalles',
                            include: [
                                {
                                    model: Cuenta,
                                    as: 'cuenta',
                                    attributes: ['nombre', 'codigo']
                                }
                            ]
                        }
                    ],
                    order: [['fecha', 'DESC'], ['numero_asiento', 'DESC']]
                })
            ]);
        }

        res.json({ total, asientos });
    } catch (error) {
        console.log("Error al obtener asientos:", error);
        res.status(500).json({ msg: 'Error al obtener los asientos. Hable con el administrador' });
    }
};

// Obtener un asiento por ID
const getAsientoById = async (req, res) => {
    try {
        const { id } = req.params;
        const asiento = await AsientoCabecera.findByPk(id, {
            include: [
                {
                    model: Empresa,
                    as: 'empresa',
                    attributes: ['nombre']
                },
                {
                    model: AsientoDetalle,
                    as: 'asientoDetalles',
                    include: [
                        {
                            model: Cuenta,
                            as: 'cuenta',
                            attributes: ['nombre', 'codigo', 'asentable']
                        }
                    ]
                }
            ]
        });

        if (!asiento) {
            return res.status(404).json({ msg: `No existe un asiento con id ${id}` });
        }

        res.json(asiento);
    } catch (error) {
        console.log("Error al obtener asiento:", error);
        res.status(500).json({ msg: 'Error al obtener el asiento. Hable con el administrador' });
    }
};

// Crear un nuevo asiento
const crearAsiento = async (req, res) => {
    const transaction = await db.transaction();
    
    try {
        const { asientoDetalles, ...cabecera } = req.body;

        // Verificar que el número de asiento no exista para la empresa
        const asientoExiste = await AsientoCabecera.findOne({
            where: {
                id_empresa: cabecera.id_empresa,
                numero_asiento: cabecera.numero_asiento
            }
        });

        if (asientoExiste) {
            await transaction.rollback();
            return res.status(400).json({
                msg: `Ya existe un asiento con el número ${cabecera.numero_asiento} para esta empresa`
            });
        }

        // Validar que todas las cuentas sean asentables
        for (const detalle of asientoDetalles) {
            const cuenta = await Cuenta.findByPk(detalle.id_cuenta);
            if (!cuenta) {
                await transaction.rollback();
                return res.status(400).json({
                    msg: `La cuenta con id ${detalle.id_cuenta} no existe`
                });
            }
            if (cuenta.asentable === 'No') {
                await transaction.rollback();
                return res.status(400).json({
                    msg: `La cuenta "${cuenta.nombre}" no es asentable`
                });
            }
        }

        // Calcular totales
        let totalDebe = 0;
        let totalHaber = 0;
        
        asientoDetalles.forEach(detalle => {
            totalDebe += parseFloat(detalle.debe || 0);
            totalHaber += parseFloat(detalle.haber || 0);
        });

        // Validar que el asiento esté balanceado
        if (Math.abs(totalDebe - totalHaber) > 0.01) {
            await transaction.rollback();
            return res.status(400).json({
                msg: 'El asiento no está balanceado. La suma del debe debe ser igual a la suma del haber'
            });
        }

        // Crear cabecera
        const nuevoCabecera = await AsientoCabecera.create({
            ...cabecera,
            total_debe: totalDebe,
            total_haber: totalHaber
        }, { transaction });

        // Crear detalles
        const detallesConAsiento = asientoDetalles.map(detalle => ({
            ...detalle,
            id_asiento: nuevoCabecera.id_asiento
        }));

        await AsientoDetalle.bulkCreate(detallesConAsiento, { transaction });

        await transaction.commit();

        // Obtener el asiento completo para la respuesta
        const asientoCompleto = await AsientoCabecera.findByPk(nuevoCabecera.id_asiento, {
            include: [
                {
                    model: Empresa,
                    as: 'empresa',
                    attributes: ['nombre']
                },
                {
                    model: AsientoDetalle,
                    as: 'asientoDetalles',
                    include: [
                        {
                            model: Cuenta,
                            as: 'cuenta',
                            attributes: ['nombre', 'codigo']
                        }
                    ]
                }
            ]
        });

        res.status(201).json(asientoCompleto);
    } catch (error) {
        await transaction.rollback();
        console.log("Error al crear asiento:", error);
        res.status(500).json({ msg: 'Error al crear el asiento. Hable con el administrador' });
    }
};

// Actualizar un asiento
const actualizarAsiento = async (req, res) => {
    const transaction = await db.transaction();
    
    try {
        const { id } = req.params;
        const { asientoDetalles, ...cabecera } = req.body;

        const asiento = await AsientoCabecera.findByPk(id);
        if (!asiento) {
            await transaction.rollback();
            return res.status(404).json({ msg: `No existe un asiento con id ${id}` });
        }

        // Verificar que el asiento no esté procesado
        if (asiento.estado === 'procesado') {
            await transaction.rollback();
            return res.status(400).json({
                msg: 'No se puede modificar un asiento que ya está procesado'
            });
        }

        // Verificar que el número de asiento no esté en uso por otro asiento
        if (cabecera.numero_asiento && cabecera.numero_asiento !== asiento.numero_asiento) {
            const asientoExiste = await AsientoCabecera.findOne({
                where: {
                    id_empresa: cabecera.id_empresa || asiento.id_empresa,
                    numero_asiento: cabecera.numero_asiento,
                    id_asiento: {
                        [Op.ne]: id
                    }
                }
            });

            if (asientoExiste) {
                await transaction.rollback();
                return res.status(400).json({
                    msg: `Ya existe otro asiento con el número ${cabecera.numero_asiento} para esta empresa`
                });
            }
        }

        // Si se proporcionan detalles, validar y recalcular
        if (asientoDetalles && asientoDetalles.length > 0) {
            // Validar cuentas asentables
            for (const detalle of asientoDetalles) {
                const cuenta = await Cuenta.findByPk(detalle.id_cuenta);
                if (!cuenta) {
                    await transaction.rollback();
                    return res.status(400).json({
                        msg: `La cuenta con id ${detalle.id_cuenta} no existe`
                    });
                }
                if (cuenta.asentable === 'No') {
                    await transaction.rollback();
                    return res.status(400).json({
                        msg: `La cuenta "${cuenta.nombre}" no es asentable`
                    });
                }
            }

            // Calcular totales
            let totalDebe = 0;
            let totalHaber = 0;
            
            asientoDetalles.forEach(detalle => {
                totalDebe += parseFloat(detalle.debe || 0);
                totalHaber += parseFloat(detalle.haber || 0);
            });

            // Validar balance
            if (Math.abs(totalDebe - totalHaber) > 0.01) {
                await transaction.rollback();
                return res.status(400).json({
                    msg: 'El asiento no está balanceado. La suma del debe debe ser igual a la suma del haber'
                });
            }

            // Eliminar detalles existentes
            await AsientoDetalle.destroy({
                where: { id_asiento: id },
                transaction
            });

            // Crear nuevos detalles
            const detallesConAsiento = asientoDetalles.map(detalle => ({
                ...detalle,
                id_asiento: id
            }));

            await AsientoDetalle.bulkCreate(detallesConAsiento, { transaction });

            // Actualizar totales en cabecera
            cabecera.total_debe = totalDebe;
            cabecera.total_haber = totalHaber;
        }

        // Actualizar cabecera
        await asiento.update(cabecera, { transaction });

        await transaction.commit();

        // Obtener el asiento actualizado
        const asientoActualizado = await AsientoCabecera.findByPk(id, {
            include: [
                {
                    model: Empresa,
                    as: 'empresa',
                    attributes: ['nombre']
                },
                {
                    model: AsientoDetalle,
                    as: 'asientoDetalles',
                    include: [
                        {
                            model: Cuenta,
                            as: 'cuenta',
                            attributes: ['nombre', 'codigo']
                        }
                    ]
                }
            ]
        });

        res.json(asientoActualizado);
    } catch (error) {
        await transaction.rollback();
        console.log("Error al actualizar asiento:", error);
        res.status(500).json({ msg: 'Error al actualizar el asiento. Hable con el administrador' });
    }
};

// Eliminar un asiento
const eliminarAsiento = async (req, res) => {
    const transaction = await db.transaction();
    
    try {
        const { id } = req.params;
        const asiento = await AsientoCabecera.findByPk(id);

        if (!asiento) {
            await transaction.rollback();
            return res.status(404).json({ msg: `No existe un asiento con id ${id}` });
        }

        // Verificar que el asiento no esté procesado
        if (asiento.estado === 'procesado') {
            await transaction.rollback();
            return res.status(400).json({
                msg: 'No se puede eliminar un asiento que ya está procesado'
            });
        }

        // Eliminar detalles (por CASCADE)
        await asiento.destroy({ transaction });

        await transaction.commit();
        res.json({ msg: 'Asiento eliminado correctamente' });
    } catch (error) {
        await transaction.rollback();
        console.log("Error al eliminar asiento:", error);
        res.status(500).json({ msg: 'Error al eliminar el asiento. Hable con el administrador' });
    }
};

// Procesar asiento (cambiar estado a procesado)
const procesarAsiento = async (req, res) => {
    try {
        const { id } = req.params;
        const asiento = await AsientoCabecera.findByPk(id);

        if (!asiento) {
            return res.status(404).json({ msg: `No existe un asiento con id ${id}` });
        }

        if (asiento.estado === 'procesado') {
            return res.status(400).json({ msg: 'El asiento ya está procesado' });
        }

        // Verificar que el asiento esté balanceado
        if (Math.abs(asiento.diferencia) > 0.01) {
            return res.status(400).json({
                msg: 'No se puede procesar un asiento que no está balanceado'
            });
        }

        await asiento.update({ estado: 'procesado' });

        res.json({ msg: 'Asiento procesado correctamente', asiento });
    } catch (error) {
        console.log("Error al procesar asiento:", error);
        res.status(500).json({ msg: 'Error al procesar el asiento. Hable con el administrador' });
    }
};

// Obtener resumen de asientos por empresa
const getResumenAsientos = async (req, res) => {
    try {
        const { id_empresa } = req.params;
        
        const resumen = await AsientoCabecera.findAll({
            where: { id_empresa },
            attributes: [
                'estado',
                [db.fn('COUNT', db.col('id_asiento')), 'cantidad'],
                [db.fn('SUM', db.col('total_debe')), 'total_debe'],
                [db.fn('SUM', db.col('total_haber')), 'total_haber']
            ],
            group: ['estado']
        });

        res.json(resumen);
    } catch (error) {
        console.log("Error al obtener resumen:", error);
        res.status(500).json({ msg: 'Error al obtener el resumen. Hable con el administrador' });
    }
};

module.exports = {
    getAsientos,
    getAsientoById,
    crearAsiento,
    actualizarAsiento,
    eliminarAsiento,
    procesarAsiento,
    getResumenAsientos
};