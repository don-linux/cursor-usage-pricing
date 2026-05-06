# Pricing + Calculation Engine


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


pricing.json
mapper de modelos (aliases)
motor de cálculo
reglas especiales

TypeScript, sin UI