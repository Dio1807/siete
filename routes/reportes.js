const { Router } = require("express");
const { check } = require("express-validator");
const { validar } = require("../middlewares/validarCampos");
const { validarJWT } = require("../middlewares/validarJWT");
const { 
    generarReporteFactura, 
    generarReporteAsientos, 
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

// Generar reporte de asientos contables - GET /api/reportes/asientos
router.get('/asientos', [
    check('id_empresa', 'El ID de empresa es requerido').not().isEmpty(),
    validar,
    // validarJWT
], generarReporteAsientos);

module.exports = router;