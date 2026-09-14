'use strict';

const { bd, inicializar } = require('./db');

const TICKETS = [
  ['No imprime la guia de remision',        'La impresora del almacen no responde desde ayer.', 'Almacen',      'A', 'ABIERTO',    'victor'],
  ['Excel de ventas se cuelga al abrir',    'El archivo de cierre mensual pesa mucho.',         'Comercial',    'M', 'EN CURSO',   'oscar'],
  ['Solicitud de acceso al ERP',            'Nuevo asistente contable necesita perfil lectura.','Contabilidad', 'B', 'ABIERTO',    null],
  ['Correo no sincroniza en el celular',    'Solo pasa fuera de la oficina.',                   'Comercial',    'B', 'RESUELTO',   'luis'],
  ['Lentitud en el sistema de pedidos',     'Entre 11 y 12 se pone muy lento.',                 'Comercial',    'A', 'EN CURSO',   'victor'],
  ['Cambio de tonner impresora contable',   'Aviso de tonner bajo desde el lunes.',             'Contabilidad', 'B', 'ABIERTO',    null],
  ['Restaurar respaldo de marzo',           'Se necesita para una revision de auditoria.',      'Contabilidad', 'A', 'ABIERTO',    'oscar'],
  ['Teclado malogrado en recepcion',        'Varias teclas no responden.',                      'Administracion','B','RESUELTO',   'luis'],
  ['Configurar VPN a un proveedor',         'Acceso al portal de un proveedor nuevo.',          'Comercial',    'M', 'ABIERTO',    null],
  ['Reporte de stock no cuadra',            'Diferencia entre el sistema y el conteo fisico.',  'Almacen',      'A', 'EN CURSO',   'victor']
];

inicializar(function (err) {
  if (err) throw err;
  const ahora = new Date().toISOString();
  const stmt = bd.prepare(`
    INSERT INTO ticket
      (titulo, descripcion, area, prioridad, situacion, asignado_a, anulado, creado_por, creado_en)
    VALUES (?, ?, ?, ?, ?, ?, 0, 'carga_inicial', ?)
  `);
  TICKETS.forEach(function (t) {
    stmt.run(t[0], t[1], t[2], t[3], t[4], t[5], ahora);
  });
  stmt.finalize(function () {
    console.log('Base cargada con ' + TICKETS.length + ' tickets.');
    bd.close();
  });
});
