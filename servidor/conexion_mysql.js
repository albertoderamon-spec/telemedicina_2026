const mysql = require('mysql');
const database = {
    host: 'db.wexuhdsfvxccqyjphzbo.supabase.co',
    user: 'postgres',
    port:5432,
    password:'Alberto12332112aA#',
    database:'postgres'
};

const conexion = mysql.createConnection(database);

conexion.connect(function (err) {
    if (err) {
        console.error('Error en la conexión de la base de datos:',err);
        process.exit();
    }
});

module.exports = conexion;
