# Spec: métricas puras y persistencia no destructiva

## Objetivo

Cumplir `docs/constitution.md` sin impedir abrir `index.html` con doble clic, sin módulos ES y sin instalar dependencias.

## Requisitos

- Los cálculos de racha actual, mejor racha, minutos semanales y días del mes serán funciones puras que reciben `sessions` y un `today` local explícito; no leerán DOM, almacenamiento ni el reloj global.
- La interfaz obtendrá la fecha local actual y pasará esa fecha a los cálculos. El DOM y `localStorage` permanecerán en la capa de aplicación.
- Las fechas se construirán con año, mes y día locales. Los días duplicados cuentan una vez para rachas y días mensuales; fechas futuras no contribuyen a las métricas.
- Leer un array guardado conservará todos sus elementos y propiedades, incluso entradas que la interfaz no pueda mostrar; las entradas inválidas no participan en métricas ni se renderizan.
- Si el valor guardado no se puede leer como un array, la aplicación no lo sobrescribirá con una sesión nueva y mostrará un error claro.
- Las pruebas usarán exclusivamente `node:test` y `node:assert`; no se instalarán paquetes.

## Aceptación

- `node --test` ejecuta pruebas para rachas, semanas, mes local, fechas inválidas y conservación de registros.
- `node --check app.js` pasa.
- La página sigue cargando directamente con `file://` y conserva el flujo de registro, métricas e historial.