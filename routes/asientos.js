const { Router } = require("express");
const { check } = require("express-validator");
const { validar } = require("../middlewares/validarCampos");
const { validarJWT } = require("../middlewares/validarJWT");
const { 
    getAsientos, 
    getAsientoById, 
    crearAsiento, 
    actualizarAsiento, 
    eliminarAsiento, 
    procesarAsiento,
    getResumenAsientos 
} = require("../controllers/asientos");
const { 
    existeAsientoId,
    numeroAsientoUnico,
    existeEmpresaAsiento,
    esTipoAsientoValido,
    esEstadoValido,
    fechaValida,
    validarDetallesAsiento,
    puedeModificarAsiento,
    puedeEliminarAsiento
} = require("../helpers/validacionesAsientos");

const router = Router();

// Obtener todos los asientos con filtros - GET /api/asientos
router.get('/', getAsientos);

// Obtener resumen de asientos por empresa - GET /api/asientos/resumen/:id_empresa
router.get('/resumen/:id_empresa', [
    check('id_empresa', 'El ID de empresa es obligatorio').isInt(),
    check('id_empresa').custom(existeEmpresaAsiento),
    validar
], getResumenAsientos);

// Obtener un asiento por ID - GET /api/asientos/:id
router.get('/:id', [
    check('id', 'El ID debe ser un número entero').isInt(),
    check('id').custom(existeAsientoId),
    validar
], getAsientoById);

// Crear un nuevo asiento - POST /api/asientos
router.post('/', [
    check('id_empresa', 'El ID de empresa es obligatorio').isInt(),
    check('id_empresa').custom(existeEmpresaAsiento),
    check('id_sucursal', 'El ID de sucursal es obligatorio').isInt(),
    check('id_tipo_asiento', 'El tipo de asiento es obligatorio').not().isEmpty(),
    check('id_tipo_asiento').custom(esTipoAsientoValido),
    check('numero_asiento', 'El número de asiento es obligatorio').not().isEmpty(),
    check('numero_asiento').custom(numeroAsientoUnico),
    check('fecha', 'La fecha es obligatoria').isISO8601().toDate(),
    check('fecha').custom(fechaValida),
    check('documento', 'El documento no puede estar vacío').optional().not().isEmpty(),
    check('estado').optional().custom(esEstadoValido),
    check('asientoDetalles', 'Los detalles del asiento son obligatorios').isArray({ min: 1 }),
    check('asientoDetalles').custom(validarDetallesAsiento),
    validar,
    // validarJWT
], crearAsiento);

// Actualizar un asiento - PUT /api/asientos/:id
router.put('/:id', [
    check('id', 'El ID debe ser un número entero').isInt(),
    check('id').custom(existeAsientoId),
    check('id').custom(puedeModificarAsiento),
    check('id_empresa').optional().isInt().custom(existeEmpresaAsiento),
    check('id_sucursal').optional().isInt(),
    check('id_tipo_asiento').optional().custom(esTipoAsientoValido),
    check('numero_asiento').optional().custom(numeroAsientoUnico),
    check('fecha').optional().isISO8601().toDate().custom(fechaValida),
    check('documento', 'El documento no puede estar vacío').optional().not().isEmpty(),
    check('estado').optional().custom(esEstadoValido),
    check('asientoDetalles').optional().isArray({ min: 1 }).custom(validarDetallesAsiento),
    validar,
    // validarJWT
], actualizarAsiento);

// Eliminar un asiento - DELETE /api/asientos/:id
router.delete('/:id', [
    check('id', 'El ID debe ser un número entero').isInt(),
    check('id').custom(existeAsientoId),
    check('id').custom(puedeEliminarAsiento),
    validar,
    // validarJWT
], eliminarAsiento);

// Procesar asiento - PATCH /api/asientos/:id/procesar
router.patch('/:id/procesar', [
    check('id', 'El ID debe ser un número entero').isInt(),
    check('id').custom(existeAsientoId),
    validar,
    // validarJWT
], procesarAsiento);

module.exports = router;