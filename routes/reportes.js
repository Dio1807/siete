const { Router } = require("express");
const { check } = require("express-validator");
const { validar } = require("../middlewares/validarCampos");
const { validarJWT } = require("../middlewares/validarJWT");
const { 
    generarReporteFactura, 
    generarReporteBalanceSumasSaldos, 
    listarReportes 
} = require("../controllers/reportes");

const router = Router();

// Listar reportes disponibles - GET /api/reportes
router.get('/', listarReportes);

// Generar reporte de factura - GET /api/reportes/factura/:id
router.get('/factura/:id', [
    check('id', 'El ID de la factura es requerido').not().isEmpty(),
    validar,
    // validarJWT
], generarReporteFactura);

// Generar Balance de Sumas y Saldos - GET /api/reportes/balance-sumas-saldos
router.get('/balance-sumas-saldos', [
    check('IDEMPRESA', 'El parámetro IDEMPRESA es requerido').not().isEmpty(),
    check('DESDE', 'El parámetro DESDE es requerido').not().isEmpty(),
    check('HASTA', 'El parámetro HASTA es requerido').not().isEmpty(),
    check('DESDE', 'DESDE debe tener formato YYYY-MM-DD').matches(/^\d{4}-\d{2}-\d{2}$/),
    check('HASTA', 'HASTA debe tener formato YYYY-MM-DD').matches(/^\d{4}-\d{2}-\d{2}$/),
    validar,
    // validarJWT
], generarReporteBalanceSumasSaldos);

module.exports = router;