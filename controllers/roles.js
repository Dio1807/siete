const Rol = require("../models/rol")

getRoles=async(req, res)=>{
    try {
        const [total, roles] = await Promise.all([
            Rol.count(),
            Rol.findAll()
        ])
    
    
        res.json({
            total,
            roles
        })
    } catch (error) {
        res.status(500).json({ msg: 'Hable con el administrador' });
    }
}

module.exports = {
    getRoles
}