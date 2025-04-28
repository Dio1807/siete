const Rol = require("../models/rol");
const Usuario = require("../models/usuario");
const { Op } = require('sequelize');


const existeRol = async (idrol="")=>{
    console.log(`---------------------------------------- ${idrol}`)
    const rol = await Rol.findByPk(idrol);
    if(!rol){//error personalizado que va a ser capturado en el custom
        throw new Error(`El id ${idrol} no existe en la bd`);
    }
}

const existePeriodo = async (idrol="")=>{
    console.log(`---------------------------------------- ${idrol}`)
    const rol = await Rol.findByPk(idrol);
    if(!rol){//error personalizado que va a ser capturado en el custom
        throw new Error(`El id ${idrol} no existe en la bd`);
    }
}

const existeCorreo = async (correo="")=>{
    const usuario = await Usuario.findOne({
        where:{correo}
    });

    if(usuario){//error personalizado que va a ser capturado en el custom
        throw new Error(`El correo ${correo} ya existe`);
    }
}

const existeUsuarioId = async (id="")=>{
    const usuario = await Usuario.findByPk(id);

    if(!usuario){//error personalizado que va a ser capturado en el custom
        throw new Error(`No existe usuario con id: ${id}`);
    }
}

const existeEmpresaId = async (id="")=>{
    const usuario = await Usuario.findByPk(id);

    if(!usuario){//error personalizado que va a ser capturado en el custom
        throw new Error(`No existe usuario con id: ${id}`);
    }
}

module.exports = {
    existeRol,
    existePeriodo,
    existeCorreo,
    existeUsuarioId,
    existeEmpresaId
}