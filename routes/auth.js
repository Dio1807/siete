const {Router} = require("express");
const { check } = require("express-validator");
const { validar } = require("../middlewares/validarCampos");

const { login } = require("../controllers/auth");

const router = Router();

router.post('/login',[
    check('correo', 'El correo no es valido').isEmail(),
    check('contra', 'La contraseña es obligatorio').not().isEmpty(),
    validar
], login);

module.exports=router;