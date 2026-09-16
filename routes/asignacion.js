'use strict';

// MODULO A · Asignacion y cambio de situacion
// Permite abrir el detalle de un ticket, asignarselo a alguien del equipo de
// TI y cambiar su situacion. Se monta bajo /tickets junto con los demas
// modulos, por eso el parametro :id se restringe a digitos: asi no captura
// rutas hermanas como /tickets/nuevo o /tickets/buscar.

const express = require('express');
const { bd } = require('../db');
const { PRIORIDADES } = require('./tickets');

const router = express.Router();

// Lista fija del equipo de TI. Mientras no exista login ni tabla de usuarios,
// vive aqui.
const EQUIPO_TI = ['victor', 'oscar', 'luis', 'martin'];
const SITUACIONES = ['ABIERTO', 'EN CURSO', 'RESUELTO'];

function ahora() {
  return new Date().toISOString();
}

// Busca un ticket vigente (anulado = 0). Si no existe o esta anulado, la
// fila llega vacia y el llamador responde 404.
function buscarTicket(id, listo) {
  bd.get('SELECT * FROM ticket WHERE id = ? AND anulado = 0', [id], listo);
}

function responderNoEncontrado(res) {
  res.status(404).render('error', {
    titulo: 'Ticket no encontrado',
    mensaje: 'El ticket solicitado no existe o ya no esta disponible.'
  });
}

function leerFormulario(req) {
  return {
    asignadoA: (req.body.asignado_a || '').trim(),
    situacion: (req.body.situacion || '').trim()
  };
}

// Valida los datos del formulario contra el ticket actual. La regla de
// negocio importante: un RESUELTO no vuelve a ABIERTO, solo a EN CURSO.
function validarCambio(ticket, datos) {
  const errores = [];
  if (EQUIPO_TI.indexOf(datos.asignadoA) === -1) {
    errores.push('El asignado debe ser alguien del equipo de TI.');
  }
  if (SITUACIONES.indexOf(datos.situacion) === -1) {
    errores.push('La situacion debe ser ABIERTO, EN CURSO o RESUELTO.');
  }
  if (ticket.situacion === 'RESUELTO' && datos.situacion === 'ABIERTO') {
    errores.push('Un ticket RESUELTO no puede volver a ABIERTO: solo puede pasar a EN CURSO.');
  }
  return errores;
}

function renderizarDetalle(res, ticket, errores, datos) {
  res.render('asignacion/detalle', {
    titulo: 'Ticket #' + ticket.id,
    ticket: ticket,
    errores: errores,
    // Lo que el usuario eligio en el formulario, para no perderlo al mostrar
    // un error de validacion. Si no hay envio previo, se usa lo del ticket.
    formulario: datos || { asignadoA: ticket.asignado_a || '', situacion: ticket.situacion },
    EQUIPO_TI: EQUIPO_TI,
    SITUACIONES: SITUACIONES,
    PRIORIDADES: PRIORIDADES
  });
}

router.get('/:id(\\d+)', function (req, res, next) {
  buscarTicket(req.params.id, function (err, ticket) {
    if (err) return next(err);
    if (!ticket) return responderNoEncontrado(res);
    renderizarDetalle(res, ticket, []);
  });
});

router.post('/:id(\\d+)/atender', function (req, res, next) {
  buscarTicket(req.params.id, function (err, ticket) {
    if (err) return next(err);
    if (!ticket) return responderNoEncontrado(res);

    const datos = leerFormulario(req);
    const errores = validarCambio(ticket, datos);
    if (errores.length) {
      return renderizarDetalle(res, ticket, errores, datos);
    }

    bd.run(
      `UPDATE ticket
          SET asignado_a = ?, situacion = ?, actualizado_por = ?, actualizado_en = ?
        WHERE id = ? AND anulado = 0`,
      [datos.asignadoA, datos.situacion, req.usuario, ahora(), ticket.id],
      function (err) {
        if (err) return next(err);
        res.redirect('/tickets/' + ticket.id);
      }
    );
  });
});

module.exports = router;
module.exports.EQUIPO_TI = EQUIPO_TI;
module.exports.SITUACIONES = SITUACIONES;
