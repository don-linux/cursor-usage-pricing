# cursor-brand

An Agent Skill that teaches AI coding agents (Cursor, Claude Code, etc.) how to produce on-brand Cursor designs — tweets, event assets, slides, end cards, loading states, landing pages, anything that carries the Cursor name.

Distilled from the official **Cursor Community Brand Guidelines** into a single self-contained skill: voice, palette, typography, logo rules, motion, and a pre-ship checklist — plus the canonical logo SVGs, Cursor Gothic font files, and animation stills vendored alongside.

## What's inside

```
.
├── SKILL.md                        # the skill (read this first)
└── assets/
    ├── logos/
    │   ├── General Logos/          # cube, wordmark, lockups (SVG — embed directly)
    │   ├── Avatars/                # social avatars (PNG)
    │   └── App Icons/              # app icons (PNG)
    ├── fonts/
    │   ├── WEB/WOFF2/              # Cursor Gothic for web
    │   └── DESKTOP/OTF/            # Cursor Gothic for design apps
    └── animations-preview/         # stills from the official logo animations pack
```

## Install

Use [`npx skills`](https://github.com/vercel-labs/skills) — the open agent skills CLI from Vercel Labs. It auto-detects your installed coding agents (Cursor, Claude Code, Codex, OpenCode, Windsurf, and 40+ more) and installs the skill to the right directories.

### Project-scoped (recommended for teams)

```bash
cd your-project
npx skills add cursorcommunityled/cursor-brand
```

### Globally (available in every workspace)

```bash
npx skills add cursorcommunityled/cursor-brand -g
```

### Target a specific agent

```bash
npx skills add cursorcommunityled/cursor-brand -a cursor
npx skills add cursorcommunityled/cursor-brand -a claude-code
npx skills add cursorcommunityled/cursor-brand -a codex
```

### Non-interactive (CI / scripted)

```bash
npx skills add cursorcommunityled/cursor-brand -g -a cursor -y
```

Once installed, the agent auto-loads the skill whenever you ask for anything Cursor-branded. To update later, run `npx skills update cursor-brand`.

## Usage

Just ask. The skill triggers on requests to design, visualize, or write anything Cursor-branded — for example:

- "Make a tweet image announcing the Cursor team's visit to Bangalore."
- "Design an end card for our community meetup recap video."
- "Generate a slide deck cover for a Cursor workshop."
- "Write a launch post for a new Cursor community chapter."

The agent will pull voice, palette, typography, and logo rules from `SKILL.md` and use the vendored assets directly.

## Attribution & ownership

All brand assets in `assets/` — the Cursor cube, wordmark, lockups, app icons, avatars, and the **Cursor Gothic** typeface — are the property of **Anysphere (Cursor)**. Use them only to represent Cursor, and follow the rules in `SKILL.md`.

The skill instructions (`SKILL.md`) are provided for the Cursor community to use freely when producing Cursor-branded work.

This is a community skill.

## Maintainer

Built by **[@sanjeed5](https://github.com/sanjeed5)** ([x.com/sanjeed_i](https://x.com/sanjeed_i)), Cursor Ambassador.

Feel free to update it as you use it.
