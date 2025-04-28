const {Router} = require("express");
const { getContoller, postController, putController, deleteController, getIdController, cambiarContra, verificarCorreo } = require("../controllers/users");
const { check } = require("express-validator");
const { validar } = require("../middlewares/validarCampos");
const { existeRol, existeCorreo, existeUsuarioId } = require("../helpers/validacionesBD");
const { validarJWT } = require("../middlewares/validarJWT");
const { esAdminRol } = require("../middlewares/validarRol");

const router = Router();

router.get('', getContoller );

router.post('',[
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('cedula', 'La cedula es obligatorio').not().isEmpty(),
    check('telefono', 'La cedula es obligatorio').not().isEmpty(),
    check('correo', 'El correo no es valido').isEmail(),
    check('correo').custom(existeCorreo),
    check('contra', 'Minimo 8 caracteres para la contraseña').isLength({min:8}),
    check('id_rol', 'El rol es obligatorio').not().isEmpty(),
    check('id_rol').custom(existeRol),
    validar,
    // validarJWT,
    // esAdminRol
], postController);

router.put('/:id',[
    check('id').custom(existeUsuarioId),
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('correo', 'El correo no es valido').isEmail(),
    //TODO: EL CORREO DEBE VERIFICARSE PARA USUARIOS QUE NO CUENTEN CON ESTE ID (en el controlador ya esta)
    //check('contra', 'Minimo 8 caracteres para la contraseña').isLength({min:8}),//TODO: La contraseña se va a actualizar por separado
    check('idrol').custom(existeRol),
    validar,
    // validarJWT,
    // esAdminRol
], putController);

router.delete('/:id',[
    check('id').custom(existeUsuarioId),
    validar, 
    // validarJWT,
    // esAdminRol
],deleteController);

//AGREGADOS

router.get('/:id', [
    check('id').custom(existeUsuarioId),
    validar,
    // validarJWT,
    // esAdminRol
],getIdController );

router.put('/cambioContra/:id', [
    check('id').custom(existeUsuarioId),
    validar,
    // validarJWT,
    // esAdminRol
], cambiarContra );

router.get('/validaciones/verificarCorreo', verificarCorreo ); //para validacion asincrona

module.exports = router;