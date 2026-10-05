# Tareas — Mapa de calor

Las tareas están ordenadas por dependencia. Cada tarea se estima en 20–25 minutos. Se marcan completadas según la implementación y validación ya realizadas.

- [x] **T1 — Probar periodo y agregación** (20 min)
	- RF: RF-1, RF-2, RF-3, RF-7.
	- Hecho cuando: `node --test` comprueba inicio en lunes local, inclusión de hoy, exclusión de futuro, suma y conteo por fecha, sesiones con tema vacío y conservación del array recibido.
- [x] **T2 — Probar niveles y estados vacíos** (20 min)
	- RF: RF-4, RF-5, RF-8.
	- Hecho cuando: las pruebas verifican nivel cero sin actividad, cuatro bandas con límites inferiores inclusivos, máximo en banda cuatro, nivel neutral dos para empates y periodo sin sesiones.
- [x] **T3 — Calcular periodo local y días agregados** (25 min; depende de T1)
	- RF: RF-1, RF-2, RF-3, RF-7.
	- Hecho cuando: funciones puras reciben `sessions` y `today`, generan las fechas del periodo hasta hoy, agregan minutos/sesiones por día e ignoran fechas o minutos inválidos y fechas fuera del rango.
- [x] **T4 — Asignar intensidad relativa** (20 min; depende de T2 y T3)
	- RF: RF-4, RF-5.
	- Hecho cuando: días inactivos reciben intensidad cero; los activos reciben niveles 1–4 según cuatro intervalos iguales y los totales empatados reciben nivel dos.
- [x] **T5 — Añadir estructura semántica del mapa** (20 min; depende de T3 y T4)
	- RF: RF-4, RF-6, RF-8.
	- Hecho cuando: la interfaz incluye encabezado, cuadrícula semanal, nombres accesibles, leyenda, detalle compartido y mensaje para periodo vacío.
- [x] **T6 — Renderizar semanas y detalle diario** (25 min; depende de T5)
	- RF: RF-1, RF-2, RF-3, RF-4, RF-6, RF-7, RF-8.
	- Hecho cuando: aparecen 12 columnas lunes-domingo hasta hoy, huecos futuros sin marcar como inactividad, celdas con totales y detalle actualizado por puntero, foco y activación.
- [x] **T7 — Dar estilo responsive y accesible** (25 min; depende de T5 y T6)
	- RF: RF-4, RF-5, RF-6; NFR de adaptación, accesibilidad e idioma.
	- Hecho cuando: inactividad y niveles se distinguen, hay foco visible y el mapa completo se consulta a 375 px sin desbordamiento horizontal.
- [x] **T8 — Validar integración y regresiones** (20 min; depende de T1–T7)
	- RF: RF-1–RF-8.
	- Hecho cuando: `node --test` y `node --check app.js` pasan, el navegador muestra el mapa y su detalle sin errores de consola, y `localStorage` permanece sin cambios al consultar el mapa.
