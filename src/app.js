import express from 'express';
import bodyParser from 'body-parser';
import { pool } from './db.js';
import { PORT } from './config.js';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import { join } from 'path';

const directorioActual = process.cwd(); // Obtiene el directorio de trabajo actual
express.urlencoded({ extended: true });
console.log(`Directorio actual: ${directorioActual}`);

fs.promises.readdir(directorioActual)
  .then((files) => {
    console.log('Archivos y directorios en el directorio actual:');
    files.forEach((file) => {
      console.log(file);
    });
  })
  .catch((err) => {
    console.error('Error al leer el directorio:', err);
  });


const app = express();
//const __filename = fileURLToPath(import.meta.url);
//const __dirname = dirname(__filename);

app.use(bodyParser.json());

//este es cors
app.use(cors({
  origin: '*'
}));
//app.use(bodyParser.urlencoded({ extended: true }))

//cross domain.
var allowCrossDomain = function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', '"GET,PUT,PATCH,POST,DELETE"');

  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, contentType,Content-Type, Accept, Authorization");
  next();
}
//const winston2 = winston();



const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '/files/');
  },
  filename: (req, file, cb) => {
    // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    //const uniqueSuffix = Date.now() + '-' + req.body.xfile;
    const uniqueSuffix = req.body.xfile;
    const originalName = file.originalname;
    const extension = originalName.split('.')[1];
    cb(null, `${file.fieldname}-${uniqueSuffix}`);
    //cb(null, `${file.fieldname}-${uniqueSuffix}.${extension}`);
  },
});


const fileUpload = multer({
  storage: storage,
  limits: {
    // Establece el límite de tamaño en bytes (en este ejemplo, 10 megabytes)
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});

const upload = multer({ storage: storage });



app.use(bodyParser.urlencoded({ extended: true }))


app.use(allowCrossDomain);

//felipe cambios domingo 08 oct 2023.

app.get('/alumnos', async (req, res) => {
  const [rows] = await pool.query('select idAlumno,Nombre,Apellido,last_update,substring(FechaNac,1,10) FechaNac,' +
    ' idSede,idCurso,Estado,Email,Sexo,coalesce(idprovincia,0) idprovincia,' +
    ' coalesce(iddistrito,0) iddistrito,coalesce(idcorregimiento,0) idcorregimiento,Direccion,telefono,idpais from alumnos');
  res.json(rows);
})


app.route("/test234").post( async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM user WHERE Username="felipe"');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error del servidor');
  }
});
 

app.route("/test").post(
 
  upload.single("file"), function (req, res)
  {
  console.log('fnombre:' + req.body.xfile);
  if (req.file) {
    console.log('El archivo se ha subido correctamente.');
    console.log('Ubicación de guardado: ' + req.file.path);
  } else {
    console.log('No se ha subido ningún archivo.');
  }
  res.send(req.file);
  }


);

app.get('/imagen/:nombreImagen',  (req, res) => {
  const nombreImagen = req.params.nombreImagen;
  const rutaImagen = join('/files/' , nombreImagen);
  console.error('comienza servir la imagen:');
  // Sirve la imagen al navegador
  //res.sendFile(rutaImagen); 
   try {
    console.error('ok-imagen:');
    // Sirve la imagen al navegador
    res.sendFile(rutaImagen);
  } catch (error) {
    console.error('Error al servir la imagen:', error);
    res.status(500).send('Error al cargar la imagen');
  }
});


app.post('/api/getusuario', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM user WHERE Username="felipe"');
  res.json(rows);
});


app.post('/documentos', async (req, res) => {
  const [rows] = await pool.query('select id,idtercero, tipodoc, path1, path2  from documentos;');
  res.json(rows);
});


app.post('/familiares', async (req, res) => {
  const [rows] = await pool.query('select id,idtercero, tipodoc, path1, path2  from documentos;');
  res.json(rows);
});




app.post('/api/usuarios', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM user');
  res.json(rows);
});


app.get('/alumnos2', (req, res) => {

  pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log(`#-Conectado como el ID ${connection.threadId}`);

    connection.query('select idAlumno,Nombre,Apellido,last_update,substring(FechaNac,1,10) FechaNac,' +
      ' idSede,idCurso,Estado,Email,Sexo,coalesce(idprovincia,0) idprovincia,' +
      ' coalesce(iddistrito,0) iddistrito,coalesce(idcorregimiento,0) idcorregimiento,Direccion,telefono,idpais from alumnos', (err, rows) => {
        connection.release(); // Devolver la conexión al pool

        if (err) throw err;
        res.send(rows);
      });
  });
});

app.get('/usuarios2', (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log(`usuarios ${connection.threadId}`);

    connection.query('SELECT * FROM user', (err, rows) => {
      connection.release(); // Devolver la conexión al pool

      if (err) throw err;
      res.send(rows);
    });
  });
});

app.post('/api/getusuario23', async (req, res) => {

  const [rows] = await pool.query('SELECT * FROM user WHERE Username="' + req.body.usuario + '"');

  res.json(rows);
  //res.send({ status: req.body });
});


app.post('/api/getusuario2', (req, res) => {
  pool.getConnection((err, connection) => {

    console.log(`SELECT * FROM user WHERE Username="${req.body.usuario}"`);
    if (err) throw err;
    // console.log(`usuarios ${connection.threadId}`);
    // console.log('usuarios:' + req.body.usuario);
    connection.query(`SELECT * FROM user WHERE Username="${req.body.usuario}"`, (err, rows) => {
      connection.release(); // Devolver la conexión al pool

      if (err) throw err;
      res.send(rows);
    });
  });
});
//




app.get('/', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM users')
  res.json(rows)

})

app.get('/terceros', async (req, res) => {
  const [rows] = await pool.query('select idtercero,razonsocial,nit,direccionfiscal,direccion ' +
    'idciudad,naturaleza,autoretenedor,estado,pnombre,snombre,papellido,sapellido,' +
    ' coalesce(idprovincia,0) idprovincia,' +
    ' coalesce(iddistrito,0) iddistrito,coalesce(idcorregimiento,0) idcorregimiento ,' +
    ' idlista from tercero');

  res.json(rows);


});

app.post('/productos', async (req, res) => {
  const [rows] = await pool.query('select * from productos order by item');

  res.json(rows);


});

app.get('/paginaproductos', async (req, res) => {

  console.log("get:" );
  const { page, itemsPerPage, search } = req.query;
  const offset = (page - 1) * itemsPerPage;
  let query = 'SELECT * FROM productos';

  if (search=="*") {
     query += ` WHERE descripcion <> ''`; // Modifica esto según la estructura de tu base de datos
  }
  else
  {
    query += ` WHERE descripcion LIKE '%${search}%'`; 
  }

  console.log("------------");
  console.log(query);
  try {
    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

app.post('/paises', async (req, res) => {
  const [rows] = await pool.query('select * from pais ');

  res.json(rows);


});


app.post('/cajas', async (req, res) => {
  console.log("cajas server");
  const [rows] = await pool.query('select idcaja, nombre from  cajas');

  res.json(rows);


});

app.post('/cajasmov', async (req, res) => {
  console.log("cajas server");
  const [rows] = await pool.query('select idCajaMov, Nombre,last_update,FechaCreacion,FechaCierre,SaldoInicial,Ingreso,Egreso,Saldo,idCaja,idUser from cajasmov where idcaja=' + req.body.pidcaja);


  res.json(rows);


});


app.post('/provincia', async (req, res) => {
  console.log("get provincia");
  const [rows] = await pool.query('select idprovincia iddato, nombre datonombre from provincia');
  res.json(rows);
});


app.post('/getprovincia', async (req, res) => {
  console.log("get provincia");
  const [rows] = await pool.query('select idprovincia , nombre  from provincia');
  res.json(rows);
});


app.post('/distrito', async (req, res) => {
  console.log("get distrito:" + req.body.idprovincia);
  const [rows] = await pool.query('select iddistrito,nombre from distrito where idprovincia =' + req.body.idprovincia);
  res.json(rows);
});

app.post('/sedes2', async (req, res) => {
  console.log("get sedes:" );
  const [rows] = await pool.query('select idsede , nombre  from sedes');
  res.json(rows);
});



app.post('/sedes', async (req, res) => {
  try {
    console.log("sedes:");
    const [rows] = await pool.query('select idsede iddato, nombre datonombre from sedes');
    res.json(rows);
  } catch (error) {
    console.error(" 1 Error al consultar la base de datos:", error);
    res.status(500).json({ error: "Ocurrió un error al procesar la solicitud." });
  }
});

app.post("/api/alumnos/update",async (req, res) => {
  try {
    console.log("update##:" + req.body.ppais);
var queryalumnos = "update alumnos set " +
"Nombre='" + req.body.pNombre + "'," +
"Apellido='" + req.body.pApellido + "'," +
"FechaNac='" + req.body.pFechaNac + "'," +
"idSede='" + req.body.pidSede + "'," +
"idCurso='" + req.body.pidCurso + "'," +
"Estado='" + req.body.pEstado + "'," +
"Email='" + req.body.pEmail + "'," +
"Sexo='" + req.body.pSexo + "'," +
"idprovincia='" + req.body.pidprovincia + "'," +
"iddistrito='" + req.body.piddistrito + "'," +
"idcorregimiento='" + req.body.pidcorregimiento + "'," +
"Direccion='" + req.body.pDireccion + "'," +
"telefono='" + req.body.ptelefono + "'," +
"idpais='" + req.body.ppais + "'" +    
 " where idAlumno=" + req.body.pidAlumno + ";";
 const [rows] = await pool.query(queryalumnos);
 res.json(rows);
 } catch (error) {
   console.error(" 1 Error al consultar la base de datos:", error);
   res.status(500).json({ error: "Ocurrió un error al procesar la solicitud." });
 }
 });
 
 app.post("/api/query",async (req, res) => {
  try {
    console.log("req.body.#1#:" + req.body.pquery);

 const [rows] = await pool.query(req.body.pquery);
 res.json(rows);
 } catch (error) {
   console.error(" 1 Error al consultar la base de datos:", error);
   res.status(500).json({ error: "Ocurrió un error al procesar la solicitud." });
 }
 });

app.post("/api/alumnos/add", async (req, res) => {
  try {
    console.log("ADD:");
var queryalumnos = " insert into alumnos(" +
"Nombre," +
"Apellido," +
"FechaNac," +
"idSede," +
"idCurso," +
"Estado," +
"Email," +
"Sexo," +
"idprovincia," +
"iddistrito," +
"idcorregimiento," +
"Direccion," +
"telefono,idpais" +
") values ('" +
req.body.pNombre + "','" +
req.body.pApellido + "','" +
req.body.pFechaNac + "','" +
req.body.pidSede + "','" +
req.body.pidCurso + "','" +
req.body.pEstado + "','" +
req.body.pEmail + "','" +
req.body.pSexo + "','" +
req.body.pidprovincia + "','" +
req.body.piddistrito + "','" +
req.body.pidcorregimiento + "','" +
req.body.pDireccion + "','" +
req.body.ptelefono + "','" +
req.body.ppais + "')";
const [rows] = await pool.query(queryalumnos);
res.json(rows);
} catch (error) {
  console.error(" 1 Error al consultar la base de datos:", error);
  res.status(500).json({ error: "Ocurrió un error al procesar la solicitud." });
}
});


app.get('/sedes2', async (req, res) => {
  console.log("sedes:");
  const [rows] = await pool.query('select idsede , nombre  from sedes');
  res.json(rows);
});

app.post('/getpais', async (req, res) => {

   
    var querysql ='';
   
    if  (req.body.codigo =="0")
    {
      querysql = 'select idpais iddato,nombre datonombre from pais;';
      console.log('#sin definir');
    }
    else
    {
      querysql = 'select idpais ,nombre  from pais where idpais="' + req.body.codigo +'"';
      console.log('#codigo pais:' + req.body.codigo);
    }
    const [rows] = await pool.query(querysql);
    res.json(rows);

});


app.post('/cursos', async (req, res) => {
  console.log("cursos:");
  const [rows] = await pool.query('select idcurso iddato, nombre datonombre from cursos');
  res.json(rows);
});

app.get('/proveedores', async (req, res) => {
  console.log("cursos:");
  const [rows] = await pool.query('select idtercero,razonsocial,nit,direccionfiscal,direccion ' +
    'idciudad,naturaleza,autoretenedor,estado,pnombre,snombre,papellido,sapellido,' +
    ' coalesce(idprovincia,0) idprovincia,' +
    ' coalesce(iddistrito,0) iddistrito,coalesce(idcorregimiento,0) idcorregimiento ,' +
    ' idlista from tercero where idtercero in(select idtercero from tercat where idcategoria="PRO")');
  res.json(rows);
});

app.get('/profesores', async (req, res) => {
  console.log("cursos:");
  const [rows] = await pool.query('select idtercero,razonsocial,nit,direccionfiscal,direccion ' +
    'idciudad,naturaleza,autoretenedor,estado,pnombre,snombre,papellido,sapellido,' +
    ' coalesce(idprovincia,0) idprovincia,' +
    ' coalesce(iddistrito,0) iddistrito,coalesce(idcorregimiento,0) idcorregimiento ,' +
    ' idlista from tercero where idtercero in(select idtercero from tercat where idcategoria="PROF")');
  res.json(rows);
});



app.post('/corregimiento', async (req, res) => {
  console.log("get distrito");
  const [rows] = await pool.query('select idcorregimiento,nombre from corregimiento where iddistrito =' + req.body.iddistrito
  );
  res.json(rows);
});









app.get('/ping', async (req, res) => {
  console.log("ping 2");
  const [result] = await pool.query(`SELECT "Server Dolphin ERP" as RESULT`);
  res.json(result[0]);
})
app.post('/ping24', async (req, res) => {
  console.log("ping 3");
  const [result] = await pool.query(`SELECT "ERP Dolphin 2.0" as RESULT`);
  res.json(result[0]);
})


app.get('/create', async (req, res) => {
  const result = await pool.query('INSERT INTO user(name) VALUES ("John")')
  res.json(result)
})

app.listen(PORT)
console.log('Server on port Verificado ***:', PORT)
