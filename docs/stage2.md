# Upload + Parsing

Este stage se encarga de la lectura y parseo del archivo .csv de uso de Cursor, y la validacion de los datos para su posterior calculo de costos.

## Datos de Entrada

- Archivo `.csv` de uso de Cursor.
- Columnas esperadas:
  - Date.
  - Kind.
  - Model.
  - Max Mode.
  - Input (w/ Cache Write).
  - Input (w/o Cache Write).
  - Cache Read.
  - Output Tokens.
  - Total Tokens.
  - Cost.

## Precios

- Fuente oficial: [https://cursor.com/docs/models-and-pricing.md](https://cursor.com/docs/models-and-pricing.md)
- Precios por millon de tokens.
- Mantener un archivo local de precios versionado.
- Actualizacion manual al inicio.
- Posible actualizacion automatica despues.

## Estructura de Precios

- Archivo sugerido: `pricing.json`.
- Guardar metadata de la fuente oficial.
- Guardar modelos por ID interno.
- Guardar aliases para mapear nombres del CSV.
- Guardar precios base por tipo de token.
- Guardar reglas especiales por modelo.
- Guardar notas originales de la documentacion.

dropzone funcional
- PapaParse para leer archivos `.csv`
validación de columnas
normalización de datos
