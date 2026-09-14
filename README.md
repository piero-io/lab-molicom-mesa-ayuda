# Mesa de ayuda de TI

Laboratorio de la **Sesión 6** del programa Claude Code Professional. Es el
esqueleto de una mesa de ayuda interna: base de datos, servidor, layout y el
módulo de listado y alta ya resueltos.

Los cuatro módulos que faltan están descritos en `ESPECIFICACION.md` y se
construyen **en paralelo, delegando en subagentes**.

## Cómo se levanta

```
npm install
npm run seed
npm start
```

Abre `http://localhost:3000`. La base se crea sola en `var/db/mesa.db` y
`npm run seed` la carga con diez tickets de ejemplo.

## Qué trae ya resuelto

```
app.js                       Express, middleware, punto de integración
db.js                        Conexión a SQLite y esquema
seed.js                      Carga inicial de datos de ejemplo
routes/tickets.js            Módulo 1: listado y alta (el ejemplo del contrato)
views/                       Layout, error y vistas del módulo 1
public/css/estilos.css       Estilos
CLAUDE.md                    Las reglas del proyecto
ESPECIFICACION.md            Los cuatro módulos pendientes
.claude/settings.json        Permisos del proyecto
```

## Nota

Material de capacitación de LILAB. No contiene código ni datos de ningún
cliente: los tickets del ejemplo son ficticios.
