const {Router} = require("express");
const { check } = require("express-validator");
const { validar } = require("../middlewares/validarCampos");

const { login } = require("../controllers/auth");

const router = Router();

router.post('/login',[
    check('cedula', 'La cédula no es valida').not().isEmpty(),
    //check('correo', 'El correo no es valido').isEmail(),
    check('contra', 'La contraseña es obligatoria').not().isEmpty(),
    validar
], login);

module.exports=router;