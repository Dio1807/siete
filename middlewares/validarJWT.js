const jwt = require("jsonwebtoken");
const Usuario = require("../models/usuario");

const validarJWT = async (req, res, next)=>{
    const token = req.header('x-token');

    if(!token){
        return res.status(401).json({
            msg:'No hay token en la peticion'
        });
    }

    try {
        //va a lanzar un error si el token no es valido y pasa al catch
        const {uid} = jwt.verify(token, process.env.SECRETORPRIVATEKEY);

        const usuario = await Usuario.findByPk(uid);

        if(!usuario){
            return res.status(401).json({
                msg:'Usuario no existe en BD'
            });
        } 

        //el usuario puede eliminarse luego de generar el token
        //hay que validar que este activo
        if(!usuario.estado){
            return res.status(401).json({
                msg:'Token no valido - usuario inactivo'
            });
        }   

        req.usuario = usuario.dataValues;
        console.log(req.usuario)

        next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({
            msg:'Token no valido'
        });
    }
}

module.exports = {
    validarJWT
}