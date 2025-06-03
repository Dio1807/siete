const Cuenta = require("../models/cuenta");
const { Op } = require('sequelize');

// Obtener todas las cuentas
const getCuentas = async (req, res) => {
    let { desde, limite } = req.query;

    try {
        limite = parseInt(limite);
        desde = parseInt(desde);
        let cuentas, total;

        if (desde > -1 && limite > 0) {
            [total, cuentas] = await Promise.all([
                Cuenta.count(),
                Cuenta.findAll({
                    offset: desde,
                    limit: limite,
                    include: [{
                        model: Cuenta,
                        as: 'cuentaPadre',
                        attributes: ['id_cuenta', 'nombre', 'codigo']
                    }]
                })
            ]);
        } else {
            [total, cuentas] = await Promise.all([
                Cuenta.count(),
                Cuenta.findAll({
                    include: [{
                        model: Cuenta,
                        as: 'cuentaPadre',
                        attributes: ['id_cuenta', 'nombre', 'codigo']
                    }]
                })
            ]);
        }

        res.json({ total, cuentas });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Error al obtener las cuentas. Hable con el administrador' });
    }
};

// Obtener una cuenta por ID
const getCuentaById = async (req, res) => {
    try {
        const { id } = req.params;
        const cuenta = await Cuenta.findByPk(id, {
            include: [{
                model: Cuenta,
                as: 'cuentaPadre',
                attributes: ['id_cuenta', 'nombre', 'codigo']
            }]
        });

        if (!cuenta) {
            return res.status(404).json({ msg: `No existe una cuenta con id ${id}` });
        }

        res.json(cuenta);
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Error al obtener la cuenta. Hable con el administrador' });
    }
};

// Crear una nueva cuenta
const crearCuenta = async (req, res) => {
    try {
        // Verificar si el código ya existe
        const codigoExiste = await Cuenta.findOne({
            where: { codigo: req.body.codigo }
        });

        if (codigoExiste) {
            return res.status(400).json({ 
                msg: `Ya existe una cuenta con el código ${req.body.codigo}` 
            });
        }

        // Verificar que la cuenta padre exista si se proporciona
        if (req.body.id_padre) {
            const cuentaPadre = await Cuenta.findByPk(req.body.id_padre);
            if (!cuentaPadre) {
                return res.status(400).json({ 
                    msg: `La cuenta padre con id ${req.body.id_padre} no existe` 
                });
            }
        }

        const cuenta = new Cuenta(req.body);
        await cuenta.save();

        res.status(201).json(cuenta);
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Error al crear la cuenta. Hable con el administrador' });
    }
};

// Actualizar una cuenta
const actualizarCuenta = async (req, res) => {
    try {
        const { id } = req.params;
        const cuenta = await Cuenta.findByPk(id);

        if (!cuenta) {
            return res.status(404).json({ msg: `No existe una cuenta con id ${id}` });
        }

        // Verificar que el código no esté en uso por otra cuenta
        if (req.body.codigo) {
            const codigoExiste = await Cuenta.findOne({
                where: { 
                    codigo: req.body.codigo,
                    id_cuenta: {
                        [Op.ne]: id
                    }
                }
            });

            if (codigoExiste) {
                return res.status(400).json({ 
                    msg: `Ya existe otra cuenta con el código ${req.body.codigo}` 
                });
            }
        }

        // Verificar que la cuenta padre exista si se proporciona
        if (req.body.id_padre) {
            // Evitar referencias circulares
            if (req.body.id_padre == id) {
                return res.status(400).json({ 
                    msg: 'Una cuenta no puede ser padre de sí misma' 
                });
            }

            const cuentaPadre = await Cuenta.findByPk(req.body.id_padre);
            if (!cuentaPadre) {
                return res.status(400).json({ 
                    msg: `La cuenta padre con id ${req.body.id_padre} no existe` 
                });
            }
        }

        await cuenta.update(req.body);
        res.json(cuenta);
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Error al actualizar la cuenta. Hable con el administrador' });
    }
};

// Eliminar una cuenta
const eliminarCuenta = async (req, res) => {
    try {
        const { id } = req.params;
        const cuenta = await Cuenta.findByPk(id);

        if (!cuenta) {
            return res.status(404).json({ msg: `No existe una cuenta con id ${id}` });
        }

        // Verificar si tiene cuentas hijas
        const tieneHijas = await Cuenta.findOne({
            where: { id_padre: id }
        });

        if (tieneHijas) {
            return res.status(400).json({ 
                msg: 'No se puede eliminar la cuenta porque tiene cuentas hijas asociadas' 
            });
        }

        // Verificar si la cuenta está siendo utilizada en asientos contables
        // Este código dependerá de cómo esté estructurada la relación con los asientos
        // Aquí hay un ejemplo genérico:
        const DetalleAsiento = require("../models/detalle_asiento"); // Se necesitará crear este modelo
        const tieneAsientos = await DetalleAsiento.findOne({
            where: { id_cuenta: id }
        });

        if (tieneAsientos) {
            return res.status(400).json({ 
                msg: 'No se puede eliminar la cuenta porque está siendo utilizada en asientos contables' 
            });
        }

        await cuenta.destroy();
        res.json({ msg: 'Cuenta eliminada correctamente' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Error al eliminar la cuenta. Hable con el administrador' });
    }
};

// Obtener estructura jerárquica de cuentas
const getEstructuraCuentas = async (req, res) => {
    try {
        // Obtener cuentas raíz (sin padre)
        const cuentasRaiz = await Cuenta.findAll({
            where: {
                id_padre: null
            },
            include: [{
                model: Cuenta,
                as: 'cuentasHijas',
                include: [{
                    model: Cuenta,
                    as: 'cuentasHijas'
                }]
            }]
        });

        res.json(cuentasRaiz);
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Error al obtener la estructura de cuentas. Hable con el administrador' });
    }
};

module.exports = {
    getCuentas,
    getCuentaById,
    crearCuenta,
    actualizarCuenta,
    eliminarCuenta,
    getEstructuraCuentas
};