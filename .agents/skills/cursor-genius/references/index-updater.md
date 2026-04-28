# Index Updater

Use this reference only when the curated local index has a real `coverage gap`.

This updater exists as an edge-case escape hatch. The default path is still:

1. `references/llms-index.md`
2. `references/topic-routing.md`
3. current official Cursor pages

Do not run the updater for topics that are already well covered by the curated local index.

## Trigger Conditions

Treat the situation as a `coverage gap` only when one or more of these are true:

- the local index cannot classify the question cleanly
- the local routing cannot point to a sufficiently specific official page
- the needed route appears missing from the curated index
- the local route appears malformed, duplicated, or suspicious for the question

Do not trigger the updater because of time, age, file metadata, or a routine freshness check.

## Command

Run the updater with the current user question:

```bash
python scripts/index-updater.py "<user question>"
```

If needed, you may also use script flags to narrow or inspect the overlay output.

## What the Updater Must Do

- fetch `https://cursor.com/llms.txt` for the current execution
- normalize obviously malformed Cursor URLs
- remove duplicates
- drop blank or invalid entries
- emit a compact routing overlay to `stdout`
- keep the overlay useful for the current answer, not as a full generated replacement index

## Non-Persistence Guarantee

- The updater output is session-only.
- Do not write the overlay back into `references/llms-index.md`.
- Do not auto-curate the repository from updater output.
- If a temporary file is needed internally, it must live outside the repo and be deleted before exit.

## Failure Behavior

If the updater fails:

- fall back to the curated local index
- answer conservatively
- say that you could not verify against a live refreshed index

## Output Expectations

The overlay should stay compact and routing-oriented. Prefer:

- a short summary of normalization results
- a small ranked list of suggested starting pages
- a few relevant grouped sections from the live sitemap

Avoid dumping the entire raw `llms.txt` into context unless the user explicitly asks for it.
