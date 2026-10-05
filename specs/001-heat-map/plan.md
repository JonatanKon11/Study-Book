# Plan: mapa de calor de estudio

## Alcance y restricciones

- Implementar únicamente los RF-1 a RF-8 de la spec vigente y sus requisitos no funcionales.
- Mantener la apertura directa con `file://`, sin módulos ES, dependencias, build ni cambios al formato de sesiones guardadas.
- Mantener la lógica de dominio pura: recibe sesiones y `hoy` como fecha local; no consulta DOM, `localStorage` ni el reloj global.
- Las decisiones antes abiertas ya están fijadas en la spec: rango sin amplitud usa intensidad 2, límites inferiores pertenecen a la banda que comienza allí, el detalle persiste hasta otra interacción y el tema no determina si una sesión cuenta para el mapa.

## Archivos previstos

| Archivo | Acción | Responsabilidad | RF |
|---|---|---|---|
| `index.html` | Modificar | Añadir la región del mapa, etiquetas de semanas y días, leyenda de cuatro niveles, estado vacío y una región accesible para el detalle diario. Las posiciones posteriores a hoy serán huecos de alineación, no días sin actividad. | RF-1, RF-4, RF-6, RF-8; NFR de accesibilidad e idioma |
| `styles.css` | Modificar | Presentar doce semanas como columnas de lunes a domingo; diferenciar inactividad y cuatro intensidades; conservar foco visible, legibilidad, contraste y adaptación a móvil/escritorio. | RF-1, RF-4, RF-5; NFR de adaptación y no depender solo del color |
| `app.js` | Modificar | Calcular el periodo y los totales diarios mediante funciones puras; enlazar los resultados con el DOM sin modificar sesiones ni persistir resúmenes. El código se mantiene en inglés y la interfaz en español. | RF-1 a RF-8 |
| `tests/app.test.js` | Modificar | Ampliar la suite `node:test` existente con pruebas de periodo, agregación, niveles, registros inválidos y ausencia de actividad, sin instalar paquetes. | RF-1 a RF-5, RF-7, RF-8 y criterios de finalización |
| `specs/001-heat-map/plan.md` | Crear | Registrar este plan de implementación y sus decisiones/bloqueos. | No aplica |

## Funciones puras previstas

- `getHeatMapPeriod(today)`: calcula el lunes local de la semana actual, retrocede once semanas de calendario y devuelve las fechas hasta `today`, inclusive. No incluye fechas futuras.
- `buildHeatMapDays(sessions, today)`: crea un registro por cada fecha del periodo, con fecha, minutos totales, cantidad de sesiones, estado de actividad e intensidad. Ignora fechas inválidas y duraciones ausentes, no numéricas, no finitas o no positivas; no modifica las sesiones recibidas.
- `getHeatMapIntensity(days)`: calcula mínimo, máximo y nivel relativo de cada día activo. Devuelve nivel 0 para inactividad y nivel 2 si mínimo y máximo coinciden.
- La interfaz obtiene la fecha local actual una sola vez al actualizar la vista y la pasa explícitamente a las funciones anteriores.

## Algoritmo del mapa en pseudocódigo

```text
periodo = obtener fechas locales desde el lunes de hace once semanas hasta hoy
para cada fecha del periodo:
    crear día con minutos = 0, sesiones = 0 y estado = sin actividad
para cada sesión guardada:
    si fecha o minutos no son válidos: continuar
    si la fecha no pertenece al periodo: continuar
    sumar minutos al día correspondiente
    incrementar cantidad de sesiones del día
activos = días cuya cantidad de sesiones es mayor que cero
si activos está vacío:
    devolver periodo sin actividad
mínimo = menor total diario entre activos
máximo = mayor total diario entre activos
si mínimo = máximo:
    asignar nivel 2 a cada día activo como intensidad neutral
si no:
    dividir [mínimo, máximo] en cuatro intervalos iguales
    usar límites inferiores inclusivos y superiores exclusivos
    tratar el máximo como parte del último intervalo
devolver los días del periodo con totales, conteos, estados y niveles
```

El cálculo de fechas usa calendario local y suma/resta con operaciones de calendario, nunca UTC ni duraciones fijas en milisegundos. Las sesiones futuras quedan fuera del periodo. Las sesiones repetidas en una fecha se agregan en una sola celda.

## Presentación e interacción

- Usar una cuadrícula semántica con semanas en columnas y días de lunes a domingo en filas, más rótulos breves de mes y día para orientar la lectura.
- Mostrar cada día del periodo, incluso los días sin sesiones. Los días sin actividad tendrán un estilo propio distinto del nivel activo más tenue.
- Las fechas futuras de la semana en curso se omiten como celdas; la columna conserva el espacio de alineación sin etiquetarlo como inactividad.
- Mostrar una leyenda con los cuatro niveles crecientes y el significado de ausencia de actividad.
- Los días tendrán nombres accesibles con fecha y resumen. Solo los días activos serán acciones interactivas; el orden de foco seguirá el calendario.
- Al pasar el puntero, enfocar con teclado o activar con clic/toque un día activo, actualizar una región de detalle compartida con fecha local, minutos y cantidad de sesiones. La región permanece visible para que el detalle táctil no dependa de hover.
- En móvil se conserva el orden de semanas y las doce semanas consultables; el mapa no debe recortar semanas ni depender de desplazamiento horizontal para alcanzar datos ocultos.
- El estado vacío indica que no hay actividad en el periodo y conserva la estructura temporal del mapa.

## Decisiones técnicas y alternativas descartadas

| Decisión | Motivo | Alternativa descartada y motivo |
|---|---|---|
| Derivar el mapa de las sesiones existentes en cada renderizado. | Evita duplicar estado y garantiza que las correcciones o sesiones nuevas se reflejen enseguida; cumple RF-3 y RF-7. | Guardar totales diarios o niveles en `localStorage`: queda fuera de alcance y podría quedar desincronizado o comprometer datos existentes. |
| Reutilizar `getLocalDateKey` y los constructores de fechas locales presentes en `app.js`; pasar `today` a las nuevas funciones. | Cumple la constitución y evita desplazamientos UTC y errores por cambios de horario. | Usar `toISOString()`, `new Date("AAAA-MM-DD")` o sumar milisegundos: contradice las reglas locales del proyecto. |
| Mantener cálculos y representación DOM en el `app.js` existente, separados por responsabilidad. | Conserva la apertura con `file://` y evita nuevos módulos o herramientas. | Crear un módulo ES independiente: no cumple la ejecución directa especificada en la constitución. |
| Representar las celdas en HTML/CSS con nombres accesibles y una región de detalle. | Permite navegación por teclado, interacción táctil y significado más allá del color. | Dibujar el mapa en canvas o depender de una librería gráfica: reduce accesibilidad y añade complejidad/dependencias innecesarias. |
| Dividir el rango observado en cuatro intervalos iguales, con bandas inferiores inclusivas, superiores exclusivas y el máximo incluido en la última banda; si el rango es cero, usar nivel 2. | Hace reproducible el nivel para cada valor y ofrece una intensidad neutral cuando no hay variación. | Usar cuartiles o umbrales fijos de minutos cambiaría la regla relativa; asignar el rango cero al mínimo o al máximo implicaría una diferencia inexistente. |
| Ampliar `tests/app.test.js` con `node:test` y `node:assert`. | Cumple RF y la puerta de pruebas constitucional sin instalar paquetes. | Incorporar framework de tests o dejar las métricas sin pruebas automatizadas: contradice la constitución. |

## Estrategia de tests con `node --test`

- Periodo: límite inicial en lunes local, doce columnas semanales, hoy incluido y futuras excluidas; probar distintos días de semana, cambio de mes y año.
- Zona local: generar fechas con componentes locales; ejecutar los casos alrededor de las 00:30 y de los cambios horarios de primavera y otoño, sin `toISOString()` ni aritmética de 24 horas.
- Agregación (RF-3): ninguna sesión, una sesión, varias sesiones el mismo día; comprobar suma de minutos y cantidad exacta de sesiones.
- Actividad e intensidad (RF-4 y RF-5): días inactivos distintos del menor nivel; extremos mínimo/máximo; cada intervalo, sus límites y rango cero de nivel neutral.
- Detalle (RF-6): verificar en las salidas de dominio los valores exactos que la interfaz expone para fecha, total y conteo; completar navegación de puntero, teclado y toque en comprobación manual de navegador.
- Registros inválidos (RF-7): fecha imposible, fecha ausente, minutos ausentes, no numéricos, infinitos, cero y negativos; confirmar que no generan actividad y que el array original no se muta.
- Periodo vacío (RF-8): comprobar ausencia total de sesiones válidas y sesiones únicamente fuera del periodo; verificar estado sin actividad.
- Regresión y puerta: todos los tests existentes siguen verdes; `node --test` y `node --check app.js` pasan antes de la revisión manual.
- Persistencia: las pruebas usan almacenamiento simulado; la comprobación en navegador no borra ni sobrescribe sesiones reales.

## Decisiones de producto fijadas

- Si todos los días activos tienen los mismos minutos, incluidos periodos con una sola fecha activa, cada uno usa nivel 2 neutral.
- Los valores en un límite interno pertenecen a la banda que comienza en ese límite; el máximo pertenece al nivel 4.
- El detalle se actualiza al señalar, enfocar o activar un día activo y permanece hasta otra interacción con un día.
- La elegibilidad para el mapa depende de fecha local válida y minutos finitos positivos; tema vacío o ausente no excluye una sesión del mapa.
