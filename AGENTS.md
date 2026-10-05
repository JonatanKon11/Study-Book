# Diario de Estudio

Web estática didáctica para registrar sesiones de estudio y consultar la racha. El código debe ser sencillo de entender para alguien que empieza a programar.

## Estado actual

- La v1 registra sesiones con fecha, tema y minutos; muestra la racha actual, la mejor racha, los minutos de esta semana, los días estudiados este mes y la lista de sesiones.
- Los datos se guardan en `localStorage` con la clave `diario-estudio-sesiones`.
- No hay aprendizajes recurrentes ni próximos pasos acordados todavía; no los inventes.

## Estructura y ejecución

- Usa solo HTML, CSS y JavaScript puros; no añadas frameworks, librerías, dependencias ni herramientas de build.
- Mantén la aplicación en `index.html` (estructura), `styles.css` (estilos) y `app.js` (lógica, interfaz y persistencia); deja los cálculos de dominio como funciones puras separadas de la interfaz y el almacenamiento.
- Debe funcionar abriendo `index.html` directamente con doble clic (`file://`). No uses módulos ES, `fetch` de archivos locales ni requisitos de servidor.
- Conserva los textos de la interfaz en español y el diseño adaptable a pantallas móviles.

## Código y cambios

- Usa nombres descriptivos y soluciones directas; escribe el código de forma que una persona principiante pueda seguirlo.
- Las funciones de racha y estadísticas reciben las sesiones y la fecha local de referencia como parámetros; no consultan el DOM, `localStorage` ni el reloj global.
- Añade comentarios solo cuando aclaren algo que no sea evidente.
- Haz únicamente lo pedido y limita cada cambio a lo necesario; no reescribas partes que ya funcionan.
- Antes de crear archivos adicionales distintos de `MEMORY.md` o cambiar el formato de los datos guardados, pide permiso.

## Memoria entre sesiones

- Al comenzar una tarea, lee `MEMORY.md` si existe para conocer el estado y las decisiones del proyecto.
- Siempre, al terminar cada tarea, actualiza `MEMORY.md` con el estado, decisiones y motivos relevantes, y errores a evitar; mantenlo por debajo de unas 50 líneas.
- No inventes aprendizajes ni próximos pasos. No guardes claves, tokens ni datos personales.
- Si una nota se convierte en regla permanente, muévela a estas instrucciones y evita duplicarla en la memoria.

## Comandos
- Tests: `node --test`
## Reglas
- Lee `docs/constitution.md` y la spec activa (`specs/NNN-*/`) antes de tocar código. 

## Sesiones guardadas

- La clave de `localStorage` es `diario-estudio-sesiones`. Los campos de cada sesión son `date` (`AAAA-MM-DD`), `topic` y `minutes`.
- Los registros actuales también pueden incluir `id` y `createdAt`; son metadatos opcionales. No los hagas obligatorios ni elimines o descartes campos al leer o guardar datos existentes.
- Si fuera necesario cambiar la estructura de una sesión, conserva la lectura de los registros ya guardados o planifica una migración sin pérdida de datos; pregunta antes de cambiar el formato.

## Fechas y racha

- Calcula, compara y muestra las fechas en la zona local del usuario. No uses `toISOString()` ni `new Date("AAAA-MM-DD")`, porque pueden cambiar el día por conversión UTC. Para una fecha guardada, separa año, mes y día y constrúyela en hora local.
- Un día cuenta si tiene una o más sesiones. Varias sesiones de la misma fecha cuentan como un solo día de racha.
- La racha cuenta los días consecutivos con sesión que terminan hoy. Si hoy no hay sesión y ayer sí, la racha sigue viva y se cuenta desde ayer.
- Las fechas futuras no contribuyen a la racha.
- La mejor racha es el tramo consecutivo más largo entre las fechas con sesión hasta hoy; incluye la racha vigente y no cuenta días duplicados ni fechas futuras.
- Calcula la mejor racha desde las sesiones guardadas; no mantengas un récord duplicado en `localStorage`.
- El total semanal suma los minutos de todas las sesiones desde el lunes local hasta hoy; excluye fechas futuras.
- Los días estudiados este mes cuentan fechas locales únicas del mes actual hasta hoy; varias sesiones del mismo día cuentan una vez y las fechas futuras se excluyen.

## Verificación

- Ejecuta `node --test` y `node --check app.js` antes de terminar cambios de lógica.
- Valida también abriendo `index.html` en un navegador y comprueba el flujo afectado, especialmente fechas locales, racha y persistencia.
- Al probar `localStorage`, usa datos aislados o respalda y restaura las sesiones existentes; nunca limpies la clave real como parte de una prueba.
- Para borrar los datos de prueba, abre las herramientas de desarrollador del navegador y elimina la clave `diario-estudio-sesiones` de Application → Local Storage.

Al terminar un cambio, resume qué hiciste y señala cualquier decisión que el usuario deba revisar.
