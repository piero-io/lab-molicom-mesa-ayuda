# Mesa de ayuda de TI

## 1. Qué es este proyecto

Mesa de ayuda interna del área de Tecnología. Los trabajadores registran
incidencias y pedidos, y el equipo de TI los atiende. Si se cae, las
incidencias vuelven al correo y se pierde el rastro de quién atendió qué.

## 2. En qué está escrito

Node con Express, vistas EJS y SQLite. Sin framework de front y sin proceso de
build: lo que está en `public/` se sirve tal cual.

## 3. Cómo se levanta y cómo se prueba

```
npm install
npm run seed     # solo la primera vez: carga diez tickets de ejemplo
npm start        # http://localhost:3000
```

No hay pruebas automatizadas. Se verifica levantando la aplicación y usándola.

## 4. Dónde vive cada cosa

| Qué | Dónde |
|---|---|
| Esquema y conexión | `db.js` |
| Punto de integración de los módulos | `app.js` |
| Un módulo por archivo | `routes/<modulo>.js` |
| Vistas | `views/<modulo>/` |
| Estilos | `public/css/estilos.css` |
| Base de datos | `var/db/mesa.db` (no se versiona) |

## 5. Convenciones de este proyecto

- Todo en español: tablas, columnas, variables, funciones y comentarios.
- Las columnas de la base van en `snake_case`; los identificadores de
  JavaScript en `camelCase`.
- Cada módulo expone un router de Express con `module.exports` y **no toca
  `app.js`**: el montaje lo hace el punto de integración.
- Toda escritura en la base registra quién y cuándo: `creado_por` y `creado_en`
  en el alta, `actualizado_por` y `actualizado_en` en la modificación. El
  usuario sale de `req.usuario`.
- Los errores se pasan a `next(err)`: el manejador central registra el detalle
  completo y al usuario le llega un mensaje genérico.
- Las vistas se arman con `include('../layout-cabecera')` y
  `include('../layout-pie')`.
- Las columnas nuevas se agregan con `ALTER TABLE` ignorando el error de
  columna duplicada, para que las bases en uso migren solas.

## 6. Lo que NUNCA se hace

- **Los tickets no se borran.** Se marcan con `anulado = 1`, y toda consulta
  filtra por `anulado = 0`.
- No se le muestra al usuario el mensaje técnico de un error.
- No se agregan dependencias nuevas: solo Express, EJS y sqlite3.
- No se recrea la base ni se borran datos para «dejarla limpia».
- No se escribe en la base sin llenar los campos de auditoría.
- Ningún módulo modifica archivos de otro módulo.

## 7. Las trampas de este repositorio

- `situacion` y `anulado` son cosas distintas y se confunden. `situacion` es
  del negocio: `ABIERTO`, `EN CURSO`, `RESUELTO`, y el usuario la cambia.
  `anulado` es el borrado lógico: `0` o `1`, y el usuario nunca lo ve. Cerrar
  un ticket **no** es eliminarlo.
- `prioridad` se guarda como una letra —`A`, `M`, `B`— y se muestra como
  palabra. El mapa está en `routes/tickets.js`.
- No hay login. El usuario está simulado en `app.js` con `req.usuario`.
- La base de `var/db/` no se versiona. Si la borras, se pierde.
