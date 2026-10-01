const mysql = require('mysql');
const database = {
    host : 'https://wexuhdsfvxccqyjphzbo.supabase.com',
    user : 'postgres',
    password : 'Alberto12332112aA#',
    database : 'telemedicina_26',
    multipleStatements: true
};

const conexion = mysql.createConnection(database);

conexion.connect(function (err) {
    if (err) {
        console.error('Error en la conexión de la base de datos:',err);
        process.exit();
    }
});

module.exports = conexion;
