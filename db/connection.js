const { Sequelize } = require('sequelize');

const db = new Sequelize(
    process.env.DATABASE,
    process.env.USER,
    process.env.PASS, {
    host: process.env.HOST,
    dialect: 'mysql',

    //!añadidos solo para prueba
    logging: false,
    timezone: '-04:00', 
    // Zona horaria de Paraguay
    // dialectOptions: {
    //   useUTC: false, // para la lectura de la base de datos
    // },
});

module.exports = db;
