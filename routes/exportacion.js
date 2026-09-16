'use strict';

// MODULO D · Exportacion a CSV
// Descarga los tickets vigentes como CSV para abrirlos en Excel. Respeta los
// mismos filtros del modulo de busqueda si vienen en la URL (q, area,
// prioridad, situacion). Solo lee la base: nunca escribe.
//
// Se monta en app.js con app.use('/export', require('./routes/exportacion')),
// asi que la ruta completa queda en GET /export/tickets.csv.

const express = require('express');
const { bd } = require('../db');
const { AREAS, PRIORIDADES } = require('./tickets');

const router = express.Router();

const SITUACIONES = ['ABIERTO', 'EN CURSO', 'RESUELTO'];

// Excel en espanol espera punto y coma como separador y salto de linea CRLF.
// El BOM al inicio hace que reconozca el archivo como UTF-8 y no rompa las
// tildes ni las enies.
const BOM = '﻿';
const SEPARADOR = ';';
const SALTO = '\r\n';

// Encabezados que ve el usuario en la primera fila. Aqui si van tildes porque
// el archivo sale con BOM UTF-8 y Excel las muestra bien.
const ENCABEZADOS = [
  'Id', 'Título', 'Descripción', 'Área', 'Prioridad', 'Situación',
  'Asignado a', 'Creado por', 'Creado en', 'Actualizado por', 'Actualizado en'
];

// Escapa un valor para una celda del CSV. Los nulos salen vacios. Si el valor
// contiene el separador, comillas o saltos de linea, va entre comillas dobles
// y las comillas internas se duplican, como manda RFC 4180.
function escaparCampo(valor) {
  if (valor === null || valor === undefined) return '';
  const texto = String(valor);
  if (/[;"\r\n]/.test(texto)) {
    return '"' + texto.replace(/"/g, '""') + '"';
  }
  return texto;
}

function armarFila(campos) {
  return campos.map(escaparCampo).join(SEPARADOR);
}

// Convierte una fila de la tabla ticket en el arreglo de celdas, en el mismo
// orden de ENCABEZADOS. La prioridad sale como palabra, no como letra.
function filaDeTicket(t) {
  return [
    t.id,
    t.titulo,
    t.descripcion,
    t.area,
    PRIORIDADES[t.prioridad] || t.prioridad,
    t.situacion,
    t.asignado_a,
    t.creado_por,
    t.creado_en,
    t.actualizado_por,
    t.actualizado_en
  ];
}

// Arma el texto completo del CSV a partir de las filas de la base.
function generarCsv(tickets) {
  const lineas = [armarFila(ENCABEZADOS)];
  tickets.forEach(function (t) {
    lineas.push(armarFila(filaDeTicket(t)));
  });
  return BOM + lineas.join(SALTO) + SALTO;
}

// Lee los filtros de la URL y arma el WHERE con parametros. Los valores vacios
// o no validos se ignoran. El texto libre siempre va como parametro, nunca
// concatenado en el SQL. Es la misma logica del modulo de busqueda, replicada
// aqui para que este modulo no dependa de aquel archivo.
function armarFiltro(query) {
  const condiciones = ['anulado = 0'];
  const parametros = [];

  const q = (query.q || '').trim();
  if (q) {
    condiciones.push('(LOWER(titulo) LIKE ? OR LOWER(descripcion) LIKE ?)');
    const patron = '%' + q.toLowerCase() + '%';
    parametros.push(patron, patron);
  }

  const area = (query.area || '').trim();
  if (AREAS.indexOf(area) !== -1) {
    condiciones.push('area = ?');
    parametros.push(area);
  }

  const prioridad = (query.prioridad || '').trim();
  if (PRIORIDADES[prioridad]) {
    condiciones.push('prioridad = ?');
    parametros.push(prioridad);
  }

  const situacion = (query.situacion || '').trim();
  if (SITUACIONES.indexOf(situacion) !== -1) {
    condiciones.push('situacion = ?');
    parametros.push(situacion);
  }

  return { where: condiciones.join(' AND '), parametros: parametros };
}

// GET /export/tickets.csv
// Sin limite de filas: la exportacion sirve justamente para llevarse todo lo
// que cumple el filtro. El volumen de la mesa es chico, asi que se responde
// con el texto completo de una vez.
router.get('/tickets.csv', function (req, res, next) {
  const filtro = armarFiltro(req.query);
  bd.all(
    'SELECT * FROM ticket WHERE ' + filtro.where + ' ORDER BY creado_en DESC',
    filtro.parametros,
    function (err, filas) {
      if (err) return next(err);
      res.set('Content-Type', 'text/csv; charset=utf-8');
      res.set('Content-Disposition', 'attachment; filename="tickets.csv"');
      res.send(generarCsv(filas));
    }
  );
});

module.exports = router;
// Se exponen para poder probarlos sin levantar el servidor.
module.exports.escaparCampo = escaparCampo;
module.exports.armarFiltro = armarFiltro;
module.exports.generarCsv = generarCsv;
