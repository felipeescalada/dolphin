import express from 'express';
import bodyParser from 'body-parser';
import { pool } from './db.js';
import { PORT } from './config.js';
import cors from 'cors';


const app = express();
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
  //res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, contentType,Content-Type, Accept, Authorization");
  next();
}
//const winston2 = winston();




app.use(bodyParser.urlencoded({ extended: true }))


app.use(allowCrossDomain);

//felipe cambios domingo 08 oct 2023.

app.get('/alumnos', async (req, res) => {
  const [rows] = await pool.query('select idAlumno,Nombre,Apellido,last_update,substring(FechaNac,1,10) FechaNac,' +
    ' idSede,idCurso,Estado,Email,Sexo,coalesce(idprovincia,0) idprovincia,' +
    ' coalesce(iddistrito,0) iddistrito,coalesce(idcorregimiento,0) idcorregimiento,Direccion,telefono,idpais from alumnos');
  res.json(rows);
})

app.post('/api/getusuario', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM user WHERE Username="felipe"');
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


app.post('/getprovincia', async (req, res) => {
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
  console.log("get distrito");
  const [rows] = await pool.query('select iddistrito,nombre from distrito where idprovincia =' + req.body.idprovincia);
  res.json(rows);
});








app.get('/ping', async (req, res) => {
  const [result] = await pool.query(`SELECT "Server Dolphin ERP" as RESULT`);
  res.json(result[0])
})
app.get('/ping23', async (req, res) => {
  const [result] = await pool.query(`SELECT "ERP Dolphin 2.0" as RESULT`);
  res.json(result[0])
})


app.get('/create', async (req, res) => {
  const result = await pool.query('INSERT INTO users(name) VALUES ("John")')
  res.json(result)
})

app.listen(PORT)
console.log('Server on port', PORT)
