const Cuenta = require("../models/cuenta");

// Verificar que exista una cuenta con el ID proporcionado
const existeCuentaId = async (id = "") => {
    const cuenta = await Cuenta.findByPk(id);
    if (!cuenta) {
        throw new Error(`No existe una cuenta con id: ${id}`);
    }
};

// Verificar que no exista una cuenta con el código proporcionado
const codigoUnico = async (codigo = "") => {
    const cuentaExiste = await Cuenta.findOne({ where: { codigo } });
    if (cuentaExiste) {
        throw new Error(`El código ${codigo} ya está registrado en otra cuenta`);
    }
};

// Verificar que la cuenta padre exista
const existeCuentaPadre = async (id_padre = "") => {
    // Si viene null o undefined, no validamos
    if (!id_padre) return true;
    
    const cuentaPadre = await Cuenta.findByPk(id_padre);
    if (!cuentaPadre) {
        throw new Error(`La cuenta padre con id ${id_padre} no existe`);
    }
    return true;
};

// Validar que el valor de asentable sea 'Si' o 'No'
const esAsentableValido = (asentable = "") => {
    if (asentable !== 'Si' && asentable !== 'No') {
        throw new Error("El valor de 'asentable' debe ser 'Si' o 'No'");
    }
    return true;
};

module.exports = {
    existeCuentaId,
    codigoUnico,
    existeCuentaPadre,
    esAsentableValido
};