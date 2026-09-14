'use strict';

const path = require('path');
const express = require('express');
const { inicializar } = require('./db');

const app = express();
const PUERTO = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Mientras no exista login, el usuario de la sesion se simula aqui.
// Todo lo que se escribe en la base tiene que quedar firmado con este valor.
app.use(function (req, res, next) {
  req.usuario = 'jperez';
  res.locals.usuario = req.usuario;
  next();
});

// ---------------------------------------------------------------------------
// PUNTO DE INTEGRACION
// Aqui se montan los modulos. Cada modulo vive en su propio archivo dentro de
// routes/ y expone un router de Express. Este bloque lo escribe el agente
// principal al integrar, no los subagentes.
// ---------------------------------------------------------------------------
app.use('/tickets', require('./routes/tickets'));
// app.use('/tickets', require('./routes/asignacion'));
// app.use('/tickets', require('./routes/busqueda'));
// app.use('/panel',   require('./routes/panel'));
// app.use('/export',  require('./routes/exportacion'));

app.get('/', function (req, res) {
  res.redirect('/tickets');
});

// Manejador central de errores: al registro va todo, al usuario un mensaje
// generico. Nunca se le muestra al usuario el detalle tecnico.
app.use(function (err, req, res, next) {
  console.error('[error]', req.method, req.originalUrl, err);
  res.status(500).render('error', {
    titulo: 'Error',
    mensaje: 'No se pudo completar la operacion. Intentalo nuevamente.'
  });
});

inicializar(function (err) {
  if (err) throw err;
  app.listen(PUERTO, function () {
    console.log('Mesa de ayuda en http://localhost:' + PUERTO);
  });
});
