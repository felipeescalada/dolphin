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
