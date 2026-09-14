'use strict';

// MODULO 1 · Listado y alta de tickets
// Este archivo es el unico modulo que viene resuelto: sirve de ejemplo del
// contrato que los demas modulos tienen que respetar.

const express = require('express');
const { bd } = require('../db');

const router = express.Router();

const AREAS = ['Almacen', 'Comercial', 'Contabilidad', 'Administracion'];
const PRIORIDADES = { A: 'Alta', M: 'Media', B: 'Baja' };

function ahora() {
  return new Date().toISOString();
}

function validarTicket(datos) {
  const errores = [];
  if (!datos.titulo || datos.titulo.trim().length < 5) {
    errores.push('El titulo es obligatorio y debe tener al menos 5 caracteres.');
  }
  if (AREAS.indexOf(datos.area) === -1) {
    errores.push('El area no es valida.');
  }
  if (!PRIORIDADES[datos.prioridad]) {
    errores.push('La prioridad debe ser A, M o B.');
  }
  return errores;
}

function leerFormulario(req) {
  return {
    titulo:      (req.body.titulo || '').trim(),
    descripcion: (req.body.descripcion || '').trim(),
    area:        (req.body.area || '').trim(),
    prioridad:   (req.body.prioridad || 'M').trim()
  };
}

router.get('/', function (req, res, next) {
  bd.all(
    'SELECT * FROM ticket WHERE anulado = 0 ORDER BY creado_en DESC LIMIT 200',
    [],
    function (err, filas) {
      if (err) return next(err);
      res.render('tickets/listado', {
        titulo: 'Tickets', tickets: filas, PRIORIDADES: PRIORIDADES
      });
    }
  );
});

router.get('/nuevo', function (req, res) {
  res.render('tickets/formulario', {
    titulo: 'Nuevo ticket', ticket: { prioridad: 'M' }, errores: [], AREAS: AREAS
  });
});

router.post('/nuevo', function (req, res, next) {
  const datos = leerFormulario(req);
  const errores = validarTicket(datos);
  if (errores.length) {
    return res.render('tickets/formulario', {
      titulo: 'Nuevo ticket', ticket: datos, errores: errores, AREAS: AREAS
    });
  }
  bd.run(
    `INSERT INTO ticket
       (titulo, descripcion, area, prioridad, situacion, anulado, creado_por, creado_en)
     VALUES (?, ?, ?, ?, 'ABIERTO', 0, ?, ?)`,
    [datos.titulo, datos.descripcion, datos.area, datos.prioridad, req.usuario, ahora()],
    function (err) {
      if (err) return next(err);
      res.redirect('/tickets');
    }
  );
});

module.exports = router;
module.exports.AREAS = AREAS;
module.exports.PRIORIDADES = PRIORIDADES;
