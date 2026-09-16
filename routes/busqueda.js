'use strict';

// MODULO B · Busqueda y filtros
// Busca tickets por texto en titulo y descripcion, y filtra por area,
// prioridad y situacion. Solo lectura: este modulo no escribe en la base.

const express = require('express');
const { bd } = require('../db');
const { AREAS, PRIORIDADES } = require('./tickets');

const router = express.Router();

const SITUACIONES = ['ABIERTO', 'EN CURSO', 'RESUELTO'];
const MAXIMO = 200;

// Lee los parametros de la URL y descarta los que no son validos: un filtro
// vacio o con un valor desconocido simplemente no filtra.
function leerFiltros(query) {
  const q = (query.q || '').trim();
  const area = (query.area || '').trim();
  const prioridad = (query.prioridad || '').trim();
  const situacion = (query.situacion || '').trim();
  return {
    q: q,
    area: AREAS.indexOf(area) !== -1 ? area : '',
    prioridad: PRIORIDADES[prioridad] ? prioridad : '',
    situacion: SITUACIONES.indexOf(situacion) !== -1 ? situacion : ''
  };
}

// Arma el WHERE con parametros posicionales. El texto nunca se concatena
// en el SQL: siempre viaja como parametro.
function armarConsulta(filtros) {
  const condiciones = ['anulado = 0'];
  const parametros = [];
  if (filtros.q) {
    // Los comodines de LIKE (% y _) se escapan para que el texto que escribe
    // el usuario se busque de forma literal.
    const texto = filtros.q.toLowerCase().replace(/[\\%_]/g, '\\$&');
    const patron = '%' + texto + '%';
    condiciones.push(
      "(LOWER(titulo) LIKE ? ESCAPE '\\' OR LOWER(descripcion) LIKE ? ESCAPE '\\')"
    );
    parametros.push(patron, patron);
  }
  if (filtros.area) {
    condiciones.push('area = ?');
    parametros.push(filtros.area);
  }
  if (filtros.prioridad) {
    condiciones.push('prioridad = ?');
    parametros.push(filtros.prioridad);
  }
  if (filtros.situacion) {
    condiciones.push('situacion = ?');
    parametros.push(filtros.situacion);
  }
  const sql = 'SELECT * FROM ticket WHERE ' + condiciones.join(' AND ') +
    ' ORDER BY creado_en DESC LIMIT ' + MAXIMO;
  return { sql: sql, parametros: parametros };
}

// Query string con los filtros vigentes, para reusarla en el enlace de
// exportacion a CSV (modulo D) con exactamente los mismos parametros.
function armarQueryString(filtros) {
  const partes = [];
  ['q', 'area', 'prioridad', 'situacion'].forEach(function (clave) {
    if (filtros[clave]) {
      partes.push(encodeURIComponent(clave) + '=' + encodeURIComponent(filtros[clave]));
    }
  });
  return partes.length ? '?' + partes.join('&') : '';
}

router.get('/buscar', function (req, res, next) {
  const filtros = leerFiltros(req.query);
  const consulta = armarConsulta(filtros);
  bd.all(consulta.sql, consulta.parametros, function (err, filas) {
    if (err) return next(err);
    res.render('busqueda/resultados', {
      titulo: 'Buscar tickets',
      tickets: filas,
      filtros: filtros,
      recortado: filas.length === MAXIMO,
      queryString: armarQueryString(filtros),
      AREAS: AREAS,
      PRIORIDADES: PRIORIDADES,
      SITUACIONES: SITUACIONES
    });
  });
});

module.exports = router;
module.exports.SITUACIONES = SITUACIONES;
