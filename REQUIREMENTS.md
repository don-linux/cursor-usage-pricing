# Requirements

## MVP

- Calculadora de costo estimado de consumo de Cursor.
- El usuario sube manualmente un archivo `.csv` exportado desde Cursor.
- La app muestra el costo estimado en dolares segun tokens consumidos.
- No requiere login.
- No requiere backend para el MVP.

## Stack Frontend

- React.
- Vite.
- TypeScript.
- PapaParse para leer archivos `.csv`.
- TanStack Table para tablas y filtros.
- Recharts opcional para graficas.

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

## Calculo

- Input sin cache * precio input.
- Input con cache write * precio cache write.
- Cache read * precio cache read.
- Output tokens * precio output.
- Dividir cada subtotal entre 1,000,000.
- Sumar subtotales para obtener costo estimado.

```text
costo_input = (input_tokens_sin_cache * precio_input) / 1_000_000

costo_cache_write = (input_tokens_cache_write * precio_cache_write) / 1_000_000

costo_cache_read = (cache_read_tokens * precio_cache_read) / 1_000_000

costo_output = (output_tokens * precio_output) / 1_000_000

total = costo_input + costo_cache_write + costo_cache_read + costo_output
```

## Reglas Especiales

- Algunas reglas modifican solo un tipo de token.
- Ejemplo: multiplicar input cuando supera cierto umbral.
- Ejemplo: aplicar surcharge por Max Mode.
- Ejemplo: aplicar Cursor Token Rate en planes Teams (Aunque personalmente no puedo probarlo con mi cuenta de Cursor, no tengo planes Teams ni enterprise, se ajusta mas al csv que comparti con mi cuenta personal)
- Las reglas deben mostrarse al usuario como advertencias.
- Si una regla no esta implementada, marcar el calculo como estimado parcial.

## Consideraciones

- El CSV puede mostrar `Included`, pero la calculadora debe mostrar costo estimado, es el objetivo de la app, visualizar cuanto es el costo real de los tokens consumidos
- El costo estimado no siempre equivale al cobro real.
- Algunos modelos pueden tener reglas especiales.
- Algunos nombres del CSV pueden no coincidir exactamente con la documentacion.
- Se necesita una tabla de aliases de modelos.

## Futuro

- Historial de consumos.
- Comparacion mensual.
- Exportar resultados.
- Graficas por modelo, fecha y tipo de token.

