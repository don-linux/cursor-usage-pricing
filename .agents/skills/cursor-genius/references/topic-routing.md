# Topic Routing

Use this file to route common Cursor questions to the most relevant official pages before searching more broadly.

## Routing Rules

| Question type | Start with | Add if needed | Notes |
| --- | --- | --- | --- |
| What is Agent, Ask Mode, Plan Mode, or Debug Mode? | `https://cursor.com/docs/agent/overview.md` | `https://cursor.com/docs/agent/plan-mode.md`, `https://cursor.com/docs/agent/debug-mode.md`, `https://cursor.com/help/ai-features/agent.md`, `https://cursor.com/help/ai-features/ask-mode.md`, `https://cursor.com/help/ai-features/plan-mode.md`, `https://cursor.com/help/ai-features/debug-mode.md` | Prefer `docs/agent/*` for behavior; add `help/` for UI-oriented explanation. |
| How do agent tools work? | `https://cursor.com/docs/agent/tools/terminal.md` | `https://cursor.com/docs/agent/tools/browser.md`, `https://cursor.com/docs/agent/tools/search.md`, `https://cursor.com/help/ai-features/browser.md`, `https://cursor.com/help/ai-features/terminal.md` | Use the specific tool page when the question names a tool. |
| What is the difference between rules and skills? | `https://cursor.com/docs/rules.md` | `https://cursor.com/docs/skills.md`, `https://cursor.com/help/customization/rules.md`, `https://cursor.com/help/customization/skills.md` | Use docs pages for the conceptual distinction, help pages for practical usage. |
| How do I create or use a skill? | `https://cursor.com/docs/skills.md` | `https://cursor.com/help/customization/skills.md` | `docs/skills.md` is the canonical reference. |
| How do subagents work? | `https://cursor.com/docs/subagents.md` | `https://cursor.com/docs/cloud-agent.md` | Add cloud-agent docs only if the question crosses into remote execution or automation. |
| How do prompts, context, or instructions work? | `https://cursor.com/docs/agent/prompting.md` | `https://cursor.com/help/customization/context.md`, `https://cursor.com/docs/rules.md` | Use `docs/agent/prompting.md` first for prompt behavior. |
| How do I set up MCP? | `https://cursor.com/docs/mcp.md` | `https://cursor.com/help/customization/mcp.md`, `https://cursor.com/docs/cli/mcp.md` | Add CLI MCP docs only for terminal or agent CLI workflows. |
| How do I use the Cursor CLI? | `https://cursor.com/docs/cli/overview.md` | `https://cursor.com/docs/cli/installation.md`, `https://cursor.com/docs/cli/using.md`, `https://cursor.com/docs/cli/reference/slash-commands.md`, `https://cursor.com/docs/cli/reference/configuration.md` | Use the smallest specific CLI page that answers the question. |
| What models, limits, or pricing apply? | `https://cursor.com/docs/models-and-pricing.md` | `https://cursor.com/help/models-and-usage/available-models.md`, `https://cursor.com/help/models-and-usage/usage-limits.md`, `https://cursor.com/help/models-and-usage/token-fee.md` | Prefer `docs/` for product positioning and `help/` for usage or billing edge cases. |
| How do billing, teams, or enterprise settings work? | `https://cursor.com/docs/account/teams/setup.md` | `https://cursor.com/docs/enterprise.md`, `https://cursor.com/help/account-and-billing/billing.md`, `https://cursor.com/help/account-and-billing/teams-setup.md`, `https://cursor.com/help/account-and-billing/enterprise.md` | Start narrow if the user mentions a specific billing or enterprise topic. |
| How do integrations work? | `https://cursor.com/docs/integrations/github.md` | `https://cursor.com/docs/integrations/gitlab.md`, `https://cursor.com/docs/integrations/slack.md`, `https://cursor.com/docs/integrations/linear.md`, `https://cursor.com/help/integrations/cli.md`, `https://cursor.com/help/integrations/third-party.md` | Route to the named integration first. |
| How do cloud agents, automations, or Bugbot work? | `https://cursor.com/docs/cloud-agent.md` | `https://cursor.com/docs/cloud-agent/automations.md`, `https://cursor.com/docs/bugbot.md`, `https://cursor.com/help/ai-features/cloud-agents.md`, `https://cursor.com/help/ai-features/automations.md`, `https://cursor.com/help/ai-features/bugbot.md` | Prefer product docs for capability descriptions, help pages for usage guidance. |
| How do I troubleshoot Cursor? | `https://cursor.com/help/troubleshooting/agent-issues.md` | `https://cursor.com/help/troubleshooting/install-issues.md`, `https://cursor.com/help/troubleshooting/network.md`, `https://cursor.com/help/troubleshooting/performance.md`, `https://cursor.com/help/troubleshooting/extensions.md` | Troubleshooting starts in `help/`, not `docs/`. |
| Is there a localized doc page? | Same path as the English page with a language prefix such as `/es/` or `/ja/` | Fall back to the English page | Use localized pages when they exist and improve clarity, but treat the English page as canonical when in doubt. |

## Selection Heuristics

- Prefer the most specific page over a broad overview page.
- Prefer `docs/` over `help/` for product behavior, configuration, and canonical definitions.
- Prefer `help/` over `docs/` for troubleshooting, onboarding, and "where in the UI?" questions.
- If the user asks "where is this documented?", give the most canonical page first and optionally a second page for practical guidance.
- If a question spans multiple domains, ask a clarifying question before mixing too many sources.
