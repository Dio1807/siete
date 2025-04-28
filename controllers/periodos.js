const Periodo = require("../models/periodo")

getPeriodos=async(req, res)=>{
    try {
        const [total, periodos] = await Promise.all([
            Periodo.count(),
            Periodo.findAll()
        ])
    
    
        res.json({
            total,
            periodos
        })
    } catch (error) {
        console.log("Error al obtener periodos:", error);
        res.status(500).json({ msg: 'Hable con el administrador' });
    }
}

module.exports = {
    getPeriodos
}