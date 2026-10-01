module.exports = function (app) {

    var conexion = require("../conexion_mysql.js")

    app.post("/api/area_salud", function (req, res) {
        let area = req.body;
        console.log(area);

        var sql = "INSERT INTO areas (cp, nombre, gestor) VALUES (?, ?, ?)";
        var params = [area.cp, area.nombre, area.gestor];
        conexion.query(sql,params, function(err, respuesta){
            if(err){
                res.status(500).json(err);
            }
            else{
                console.log("area creada");
                res.status(200).json("area creada con éxito");
            }
        });
    });

};
