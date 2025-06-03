const { generarJWT } = require("../helpers/generarJWT");
const Usuario = require("../models/usuario");
const bcryptjs = require("bcryptjs");

const login = async (req, res)=>{
    const {cedula, contra } = req.body;

    try {
        //verificar si el usuario esta activo
        const usuario = await Usuario.findOne({
            where:{cedula}
        });
        if(!usuario){
            return res.status(401).json({
                msg:'Usuario/contrasena incorrecta-usuario'
            });
        };
        //validar que este activo
        if(!usuario.estado){
            return res.status(401).json({
                msg:'Usuario inactivo-inactivo'
            });
        };
        //verificar la contrasena
        const validCont = bcryptjs.compareSync(contra, usuario.contra);
        if(!validCont){
            return res.status(401).json({
                msg:'Usuario/contrasena incorrecta-contra'
            });
        }
        //Generar JWT
        const token = await generarJWT(usuario.id);
        res.json({
            usuario,
            token
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg:'Error con el administrador'
        });
    }
}

module.exports = {
    login
}