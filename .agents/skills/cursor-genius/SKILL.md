---
name: cursor-genius
description: Answers questions about the Cursor product using official Cursor documentation first. Covers Agent, modes, rules, skills, subagents, MCP, CLI, models, pricing, account, billing, enterprise, integrations, and troubleshooting. Use when the user asks how Cursor works, how to configure a Cursor feature, where Cursor documents something, or how two Cursor features differ. Avoid for generic code references to "cursor" that are unrelated to the Cursor product.
---

# Cursor Genius

Use this skill to answer questions about the Cursor editor and platform with an official-docs-first workflow.

## When to Use

- Use this skill when the user is asking about the Cursor product itself.
- Use it for feature behavior, setup, configuration, documentation lookup, pricing, account, enterprise, CLI, integrations, and troubleshooting questions.
- Use it when the user asks for the official source, asks where something is documented, or wants a comparison between Cursor features.

Do not use this skill when:

- `cursor` refers to a code symbol, text caret, database cursor, or another product.
- The user is asking you to build application code rather than explain Cursor itself.

If the request is ambiguous, ask whether they mean the Cursor product before proceeding.

## Default Stance

- Prefer official Cursor documentation over memory.
- Prefer canonical `docs/` pages over `help/` pages for product behavior and configuration.
- Use `help/` pages for onboarding, UI guidance, FAQ-style questions, and troubleshooting.
- Use `https://cursor.com/llms.txt` as a sitemap and discovery index, not as the final authority when a specific official page exists.
- If live docs lookup is available, use it before answering from memory.
- If official docs do not confirm a claim, say so clearly.

## Language Rules

- Keep this skill and its supporting references in English.
- Detect the user's prompt language and answer in that same language.
- If a localized Cursor doc is available and useful, prefer it.
- If the best official source is only in English, use it and translate the explanation for the user.
- Keep official product names, commands, paths, flags, and identifiers exactly as documented when helpful.

## Workflow

1. Confirm the question is about the Cursor product.
2. Classify the topic with `references/llms-index.md`.
3. Read `references/topic-routing.md` to find the most likely canonical pages.
4. Fetch or query the current official Cursor pages referenced there.
5. If there is a `coverage gap`, read `references/index-updater.md` and run `python scripts/index-updater.py "<user question>"`.
6. Use the emitted overlay only for the current answer or current session. Never rewrite `references/llms-index.md` automatically.
7. Read `references/source-policy.md` when claims are ambiguous, spread across multiple pages, or not directly confirmed.
8. Ask one clarifying question if the request spans multiple unrelated Cursor topics.
9. Respond using the direct-answer contract below.

A `coverage gap` exists when the curated local index cannot classify the topic cleanly, cannot point to a sufficiently specific official page, or appears to contain a missing, malformed, or suspicious route for the question.

If no live web or docs tool is available, or if the updater fails, answer conservatively from the local references and say that you could not verify against a live refreshed index.

## Direct Answer Contract

Use this structure unless the user asks for a different format:

- Start with the actual answer in natural prose.
- The first sentence or first paragraph must contain the real answer.
- Do not use `Answer` or `Respuesta` as the opening heading.
- Add optional follow-up sections such as:
- `Evidence`: 1-3 official Cursor pages that support the answer.
- `Limits`: state uncertainty, missing confirmation, or version ambiguity if present.
- `Next reading`: point to the best next official page.
- Even with a lighter structure, never delay or omit the answer itself.

Keep answers concise unless the user asks for depth.

### Format Example

Before:

```markdown
Answer
Cursor rules are reusable instructions that guide the agent.

Evidence
- https://cursor.com/docs/rules.md
```

After:

```markdown
Cursor rules are reusable instructions that guide the agent.

Evidence
- https://cursor.com/docs/rules.md
```

## Good Behavior

- Normalize malformed links from `llms.txt`; cite the intended official page, not the malformed string.
- When multiple official pages cover the same topic, prefer the more specific page and mention the secondary page only if it adds context.
- Distinguish official Cursor docs from community content or general knowledge.
- Summarize in your own words unless exact wording is important.
- Only invoke the updater on real coverage gaps; do not pay the latency cost for topics that are already well covered by the curated local index.
- Do not over-trigger on code snippets or repo symbols named `cursor`.

## Examples

User: "What's the difference between Cursor rules and skills?"

Agent behavior:

- Route to `docs/rules.md` and `docs/skills.md`.
- Add `help/customization/skills.md` if the user needs practical usage guidance.
- Answer in the user's language with a short comparison and official links.

User: "How do I set up MCP in Cursor?"

Agent behavior:

- Route to `docs/mcp.md`.
- Add `docs/cli/mcp.md` only if the question is CLI-specific.
- If the question includes auth or server config, cite the relevant subsection.

User: "Can Cursor answer this in Spanish?"

Agent behavior:

- Explain that the final answer should match the user's language.
- Prefer a localized Cursor page if available.
- Otherwise use English docs as evidence and translate the explanation.

## References

- Read `references/llms-index.md` first for the documentation map.
- Read `references/topic-routing.md` for canonical page selection.
- Read `references/index-updater.md` only when there is a real coverage gap.
- Read `references/source-policy.md` for coverage-gap, ambiguity, and evidence rules.
