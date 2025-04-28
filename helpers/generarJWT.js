const jwt =  require("jsonwebtoken");

const generarJWT = (uid="")=>{
    return new Promise((resolve, reject)=>{
        const payload = {uid};

                //payload, llave, opciones de configuracion, callback
        jwt.sign(payload, process.env.SECRETORPRIVATEKEY, {
            expiresIn:"4h" //o 365d
        }, (err, token)=>{
            if(err){
                console.log(err);
                reject("No se pudo generar el token");
            }else{
                resolve(token);
            }
        });

    })
}

module.exports = {
    generarJWT
}