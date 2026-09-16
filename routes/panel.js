'use strict';

// MODULO C · Panel de indicadores
// Resume el estado de la mesa de ayuda: tickets por situacion, area y
// prioridad, cuantos hay sin asignar y cual es el mas antiguo sin resolver.
// Es solo lectura: no escribe en la base. Las barras se dibujan con CSS a
// partir de un porcentaje calculado aqui, sin librerias de graficos.

const express = require('express');
const { bd } = require('../db');
const { AREAS, PRIORIDADES } = require('./tickets');

const router = express.Router();

const SITUACIONES = ['ABIERTO', 'EN CURSO', 'RESUELTO'];

// Clase de color de cada barra. Reusa la paleta de los chips del listado.
const COLOR_SITUACION = { 'ABIERTO': 'rojo', 'EN CURSO': 'ambar', 'RESUELTO': 'verde' };
const COLOR_PRIORIDAD = { A: 'rojo', M: 'ambar', B: 'gris' };

// Cuenta los tickets vigentes agrupados por una columna y devuelve un mapa
// { valor: cantidad }. La columna es una constante del codigo, nunca viene
// del usuario, por eso se puede interpolar en el SQL.
function contarPor(columna, listo) {
  bd.all(
    'SELECT ' + columna + ' AS clave, COUNT(*) AS cantidad' +
    '  FROM ticket WHERE anulado = 0 GROUP BY ' + columna,
    [],
    function (err, filas) {
      if (err) return listo(err);
      const conteo = {};
      filas.forEach(function (f) { conteo[f.clave] = f.cantidad; });
      listo(null, conteo);
    }
  );
}

// Arma la lista de barras de un grupo: etiqueta, cantidad, porcentaje respecto
// al maximo del grupo y clase de color. Las claves con 0 tambien se muestran.
function armarBarras(claves, conteo, etiquetaDe, colorDe) {
  const maximo = claves.reduce(function (m, c) {
    return Math.max(m, conteo[c] || 0);
  }, 0);
  return claves.map(function (clave) {
    const cantidad = conteo[clave] || 0;
    return {
      etiqueta:   etiquetaDe(clave),
      cantidad:   cantidad,
      porcentaje: maximo ? Math.round(cantidad * 100 / maximo) : 0,
      color:      colorDe(clave)
    };
  });
}

// Une la lista fija de areas con las que existan en la base, para que no se
// pierda ninguna si alguna vez se cargo un area fuera de la lista.
function clavesDeArea(conteo) {
  const extras = Object.keys(conteo).filter(function (a) {
    return AREAS.indexOf(a) === -1;
  }).sort();
  return AREAS.concat(extras);
}

// Ejecuta las consultas una tras otra y junta los resultados en un objeto,
// para no anidar cinco callbacks. Al primer error corta y lo devuelve.
function enSerie(tareas, listo) {
  const nombres = Object.keys(tareas);
  const resultados = {};
  (function siguiente(i) {
    if (i === nombres.length) return listo(null, resultados);
    tareas[nombres[i]](function (err, valor) {
      if (err) return listo(err);
      resultados[nombres[i]] = valor;
      siguiente(i + 1);
    });
  })(0);
}

// Pasa un ISO "2026-09-13T15:04:05.000Z" a "2026-09-13 15:04" para la vista.
function fechaLegible(iso) {
  if (!iso) return '-';
  return String(iso).replace('T', ' ').slice(0, 16);
}

router.get('/', function (req, res, next) {
  enSerie({
    porSituacion:  function (cb) { contarPor('situacion', cb); },
    porArea:       function (cb) { contarPor('area', cb); },
    porPrioridad:  function (cb) { contarPor('prioridad', cb); },
    resumen: function (cb) {
      bd.get(
        `SELECT COUNT(*) AS total,
                COALESCE(SUM(CASE
                  WHEN (asignado_a IS NULL OR asignado_a = '')
                   AND situacion <> 'RESUELTO' THEN 1 ELSE 0 END), 0) AS sin_asignar
           FROM ticket WHERE anulado = 0`,
        [],
        cb
      );
    },
    masAntiguo: function (cb) {
      bd.get(
        `SELECT id, titulo, area, situacion, creado_en
           FROM ticket
          WHERE anulado = 0 AND situacion <> 'RESUELTO'
          ORDER BY creado_en ASC LIMIT 1`,
        [],
        cb
      );
    }
  }, function (err, r) {
    if (err) return next(err);

    const masAntiguo = r.masAntiguo || null;
    if (masAntiguo) masAntiguo.creado_legible = fechaLegible(masAntiguo.creado_en);

    res.render('panel/indicadores', {
      titulo: 'Panel',
      total: r.resumen.total,
      sinAsignar: r.resumen.sin_asignar,
      masAntiguo: masAntiguo,
      situaciones: armarBarras(
        SITUACIONES, r.porSituacion,
        function (s) { return s; },
        function (s) { return COLOR_SITUACION[s]; }
      ),
      areas: armarBarras(
        clavesDeArea(r.porArea), r.porArea,
        function (a) { return a; },
        function () { return 'primario'; }
      ),
      prioridades: armarBarras(
        Object.keys(PRIORIDADES), r.porPrioridad,
        function (p) { return PRIORIDADES[p]; },
        function (p) { return COLOR_PRIORIDAD[p]; }
      )
    });
  });
});

module.exports = router;
