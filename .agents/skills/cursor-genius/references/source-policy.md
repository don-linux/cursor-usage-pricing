# Source Policy

Use this file when deciding what counts as evidence and how to answer if the docs are incomplete, ambiguous, or split across multiple pages.

## Source Priority

1. The most specific official Cursor page that directly answers the question.
2. Official Cursor product docs under `https://cursor.com/docs/`.
3. Official Cursor help pages under `https://cursor.com/help/`.
4. `https://cursor.com/llms.txt` as a discovery index.
5. Other official Cursor pages such as changelog or marketplace pages when directly relevant.

Do not treat community guides, forum posts, or general memory as equal to official Cursor documentation unless the user explicitly asks for non-official sources.

## How to Use `llms.txt`

- Use `llms.txt` to discover sections, canonical pages, and localization support.
- Do not stop at `llms.txt` when a specific page can be fetched or queried.
- Normalize malformed or duplicated URLs before using them.
- If `llms.txt` and a live page disagree, trust the live page.

## Coverage Gap Updater

- Use the live updater only when the curated local index cannot route the question well enough.
- Read `references/index-updater.md` before running the updater.
- Run `python scripts/index-updater.py "<user question>"` and treat the output as a temporary routing overlay.
- Do not rewrite `references/llms-index.md` automatically from updater output.
- If the updater fails, fall back to the curated local index and say that live refresh verification failed.

## When Multiple Official Pages Cover the Topic

- Prefer the narrower page over the broader hub.
- Prefer `docs/` over `help/` for feature definitions, behavior, architecture, and configuration.
- Prefer `help/` over `docs/` for troubleshooting, onboarding, and UI-navigation questions.
- If two pages cover different angles of the same topic, use both and explain the difference in scope.

## When the Docs Do Not Fully Confirm Something

- Say that you could not confirm the claim in the current official Cursor docs.
- Separate documented fact from informed inference.
- Offer the closest official page instead of inventing certainty.
- If the answer likely depends on plan, workspace, or enterprise setup, say so.

Recommended phrasing:

- "I could not confirm this in the current official Cursor documentation."
- "The closest official source I found is ..."
- "The docs clearly confirm X, but they do not explicitly confirm Y."

## Language Policy

- Answer in the user's prompt language.
- Prefer localized Cursor docs when they exist and improve clarity.
- Fall back to English canonical pages when the localized page is unavailable, incomplete, or ambiguous.
- Do not translate product names, commands, flags, paths, or identifiers unless the docs do so officially.

## Citation Discipline

- Start with a direct answer in natural prose before any support sections.
- Do not use `Answer` or `Respuesta` as an opening heading.
- Cite 1-3 official pages when possible.
- Prefer linking the page that directly supports the answer, not just the section hub.
- Quote exact text only when wording matters.
- Otherwise summarize the official guidance in your own words.

## Offline or Limited-Tool Fallback

- If live fetch or docs-query tools are unavailable, use the local references in this skill.
- Explicitly say that you answered from the curated local index and could not verify against a live refreshed index.
- Stay conservative and avoid high-confidence claims about recent product changes.
