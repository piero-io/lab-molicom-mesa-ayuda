# Especificación de los módulos pendientes

El esqueleto está listo: base de datos, servidor, layout, estilos y el módulo
de **listado y alta** ya resuelto, que sirve de ejemplo del contrato.

Faltan cuatro módulos. Cada uno es independiente de los demás: **archivos
propios, sin tocar los ajenos**. Por eso se pueden construir en paralelo.

## El contrato que todos respetan

- Un archivo en `routes/<modulo>.js` que exporta un router de Express.
- Sus vistas en `views/<modulo>/`.
- Si necesita estilos, los agrega **al final** de `public/css/estilos.css`
  reusando las variables de color que ya existen.
- **No modifica `app.js`.** El montaje lo hace el agente principal al integrar.
- **No modifica archivos de otro módulo.**
- Respeta lo que dice el `CLAUDE.md` de este proyecto, que se escribe antes de repartir.

---

## Módulo A · Asignación y cambio de situación

**Archivo:** `routes/asignacion.js` · **Vistas:** `views/asignacion/`

Poder abrir un ticket, asignárselo a alguien del equipo de TI y cambiar su
situación entre `ABIERTO`, `EN CURSO` y `RESUELTO`.

- Rutas: `GET /tickets/:id` (detalle) y `POST /tickets/:id/atender`.
- El equipo de TI es una lista fija en el propio módulo: `victor`, `oscar`,
  `luis`, `martin`.
- Cada cambio actualiza `asignado_a`, `situacion` y los campos de auditoría.
- Un ticket `RESUELTO` no se puede volver a `ABIERTO`: solo a `EN CURSO`.

## Módulo B · Búsqueda y filtros

**Archivo:** `routes/busqueda.js` · **Vistas:** `views/busqueda/`

Buscar tickets por texto y filtrar por área, prioridad y situación.

- Ruta: `GET /tickets/buscar` con parámetros `q`, `area`, `prioridad`, `situacion`.
- El texto busca en título y descripción.
- Los filtros se combinan entre sí y el formulario conserva lo elegido.
- Máximo doscientos resultados.

## Módulo C · Panel de indicadores

**Archivo:** `routes/panel.js` · **Vistas:** `views/panel/`

Una pantalla con el estado de la mesa de ayuda.

- Ruta: `GET /panel`.
- Tickets por situación, por área y por prioridad.
- Cuántos hay sin asignar, y cuál es el más antiguo sin resolver.
- Barras hechas con CSS. **Sin librerías de gráficos.**

## Módulo D · Exportación a CSV

**Archivo:** `routes/exportacion.js`

Descargar los tickets como CSV para abrirlos en Excel.

- Ruta: `GET /export/tickets.csv`.
- Respeta los mismos filtros del módulo B si vienen en la URL.
- Separador punto y coma, con BOM, para que Excel en español lo abra bien.
- Los campos con punto y coma o comillas van escapados.
- Encabezados en español.
