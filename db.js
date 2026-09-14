'use strict';

const path = require('path');
const sqlite3 = require('sqlite3');

const RUTA_BD = path.join(__dirname, 'var', 'db', 'mesa.db');
const bd = new sqlite3.Database(RUTA_BD);

// El esquema se crea si no existe. Las columnas nuevas se agregan con ALTER
// TABLE ignorando el error de columna duplicada, para que las bases que ya
// estan en uso migren solas.
function inicializar(listo) {
  bd.serialize(function () {
    bd.run(`
      CREATE TABLE IF NOT EXISTS ticket (
        id               INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo           TEXT    NOT NULL,
        descripcion      TEXT,
        area             TEXT    NOT NULL,
        prioridad        TEXT    NOT NULL DEFAULT 'M',
        situacion        TEXT    NOT NULL DEFAULT 'ABIERTO',
        asignado_a       TEXT,
        anulado          INTEGER NOT NULL DEFAULT 0,
        creado_por       TEXT    NOT NULL,
        creado_en        TEXT    NOT NULL,
        actualizado_por  TEXT,
        actualizado_en   TEXT
      )
    `, function (err) {
      if (err) return listo(err);
      listo(null);
    });
  });
}

module.exports = { bd, inicializar, RUTA_BD };
