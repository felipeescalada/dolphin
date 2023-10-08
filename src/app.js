import express from 'express';
import winston from 'winston';
import bodyParser from 'body-parser';
import { pool } from './db.js';
import {PORT} from './config.js';


//var bodyParser = require('body-parser');
const app = express();

app.use(express.bodyParser);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

//cross domain.
var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', '"GET,PUT,PATCH,POST,DELETE"');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
}
//const winston2 = winston();
const logger = winston.createLogger({
  level: "info",
  format: winston.format.simple(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logs/app.log" }),
  ],
});

app.use(allowCrossDomain);

//felipe cambios domingo 08 oct 2023.

app.get('/alumnos', async (req, res) => {
  const [rows] = await pool.query('select idAlumno,Nombre,Apellido,last_update,substring(FechaNac,1,10) FechaNac,'+
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

    connection.query('select idAlumno,Nombre,Apellido,last_update,substring(FechaNac,1,10) FechaNac,'+
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

app.post('/api/getusuario23', (req, res) => {
  logger.log("info", "Request received en el body:" + req.body +"//", req.body);
  //const [rows] = await pool.query('SELECT * FROM user WHERE Username="' + req.body.usuario +'"');
  //res.json(req.body);
  res.send({ status: 'SUCCESS' });
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
