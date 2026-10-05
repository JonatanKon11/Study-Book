# Diario de Estudio: memoria del proyecto

## Estado actual
- La v1 funciona: registra sesiones con fecha, tema y minutos; muestra rachas, métricas semanales/mensuales, mapa de calor de 12 semanas y lista de sesiones.
- Verificación en navegador (2026-10-01): mejor y actual muestran 1 con días guardados no consecutivos y sesión de ayer; no se reprodujo un fallo.
- Verificación semanal (2026-10-01): con cuatro sesiones, muestra 75 min (60 del 30-sep + 15 del 1-oct); las dos del 1-sep son anteriores a la semana que empieza el 28-sep y se excluyen correctamente.
- Guarda las sesiones en `localStorage` bajo `diario-estudio-sesiones`.
- Proyecto estático en `index.html`, `styles.css` y `app.js`; se abre directamente con doble clic.
- `docs/constitution.md` recoge seis principios aprobados para stack, especificación, separación de responsabilidades, pruebas, protección de datos e idioma.
- Skills locales en `.agents/skills/`: `local-dates`, `frontend-design` (Anthropic) y `web-design-guidelines` (Vercel), instaladas desde sus repositorios oficiales en skills.sh.
- Diseño actualizado: cabecera editorial, racha como foco, métricas agrupadas, historial abierto y paleta fría verde/lima/coral; revisado en escritorio y móvil.
- Chrome DevTools MCP configurado para el workspace en `.mcp.json`; usa `npx.cmd` y desactiva estadísticas de uso. Node, npm, Chrome y el paquete se verificaron en este equipo.
- Prueba del formulario en navegador (2026-10-02): sesiones consecutivas de hoy/ayer/anteayer dieron racha actual 3 y mejor 3; consola sin errores; captura móvil a 375 px. Datos reales respaldados y conservados.
- Constitución aplicada (2026-10-02): spec activa en `specs/001-pure-study-metrics/`, métricas puras con fecha inyectada y conservación de entradas guardadas; 8 tests pasan con `node --test` en zona local y `Europe/Madrid`, y `node --check app.js` pasa.
- Mapa de calor implementado según `specs/001-heat-map/spec.md` y `plan.md`; decisiones cerradas: intensidad 2 para totales empatados, límites inferiores inclusivos y el tema no invalida actividad del mapa.
- Verificación del mapa (2026-10-05): 14/14 tests pasan en zona local y `Europe/Madrid`; navegador confirma 12 semanas, 78 días hasta hoy, detalles por puntero/foco/clic, sin errores de consola ni cambios de `localStorage`; sin overflow a 375 px.
- `specs/001-heat-map/tasks.md` contiene ocho tareas de 20–25 minutos, ordenadas por dependencias, RF y criterios verificables; todas corresponden al mapa ya implementado.
- Revalidación solicitada de T1 (2026-10-05): sus 2 pruebas enfocadas pasan; suite completa 14/14 y `node --check app.js` pasan. T1 ya estaba marcada; no se inició T2.
- Las observaciones de QA sobre intensidad, límites, interacción y validez de sesiones se resolvieron en la spec antes de implementar el mapa.
- Revalidación completa del mapa (2026-10-05): 14/14 tests y `node --check app.js` pasan; el navegador muestra 12 semanas/78 días y conserva las cinco sesiones existentes.
- Preparación para GitHub (2026-10-05): repo local `main` con commit inicial `a231917`, árbol limpio; publicación pública en `JonatanKon11/diario-de-estudio-ia` pendiente de autenticación de GitHub en navegador.
- Auditoría RF mapa (2026-10-05): RF-1–RF-5 y RF-8 cubiertos por tests/navegador; RF-6 probado con ratón/teclado, no con touch nativo porque el contexto no admite emulación táctil. RF-7: `minutes: "30"` se cuenta tras coerción; spec no aclara si cadenas numéricas son válidas.

## Decisiones y motivos
- Sin backend ni dependencias para que la web funcione sin instalación ni servidor.
- La fecha de cada sesión es editable para registrar estudio de días anteriores.
- La mejor racha se calcula a partir de las fechas guardadas, sin añadir otro dato a `localStorage`.
- El total semanal suma todas las sesiones de lunes a hoy en fecha local y excluye fechas futuras; no cambia el formato guardado.
- Los días estudiados este mes cuentan fechas únicas del mes local actual hasta hoy; no cambian el formato guardado.
- Leer esta memoria al iniciar tareas y actualizarla siempre al final; las reglas permanentes pertenecen a `AGENTS.md`.

## Aprendizajes y errores a evitar
- Las pruebas de `localStorage` deben aislarse o respaldar y restaurar sesiones reales; la regla permanente está en `AGENTS.md`.

## Próximos pasos
- No hay próximos pasos acordados.
