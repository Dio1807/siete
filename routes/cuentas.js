const { Router } = require("express");
const { check } = require("express-validator");
const { validar } = require("../middlewares/validarCampos");
const { validarJWT } = require("../middlewares/validarJWT");
const { 
    getCuentas, 
    getCuentaById, 
    crearCuenta, 
    actualizarCuenta, 
    eliminarCuenta, 
    getEstructuraCuentas 
} = require("../controllers/cuentas");
const { 
    existeCuentaId, 
    codigoUnico, 
    existeCuentaPadre, 
    esAsentableValido 
} = require("../helpers/validacionesCuentas");

const router = Router();

// Obtener todas las cuentas - GET /api/cuentas
router.get('/', getCuentas);

// Obtener estructura jerárquica de cuentas - GET /api/cuentas/estructura
router.get('/estructura', getEstructuraCuentas);

// Obtener una cuenta por ID - GET /api/cuentas/:id
router.get('/:id', [
    check('id').custom(existeCuentaId),
    validar
], getCuentaById);

// Crear una nueva cuenta - POST /api/cuentas
router.post('/', [
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('codigo', 'El código es obligatorio').not().isEmpty().isInt(),
    check('codigo').custom(codigoUnico),
    check('asentable', 'El valor de asentable es obligatorio').not().isEmpty(),
    check('asentable').custom(esAsentableValido),
    check('id_padre').optional().custom(existeCuentaPadre),
    validar,
    // validarJWT
], crearCuenta);

// Actualizar una cuenta - PUT /api/cuentas/:id
router.put('/:id', [
    check('id').custom(existeCuentaId),
    check('nombre', 'El nombre es obligatorio').optional().not().isEmpty(),
    check('codigo').optional().isInt().withMessage('El código debe ser un número entero'),
    check('asentable').optional().custom(esAsentableValido),
    check('id_padre').optional().custom(existeCuentaPadre),
    validar,
    // validarJWT
], actualizarCuenta);

// Eliminar una cuenta - DELETE /api/cuentas/:id
router.delete('/:id', [
    check('id').custom(existeCuentaId),
    validar,
    // validarJWT
], eliminarCuenta);

module.exports = router;