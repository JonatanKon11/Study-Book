# Mapa de calor de estudio

## Contexto y objetivo

El Diario registra sesiones y muestra rachas y estadísticas, pero no permite percibir visualmente la regularidad del estudio a lo largo del tiempo. El mapa de calor debe mostrar la actividad diaria de las últimas 12 semanas y permitir reconocer de un vistazo los días con mayor dedicación.

## Usuarios

- La persona que registra sus propias sesiones de estudio y quiere revisar su constancia y dedicación reciente.

## Historias de usuario

- Como estudiante, quiero ver qué días estudié durante las últimas semanas para reconocer mi constancia.
- Como estudiante, quiero distinguir los días con más minutos para identificar mis jornadas de mayor dedicación.
- Como estudiante, quiero consultar el total del día y cuántas sesiones hice para entender cada marca del mapa.

## Requisitos funcionales

### RF-1. Periodo y calendario

Cuando la persona consulte el mapa, el sistema deberá mostrar los días desde el lunes de hace once semanas hasta hoy, ambos incluidos, organizados en semanas de lunes a domingo. Los días posteriores a hoy no formarán parte del periodo ni se presentarán como días sin actividad.

### RF-2. Fecha de actividad

Cuando el sistema determine el día de una sesión, deberá interpretarlo según la fecha local registrada para el usuario, sin desplazarlo a otro día por zona horaria.

### RF-3. Total diario

Cuando haya varias sesiones en una misma fecha local del periodo, el sistema deberá sumar sus minutos y contar sus sesiones para representar un único día en el mapa.

### RF-4. Días sin actividad

Cuando una fecha del periodo no tenga sesiones válidas, el sistema deberá mostrarla como día sin actividad, visualmente distinguible de cualquier nivel de actividad.

### RF-5. Intensidad relativa

Cuando existan días con actividad, el sistema deberá repartir el intervalo entre el menor y el mayor total diario de minutos en cuatro niveles de intensidad iguales; el menor total tendrá el nivel más tenue y el mayor, el más intenso. Los niveles se calcularán con los días activos del periodo visible. Cada banda incluirá su límite inferior y excluirá el superior, salvo la última, que incluirá también el máximo. Si todos los días activos tienen los mismos minutos, todos usarán el nivel 2 como intensidad neutral.

### RF-6. Detalle diario

Cuando la persona señale, enfoque o active un día con actividad, el sistema deberá mostrar su fecha local, total de minutos y número de sesiones. El detalle deberá poder consultarse con ratón y teclado, y mediante interacción táctil, y permanecerá visible hasta que otra interacción con un día lo actualice.

### RF-7. Registros no utilizables

Si una sesión guardada no tiene una fecha local válida o sus minutos no son un número finito mayor que cero, el sistema deberá excluirla del cálculo y continuar mostrando el resto de los días sin modificar ni eliminar el registro guardado. El tema no determina si una sesión cuenta para el mapa.

### RF-8. Periodo sin actividad

Cuando no haya sesiones válidas en las últimas 12 semanas, el sistema deberá mostrar el periodo sin marcas de actividad e indicar claramente que todavía no hay actividad registrada en ese intervalo.

## Requisitos no funcionales

- El mapa y sus detalles deberán adaptarse a pantallas móviles y de escritorio sin impedir la consulta de las 12 semanas.
- La intensidad no será la única forma de distinguir la actividad: cada día deberá exponer su fecha y resumen mediante un nombre accesible.
- Los textos y detalles deberán estar en español y expresar fechas en el calendario local del usuario.
- La consulta del mapa no deberá cambiar ni eliminar las sesiones guardadas.

## Casos límite

- Varias sesiones en el mismo día se consolidan en una celda; sus minutos se suman y sus sesiones se cuentan individualmente.
- Una única fecha con actividad, o varios días activos con el mismo total de minutos, usa el nivel 2 neutral.
- Un valor que coincide con un límite interno de banda pertenece a la banda que comienza en ese límite; el máximo pertenece siempre al nivel 4.
- Los registros con fechas inválidas o minutos ausentes, no numéricos, no finitos o no positivos no generan actividad; se conservan sin cambios. Un tema ausente o vacío no invalida la fecha ni los minutos para el mapa.
- Se incluyen cambios de mes, de año y años bisiestos; las fechas se comparan como fechas locales.
- Los días futuros de la semana actual no se incluyen como celdas sin actividad.
- Un periodo vacío conserva la estructura temporal de las 12 semanas y muestra el estado vacío descrito en RF-8.

## Fuera de alcance

- Cambiar, corregir o borrar sesiones desde el mapa.
- Mostrar periodos distintos de las últimas 12 semanas o permitir elegir un rango personalizado.
- Añadir metas, rachas, comparaciones entre usuarios o estadísticas de toda la vida.
- Guardar totales o niveles de intensidad adicionales junto con las sesiones.

## Criterios de finalización

- El mapa cubre el periodo definido, organiza los días por semanas y no incluye fechas futuras.
- Los totales, conteos e intensidades coinciden con las sesiones válidas guardadas, incluidas varias sesiones en una misma fecha.
- Fechas locales consecutivas se representan en días consecutivos, incluso al cruzar cambios de mes, año o de horario.
- Los días sin actividad, los días con actividad y el periodo vacío se distinguen claramente.
- El detalle de cada día activo expone fecha, minutos y cantidad de sesiones mediante ratón, teclado y pantalla táctil.
- Las entradas inválidas no provocan errores ni alteran los datos guardados.
- La experiencia se puede consultar en móvil y escritorio, y la intensidad no depende exclusivamente del color.

## Dudas abiertas

- No quedan dudas abiertas para la primera implementación del mapa de calor.
