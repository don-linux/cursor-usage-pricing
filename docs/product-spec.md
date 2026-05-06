# SPEC

## Objetivo

Crear una herramienta de tracking de consumo de los LLMs mediante un archivo .csv que proporciona cursor, para poder tener un control de los costos de uso de los LLMs, y poder optimizar el uso de los mismos

## Flujo de la app

- El usuario sube manualmente un archivo `.csv` exportado desde Cursor desde la landing page.
- La app parsea el archivo .csv
- La app calcula el costo estimado en dolares segun tokens consumidos.
- La app muestra costos estimado en dolares y estadisticas mediante graficos de barras y tablas

## Diseño general

El sitio estara dividido en dos vistas, una landing page y el dashboard de la calculadora

Ambas deben siguir estrictamente la guia que proporciona la skill /cursor-brand

Apegarse estrictamente al uso de colores, fuentes y branding de cursor

Usa las siguientes skills en conjunto para diseñar:

/frontend-design
/web-design-guidelines
/shadcn

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
- No requiere login.
- No requiere backend para el MVP.