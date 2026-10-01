
//http://localhost:3000/appCliente/
// para saber quien esta logeado, si es null es que no es nadie todavia
let usuarioLogeado;
var idModificado;

//variable para saber en que página estamos
var seccionActual = "login";

//conseguimos categorias, ubicaciones, modelos y recursos de entrada para poder usarlos más adelante
var categorias =[];
var ubicaciones =[];
var modelos =[];
var recursos =[];


rest.get("/api/categorias", function (estado, respuesta) {//tarde 1 min
        if (estado != 200) {
            alert("Error cargando los datos del buscador");
            return;
        }
        categorias = respuesta;
    });

rest.get("/api/ubicaciones", function (estado, respuesta) {

        if (estado != 200) {
            alert("Error cargando los datos del buscador");
            return;
        }

        ubicaciones = respuesta;
    });

rest.get("/api/modelos", function (estado, respuesta) {

        if (estado != 200) {
            alert(respuesta);
            return;
        }

        modelos = respuesta;
    });

rest.get("/api/recursos", function (estado, respuesta) {

        if (estado != 200) {
            alert("Error cargando los datos del buscador");
            return;
        }
        recursos = respuesta;
    });

function login(){
    //conseguimos los inputs
    let usuarioIngresado = document.getElementById("usuario").value;
    let contrasenyaIngresada = document.getElementById("contrasenya").value;
    let usuario = {"usuario" : usuarioIngresado, "contrasenya" : contrasenyaIngresada};
    
    rest.post("/api/gestores/login", usuario, function (estado, respuesta) {

       if (estado == 200){
            usuarioLogeado = respuesta;
            //terminamos y nos vamos a la pagina de inicio
            cambiarSeccion('inicio');
            conectarseServidor(usuarioLogeado.id, "gestor");
        }
        else if(estado == 500){
            alert(respuesta);
        }
        else{
            alert(respuesta);
       }
    }); 
    
}

function registrar(){
    //creamos la ficha del gestor

    let gestor = {
        "id":0,
        "nombre" : document.getElementById("nombreRegistro").value,
        "apellidos" : document.getElementById("apellidosRegistro").value,
        "login" : document.getElementById("loginRegistro").value,
        "contrasenya" : document.getElementById("contrasenyaRegistro").value 
        };
    
    //posteamos
    rest.post("/api/gestores", gestor, function (estado, respuesta) { 

            if (estado == 201) {
                alert("registro exitoso");

                //nos volvemos al login
                cambiarSeccion('login');
            } else{
                alert(respuesta);
            }
    });
    cambiarSeccion('login');
}

function irRegistro(){
    //en caso de que se registre, lo dejamos poner contraseña, si quiere cambiar datos no la mostramos ni dejamos modificarla
    cambiarSeccion('registroGestor');

    if (usuarioLogeado){
        document.getElementById("grupoContrasenya").style.display = "none";
        document.getElementById("tituloRegistro").textContent="Modificar datos";
    }else{
        document.getElementById("nombreRegistro").value = "";
        document.getElementById("apellidosRegistro").value = "";
        document.getElementById("loginRegistro").value = "";
        document.getElementById("contrasenyaRegistro").value = "";
        document.getElementById("tituloRegistro").textContent="Datos Gestor";
        document.getElementById("grupoContrasenya").style.display = "block";
    }
    
}

function cambiarDatos(){
    //si no hay nadie logeado, lo mandamos a registrar, caso contrario estamos modificando datos
    if(usuarioLogeado == null){
        registrar();
    }else{
        let objetoActualizar = {
            "nombre" : document.getElementById("nombreRegistro").value,
            "apellidos" : document.getElementById("apellidosRegistro").value,
            "login" : document.getElementById("loginRegistro").value,
        };
        //controlo que nada esté en blanco
        if(objetoActualizar.nombre == "" || objetoActualizar.apellidos == ""|| objetoActualizar.login == ""){
            alert("No puede haber campos en blanco");
            return;
        }

        rest.put("/api/gestores/" + usuarioLogeado.id , objetoActualizar, function (estado, respuesta) { 

            if (estado == 200) {
                //actualizo el usuario logeado
                usuarioLogeado.nombre = objetoActualizar.nombre;
                usuarioLogeado.apellidos = objetoActualizar.apellidos;
                usuarioLogeado.login = objetoActualizar.login;

                alert(respuesta);
                cambiarSeccion('inicio');
            } else {
                alert(respuesta);
            }
        });
    
    }
}

function cancelarRegistro(){
    // si accedimos al registro ya logeados desde el inicio y cancelamos, volvemos al inicio, sino volvemos al login (index.html)
    if(usuarioLogeado != null){
        cambiarSeccion('inicio');
    }else{
        cambiarSeccion('login');
    }
}

function cargarInicio(){
    //por si vamos al inicio muestro el nombre del usuario por pantalla
    document.getElementById("nombreUsuario").textContent= usuarioLogeado.nombre + " " + usuarioLogeado.apellidos;

    //cargamos los selects en las paginas de modificacion de recursos y en el inicio, solo si están vacios
    if(document.getElementById("categoriaInicio").options.length == 1){
        cargarSelects("categoriaInicio","ubicacionInicio","modeloInicio");
    }
    if(document.getElementById("categoriaRecursos").options.length == 0){
        cargarSelects("categoriaRecursos","ubicacionRecursos", "modeloRecursos");
    }

    imprimir(traducirRecursos(recursos));
        
}

function cambiarSeccion(seccion){
    if(seccion == "inicio"){
        cargarInicio();
    }

    document.getElementById(seccionActual).classList.remove("activa");
    document.getElementById(seccion).classList.add("activa");
    seccionActual=seccion;

}

function salir(){
    usuarioLogeado = null;
    cambiarSeccion('login');
    desconectarseServidor()
}

function buscar(){
    //conseguimos los filtros
    let cat = document.getElementById("categoriaInicio").value;
    let mod = document.getElementById("modeloInicio").value;
    let ubi = document.getElementById("ubicacionInicio").value;
    let est = document.getElementById("estadoInicio").value;

    //filtramos los recursos
    let recursosFiltrados = [];
    for( let i = 0; i < recursos.length; i++){

        if (recursos[i].categoria == cat || cat == "todos"){

            if(recursos[i].modelo == mod || mod == "todos"){

                if(recursos[i].ubicacion == ubi || ubi == "todos"){ 

                    if(recursos[i].estado == est || est =="todos"){
                        recursosFiltrados.push(recursos[i]);
                    }
                }  
            }
        }
    }

    //traducimos los recursos
    imprimir(traducirRecursos(recursosFiltrados));
}

//actualizo los modelos por si cambia el select de categoria
document.getElementById("categoriaInicio").addEventListener("change", function() {
    let catId = parseInt(this.value);
    let selectModelo = document.getElementById("modeloInicio");

    // limpiar modelos anteriores
    selectModelo.innerHTML = "";

    // agregar modelos que correspondan
        for(let i = 0; i < modelos.length ; i++){
            if(catId == modelos[i].categoria){
                let option = document.createElement("option");
                option.value = modelos[i].id;
                option.textContent = modelos[i].nombre;
                document.getElementById("modeloInicio").appendChild(option);

            }
        }
    //vuelvo a meter la opción de todos
    var todos = document.createElement("option");
    todos.value = "todos";
    todos.textContent = "Todos";
    document.getElementById("modeloInicio").appendChild(todos);
    
});

//hago lo mismo que el anterior pero para la pagina de recursos
document.getElementById("categoriaRecursos").addEventListener("change", function() {
    let catId = parseInt(this.value);
    let selectModelo = document.getElementById("modeloRecursos");

    // limpiar modelos anteriores
    selectModelo.innerHTML = "";

    // agregar modelos que correspondan
        for(let i = 0; i < modelos.length ; i++){
            if(catId == modelos[i].categoria){
                let option = document.createElement("option");
                option.value = modelos[i].id;
                option.textContent = modelos[i].nombre;
                document.getElementById("modeloRecursos").appendChild(option);

            }
        }
    //vuelvo a meter la opción de todos
    var todos = document.createElement("option");
    todos.value = "todos";
    todos.textContent = "Todos";
    document.getElementById("modeloRecursos").appendChild(todos);
    
});

//traduce los valores númericos de un array de recursos a su valor en palabra
//por el amor de dios no toques esto
function traducirRecursos(entradas){
    //let ubicaciones = [{"id": 1, "nombre": "salas"}
    //let categorias = [{"id":1, "nombre": "termómetros"}
    //let modelos = [{"id": 1, "nombre": "termometro1", "categoria": 1, "horas_maximas": 4}
   // let recursos = [{"numero_serie": "454554", "categoria": 1, "modelo": 1, "ubicacion": 2, "estado": 0, "id":1}
   
   let salidas = [];
   //recorro cada recurso
   for(let i = 0; i < entradas.length; i++){
        //creo una copia para no modificar el original
        let recurso = { ...entradas[i] };

        //traduzco el modelo, en este caso el modelo depende de categoria
        for( let a = 0; a < modelos.length; a++){
            if(recurso.modelo == modelos[a].id){
                recurso.modelo = modelos[a].nombre;
                break;
            }
        }

        //traduzco las ubicaciones recorriendo cada una hasta que una coincida
        for( let a = 0; a < ubicaciones.length; a++){
            if(recurso.ubicacion == ubicaciones[a].id){
                recurso.ubicacion = ubicaciones[a].nombre;
                break;
            }
        }

        //traduzco las categorias
        for( let a = 0; a < categorias.length; a++){
            if(recurso.categoria == categorias[a].id){
                recurso.categoria = categorias[a].nombre;
                break;
            }
        }

        

        switch(recurso.estado){
            case 0:
                recurso.estado = "operativo";
                break;
            case 1:
                recurso.estado = "de baja o defectuoso";
                break;
            case 2:
                recurso.estado = "en mantenimiento";
                break;
        }
        
        salidas.push(recurso);
   }
   return salidas;
}

//le metes un array de recursos y los muestra en la tabla
function imprimir(rec){
    //limpiamos la tabla
    let tabla = document.getElementById("cuerpo_inicio");
    tabla.innerHTML ="";

    //ahora cargamos la tabla con todos los recursos
    for ( let i = 0; i < rec.length; i++){
        let recurso =rec[i];
        // Crear fila
        let fila = document.createElement("tr");


        // Crear celdas y llenarlas
        for (let key in recurso) {
            //imprimo todo menos el id
            if (key === "id") continue;

            const celda = document.createElement("td");
            celda.textContent = recurso[key];
            fila.appendChild(celda);
        }

        //creo el boton de borrar
        let borrar = document.createElement("button");
        borrar.textContent = "X";
        borrar.onclick = function() {
            borrarRecurso(rec[i].id);
        };

        //creo el boton de abrir
        let abrir = document.createElement("button");
        abrir.textContent = "Abrir";
        abrir.onclick = function() {
            modificarRecurso(rec[i].id);
        };

        //creo la celda y la meto a la fila
        let celdaAcciones = document.createElement("td");
        celdaAcciones.appendChild(abrir);
        celdaAcciones.appendChild(borrar);
        fila.appendChild(celdaAcciones);

        // Agregar fila a la tabla
        tabla.appendChild(fila);
    }
}

function borrarRecurso(id){
    //Borro en la BD
    rest.delete("/api/recursos/" + id, function (estado, respuesta) {
        
        if (estado == 200) {
            // asumimos que el servidor devuelve el array actualizado,lo hago asi no hay incongruencias con la BD
            recursos = respuesta;
            //vuelvo a imprimir la tabla
            imprimir(traducirRecursos(recursos));

        } else {
            alert(respuesta);
        }
    });
}

function modificarRecurso(id){
    cambiarSeccion("recursos");
    //consigo el recurso que se va a modificar
    var recurso;
    for(let i = 0; i < recursos.length ; i++){
        if(recursos[i].id == id){
            recurso = recursos[i];
            break;
        }
    }

    //pongo los datos del recurso por pantalla
    document.getElementById("categoriaRecursos").value = recurso.categoria;
    document.getElementById("modeloRecursos").value = recurso.modelo;
    document.getElementById("ubicacionRecursos").value = recurso.ubicacion;
    document.getElementById("estadoRecursos").value = recurso.estado;
    document.getElementById("numero_serieRecursos").value = recurso.numero_serie;

    idModificado = id;

    //pedimos a la BD las reservas de este recurso en especifico
    rest.get("/api/recursos/" + id + "/reservas", function(estado, respuesta) {

        if (estado == 200) {
            imprimirReservas(respuesta);
        } else {
            alert(respuesta);
        }
    });

    //pedimos a la BD las reseñas de este recurso
    rest.get("/api/recursos/" + id + "/resenyas", function(estado, respuesta) {

        if (estado == 200) {
            imprimirResenyas(respuesta);
        } else {
            alert(respuesta);
        }
    });
    
}

function crearRecurso(){
    document.getElementById("tablaReservas").innerHTML="";
    document.getElementById("tablaResenyas").innerHTML="";
    document.getElementById("numero_serieRecursos").value="";
    cambiarSeccion('recursos');
    
}

//te carga los selects con categorias, ubicaciones y modelos, le tenes que pasar el id del select que queres que rellene
function cargarSelects(catId, ubiId, modId){

     //con bucles llenamos los selects
        for(let i = 0; i < categorias.length; i++){ 
            let option = document.createElement("option");
            option.value = categorias[i].id;
            option.textContent = categorias[i].nombre;
            document.getElementById(catId).appendChild(option);
        }

        for(let i = 0; i < ubicaciones.length; i++){ 
            let option = document.createElement("option");
            option.value = ubicaciones[i].id;
            option.textContent = ubicaciones[i].nombre;
            document.getElementById(ubiId).appendChild(option);
        }

        for(let i = 0; i < modelos.length; i++){
            let option = document.createElement("option");
            option.value = modelos[i].id;
            option.textContent = modelos[i].nombre;
            document.getElementById(modId).appendChild(option);
        }
}

function guardar(){
    //conseguimos los valores del formulario
    var cat = document.getElementById("categoriaRecursos").value;
    var mod = document.getElementById("modeloRecursos").value;
    var num = document.getElementById("numero_serieRecursos").value;
    var ubi = document.getElementById("ubicacionRecursos").value;
    var est = parseInt(document.getElementById("estadoRecursos").value);

    var objeto = {"numero_serie": num, "categoria": cat, "modelo":mod, "ubicacion": ubi, "estado": est, "id":"nn"};

    //si hay un idModificado significa que estamos modificando un recurso, caso contrario lo estamos creando
    if(idModificado){
        //ahora lo envio al servidor
        rest.put("/api/recursos/" + idModificado, objeto, function (estado, respuesta) { 

            if (estado == 200) {
                alert("modificacion de recurso exitosa");
                //actualizo los recursos
                recursos = respuesta;
            } else {
                alert("Error introduciendo nuevo gestor");
            }

            //actualizamos la tabla del inicio
            imprimir(traducirRecursos(recursos));

            //quito el idModificado para saber que no estamos modificando un dato
            idModificado = null;
        });

    }else{
        //envio al servidor el recurso nuevo
        rest.post("/api/recursos", objeto, function (estado, respuesta) { 

            if (estado == 200) {
                alert("Recurso creado con éxito");
                //actualizo los recursos
                recursos = respuesta[1];
                recursoCreadoWS(respuesta[0].id);
            } else {
                alert("Error introduciendo nuevo recurso");
            }

            //actualizamos la tabla del inicio
            imprimir(traducirRecursos(recursos));

        });
    }
}

function imprimirReservas(reservas){
    //limpiamos la tabla
    let tabla = document.getElementById("tablaReservas");
    tabla.innerHTML ="";

    for(let i = 0; i < reservas.length; i++){
        let reserva = reservas[i];
        // Crear fila
        let fila = document.createElement("tr");

        // Crear celdas y llenarlas
        for (let key in reserva) {
            //imprimo todo menos el id
            if (key === "id" || key === "recurso") continue;

            const celda = document.createElement("td");
            if(key === "fecha_peticion" || key == "fecha_inicio" || key == "fecha_fin"){
                celda.textContent = formatearFecha(reserva[key]);
            }else{
                celda.textContent = reserva[key];
            }   
            fila.appendChild(celda);
        }

        pintarFila(fila,reserva);
        // Agregar fila a la tabla
        tabla.appendChild(fila);

    }
        
}

function formatearFecha(fechaISO) {
    if (!fechaISO) return null;

    const fecha = new Date(fechaISO);

    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = String(fecha.getFullYear()).slice(-2);
    const hora = String(fecha.getHours()).padStart(2, '0');
    const minutos = String(fecha.getMinutes()).padStart(2, '0');
    const segundos = String(fecha.getSeconds()).padStart(2, '0');

    return `${dia}/${mes}/${anio}\n${hora}:${minutos}:${segundos}`;
}

function pintarFila(fila, reserva){
    var ahora = new Date().toISOString().split('.')[0];

    //EL RECURSO ESTÁ en uso?
    if(reserva.fecha_inicio < ahora && reserva.fecha_fin == null){

        //tenemos que pasarlos a tipo date() para poder restarlos
        var inicio = new Date(reserva.fecha_inicio);

        var diferencia = new Date() - inicio;  

        // Pasar a horas
        const diferenciaHoras = diferencia / (1000 * 60 * 60);

        if(diferenciaHoras > reserva.horas_estimadas){
            fila.style.backgroundColor = "red";
        }else{
            fila.style.backgroundColor = "blue";
        }

    }else if(reserva.fecha_fin < ahora){
        fila.style.backgroundColor = "white";
        
    }else if(reserva.fecha_inicio > ahora && reserva.fecha_fin == null){
        fila.style.backgroundColor = "green";
    }
}

function imprimirResenyas(resenyas){
    //limpiamos la tabla
    let tabla = document.getElementById("tablaResenyas");
    tabla.innerHTML ="";

    for(let i = 0; i < resenyas.length; i++){
        let resenya = resenyas[i];
        // Crear fila
        let fila = document.createElement("tr");

        // Crear celdas y llenarlas
        for (let key in resenya) {
            const celda = document.createElement("td");

            //imprimo todo menos el id
            if (key === "id" || key === "recurso") continue;
            if(key == "fecha"){
                celda.textContent = formatearFecha(resenya[key]);  
            }else{
                celda.textContent = resenya[key];  
            }
            fila.appendChild(celda);
        }

        // Agregar fila a la tabla
        tabla.appendChild(fila);

    }
}

function crearArea(){
    var cp = document.getElementById("cp").value;
    var nombre = document.getElementById("nombreArea").value;
    var area = {"cp":cp, "nombre":nombre, "gestor":usuarioLogeado.id};
    console.log(area);
    rest.post("/api/area_salud", area,function (estado, respuesta) {

       if(estado == 500){
        alert("Ya hay un área con ese código postal");
       }else{
        alert("área creada");
       }
    }); 
}