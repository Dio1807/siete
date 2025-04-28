const Empresa = require("../models/empresa");
const { Op } = require('sequelize')
const bcryptjs = require("bcryptjs");
const Periodo = require("../models/periodo");


const getIdController = async (req, res) => {
    try{
        let idEmpresa = req.params.id;
        let empresa= await Empresa.findOne({
            attributes:['id_empresa', 'nombre', 'ruc','direccion', 'telefono', 'id_periodo', 'estado', 'createdAt', 'updatedAt'],
            where:{
                id_empresa:idEmpresa
            },
            include:[
                {
                    model:Periodo,
                    attributes:['nombre_periodo']
                }
            ]
        });
        console.log(empresa)
        res.json(empresa);
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
        let empresas, total;
        if (desde > -1 && limite > 0) {
            [total, empresas] = await Promise.all([
                Empresa.count(),
                Empresa.findAll({
                    offset: desde,
                    limit: limite,
                })
            ]);
        } else {
            [total, empresas] = await Promise.all([
                Empresa.count(),
                // Empresa.findAll()
                Empresa.findAll({
                    attributes:['id_empresa', 'nombre', 'ruc','direccion', 'telefono', 'id_periodo', 'estado', 'createdAt', 'updatedAt'],
                    include:[//para obtener el nombre del periodo
                        {
                            model:Periodo,
                            attributes:['nombre_periodo']
                        }
                    ]
                })
            ]);
        }

        res.json({ total, empresas });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Hable con el administrador' });
    }
}

const postController = async (req, res) => {
    
    const { estado, ...body } = req.body; //TODO: el campo estado puede tener valor por defecto true
    try {

        
        
        const empresa = new Empresa(body);
        await empresa.save();
        // setTimeout(() => {
            res.json(empresa);
        // }, 5000);
    } catch (error) {
        console.log(error);
    }
}

const putController = async (req, res) => {
    const { id } = req.params;
    const { estado, ...body } = req.body; //TODO: el campo estado puede tener valor por defecto true
    try {
        const empresa = await Empresa.findByPk(id);

        

        await empresa.update(body);

        res.json(empresa);
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Hable con el administrador' });
    }
}

const deleteController = async (req, res) => {
    try{
        const { id } = req.params;
        const empresa = await Empresa.findByPk(id);
        if (!empresa) {
            return res.status(404).json({ msg: `No existe empresa con id ${id}` });
        }
        await empresa.update({ estado: false });
        res.json({ mensaje: "Empresa eliminada" });
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
    getIdController
}