---
name: cursor-pricing-updater
description: Updates the Cursor usage pricing catalog for a calculator app by fetching the official Cursor Models & Pricing docs, comparing them with pricing.json, adding new models, removing delisted official models, normalizing aliases, and validating pricing rules. Use this whenever the user asks to update Cursor model prices, refresh pricing.json, sync the calculator with Cursor docs, compare current Cursor models, or maintain token-pricing rules.
---

# Cursor Pricing Updater

Use this skill to keep a Cursor usage calculator's `pricing.json` aligned with the official Cursor model pricing documentation.

## Primary Sources

Use official Cursor sources first:

- `https://cursor.com/docs/models-and-pricing.md`
- `https://cursor.com/es/docs/models-and-pricing`
- `https://cursor.com/terms/pricing`

Prefer the English Markdown page as the canonical pricing table. Use localized pages only to clarify wording.

## Inputs To Read

Before editing:

1. Read `pricing.json`.
2. Read `REQUIREMENTS.md` if it exists.
3. If a Cursor usage CSV is available or mentioned, inspect unique values from the `Model` column to preserve useful aliases.
4. Fetch the official Cursor pricing docs live.

## Update Workflow

1. Extract the official model table from Cursor docs:
   - `Model`
   - `Provider`
   - `Input`
   - `Cache write`
   - `Cache read`
   - `Output`
   - `Notes`

2. Compare official rows with `pricing.json`:
   - Add models that exist in the docs but not in `pricing.json`.
   - Remove official models from `models` if they no longer appear in the docs.
   - Keep non-official CSV-only entries under `unmappedCsvModels`, not under `models`.
   - Preserve useful existing aliases when their base model still exists.

3. Normalize prices:
   - Store all prices as numbers in USD per 1M tokens.
   - Convert `-` to `null`.
   - Keep `currency: "USD"` and `unit: "per_1m_tokens"`.
   - Do not apply cache discounts twice if the official table already gives a cache-read price.

4. Normalize model IDs:
   - Use lowercase kebab-case IDs.
   - Treat effort suffixes as aliases only when they do not have separate official pricing.
   - Ignore effort suffixes for pricing: `low`, `medium`, `high`, `xhigh`, `extra-high`, `thinking`, `max`.
   - Keep explicit priced variants as separate models: `fast`, `mini`, `nano`, `codex`, `image-preview`, `1m`.

5. Normalize aliases:
   - Include the official display name converted to kebab-case.
   - Include known CSV model IDs.
   - Include common punctuation variants, for example `grok-4.20` and `grok-4-20`.
   - Avoid alias collisions. One alias should resolve to one model.

## Rule Mapping

Translate Cursor notes into structured rules only when the docs provide enough information.

- `The cost is 2x when the input exceeds 200k tokens`
  - Use `type: "request_cost_multiplier"`.
  - Trigger on `inputTokensGreaterThan: 200000`.
  - Apply to all token cost components for that request unless the docs say only input pricing changes.

- `Long context ... with 2x input pricing`
  - Use `type: "input_price_multiplier"`.
  - Trigger on `maxMode: true` and `inputTokensGreaterThan: 200000` unless the docs provide a better threshold.
  - Apply only to `input` and `cacheWrite`.

- `Fast mode ... 2x pricing`
  - If the docs provide an exact multiplier, create a derived explicit model such as `gpt-5.4-fast`.
  - If the docs only say `higher rates`, add a warning and do not invent prices.

- `90% discount on cached input tokens`
  - Add an informational rule only.
  - The `cacheRead` price should already represent the discount.

- `Requires Max Mode on request-based plans`
  - Add a warning, not a cost rule.

- `Max Mode adds a 20% surcharge on legacy request-based plans`
  - Keep this as a global rule scoped to `legacy_request_based`.

- `Cursor Token Rate`
  - Keep this as a global rule scoped to Teams non-Auto requests.

## Output Shape

Keep this general shape:

```json
{
  "schemaVersion": 1,
  "source": {
    "name": "Cursor Models & Pricing",
    "url": "https://cursor.com/docs/models-and-pricing.md",
    "retrievedAt": "YYYY-MM-DD",
    "currency": "USD",
    "unit": "per_1m_tokens"
  },
  "normalization": {},
  "globalRules": [],
  "models": {},
  "unmappedCsvModels": []
}
```

Each model should include:

```json
{
  "displayName": "Model Name",
  "provider": "Provider",
  "pool": "api",
  "aliases": [],
  "matchers": [],
  "pricing": {
    "input": 0,
    "cacheWrite": null,
    "cacheRead": 0,
    "output": 0
  },
  "rules": [],
  "warnings": [],
  "sourceNotes": []
}
```

## Validation Checklist

Before finishing:

- Validate JSON syntax with `python -m json.tool pricing.json >/dev/null`.
- Confirm every current official model row appears in `models`.
- Confirm no removed official model remains in `models`.
- Confirm all prices are numbers or `null`, never strings like `"$3"` or `"-"`.
- Confirm every cost-changing rule has a `sourceNote`.
- Confirm no exact alias maps to more than one model.
- Confirm unpriced claims remain warnings instead of invented prices.
- Summarize added, removed, changed, and unresolved models.

## Final Response

Report concisely:

- Official source URL and retrieval date.
- Models added.
- Models removed.
- Pricing/rule changes.
- Unmapped or uncertain models.
- Validation performed.
