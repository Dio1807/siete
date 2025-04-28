


const Usuario = require("../models/usuario");
const { Op } = require('sequelize')
const bcryptjs = require("bcryptjs");
const Rol = require("../models/rol");

const verificarCorreo=async(req, res)=>{
    let correo = req.query.correo;

    try {
        
        const existe = await Usuario.findOne({
            where: { correo }
        });
        
        setTimeout(() => {
            if(existe){
                res.json({
                    estaHabilitado:false
                })
            }else{       
                res.json({
                    estaHabilitado:true
                })  
            } 
        }, 5000);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Error al verificar el correo" });
    }
}

const getIdController = async (req, res) => {
    try{
        let idUsuario = req.params.id;
        let usuario= await Usuario.findOne({
            attributes:['id_usuario', 'nombre', 'cedula', 'correo', 'id_rol', 'estado', 'telefono', 'createdAt', 'updatedAt'],
            where:{
                id_usuario:idUsuario
            },
            include:[
                {
                    model:Rol,
                    attributes:['nombre_rol']
                }
            ]
        });
        console.log(usuario)
        res.json(usuario);
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Hable con el administrador' });
    }
}

const cambiarContra = async (req, res) => {
    const { id } = req.params;
    let { contra } = req.body;
    try {
        const usuario = await Usuario.findByPk(id);
        
        //encriptar contrasenia
        const saltos = bcryptjs.genSaltSync();
        contra = bcryptjs.hashSync(contra, saltos);
        
        await usuario.update({contra});
        res.json(usuario);
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Hable con el administrador' });
    }
}

const getContoller = async (req, res) => {
    let { desde, limite } = req.query;

    try{
        limite = parseInt(limite);
        desde = parseInt(desde);
        let usuarios, total;
        if (desde > -1 && limite > 0) {
            [total, usuarios] = await Promise.all([
                Usuario.count(),
                Usuario.findAll({
                    offset: desde,
                    limit: limite,
                })
            ]);
        } else {
            [total, usuarios] = await Promise.all([
                Usuario.count(),
                // Usuario.findAll()
                Usuario.findAll({
                    attributes:['id_usuario', 'nombre', 'correo', 'id_rol', 'estado', 'createdAt', 'updatedAt'],
                    include:[//para obtener el nombre del rol
                        {
                            model:Rol,
                            attributes:['nombre_rol']
                        }
                    ]
                })
            ]);
        }

        res.json({ total, usuarios });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Hable con el administrador' });
    }
}

const postController = async (req, res) => {
    
    const { estado, ...body } = req.body; //TODO: el campo estado puede tener valor por defecto true
    try {

        //encriptar contrasenia
        const saltos = bcryptjs.genSaltSync();
        console.log(`---------------------------------------- ${body.contra}`)
        console.log(`---------------------------------------- ${body.idrol}`)
        body.contra = bcryptjs.hashSync(body.contra, saltos);
        
        const usuario = new Usuario(body);
        await usuario.save();
        // setTimeout(() => {
            res.json(usuario);
        // }, 5000);
    } catch (error) {
        console.log(error);
    }
}

const putController = async (req, res) => {
    const { id } = req.params;
    const { estado, contra, ...body } = req.body; //TODO: el campo estado puede tener valor por defecto true
    try {
        const usuario = await Usuario.findByPk(id);

        const correoBD = await Usuario.findOne({
            where: {
                correo: body.correo,
                id: {
                    [Op.ne]: id //que no sea del mismo id de usuario
                }
            }
        });

        if (correoBD) {
            return res.status(404).json({
                msg: `El correo ${body.correo}, no se encuentra disponible `
            });
        }

        await usuario.update(body);

        res.json(usuario);
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Hable con el administrador' });
    }
}

const deleteController = async (req, res) => {
    try{
        const { id } = req.params;
        const usuario = await Usuario.findByPk(id);
        if (!usuario) {
            return res.status(404).json({ msg: `No existe usuario con id ${id}` });
        }
        await usuario.update({ estado: false });
        res.json({ mensaje: "Usuario eliminado" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Hable con el administrador' });
    }
}

module.exports = {
    getContoller,
    postController,
    putController,
    deleteController,
    getIdController,
    //AGREGADOS
    cambiarContra,
    verificarCorreo
}