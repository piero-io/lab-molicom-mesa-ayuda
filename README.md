# Mesa de ayuda de TI

Laboratorio del **Bloque 3** del programa Claude Code Professional. Es el
esqueleto de una mesa de ayuda interna: base de datos, servidor, layout y el
módulo de listado y alta ya resueltos.

El repositorio **no trae `CLAUDE.md` ni permisos**: eso es lo primero que se
escribe en la Sesión 6, y es la razón de que los agentes que construyan después
respeten un criterio.

La aplicación acompaña cuatro sesiones y va creciendo en cada una:

| Sesión | Qué le pasa |
|---|---|
| 06 · Subagentes | Se le escriben las reglas y **nace**: los cuatro módulos de `ESPECIFICACION.md` se construyen en paralelo, delegando |
| 07 · Skills | Lo que se repite a mano queda empaquetado y reutilizable |
| 08 · Spec Kit | La siguiente funcionalidad se hace guiada por especificación |
| 09 · Integraciones | Se conecta y se protege: hooks, pruebas y herramientas externas |

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
routes/tickets.js            Modulo 1: listado y alta (el ejemplo del contrato)
views/                       Layout, error y vistas del módulo 1
public/css/estilos.css       Estilos
ESPECIFICACION.md            Los cuatro módulos pendientes
```

## Nota

Material de capacitación de LILAB. No contiene código ni datos de ningún
cliente: los tickets del ejemplo son ficticios.
