import express from 'express'
import { pool } from './db.js'
import {PORT} from './config.js'

const app = express()
//cross domain.
var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', '"GET,PUT,PATCH,POST,DELETE"');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
}

app.use(allowCrossDomain);

//felipe cambios domingo 08 oct 2023.

app.get('/alumnos', (req, res) => {
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

app.get('/usuarios', (req, res) => {
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

app.post('/api/getusuario', (req, res) => {
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
  const [result] = await pool.query(`SELECT "hello world" as RESULT`);
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
