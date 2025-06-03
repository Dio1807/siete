const Ciudad = require("../models/ciudad");

const getCiudades = async (req, res) => {
    try {
        const [total, ciudades] = await Promise.all([
            Ciudad.count(),
            Ciudad.findAll()
        ]);
    
        res.json({
            total,
            ciudades
        });
    } catch (error) {
        console.log("Error al obtener ciudades:", error);
        res.status(500).json({ msg: 'Hable con el administrador' });
    }
};

module.exports = {
    getCiudades
};