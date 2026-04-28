#!/usr/bin/env python3
"""Build a session-only routing overlay from Cursor's live llms.txt sitemap."""

from __future__ import annotations

import argparse
import re
import sys
from collections import OrderedDict
from dataclasses import dataclass
from typing import Iterable
from urllib.error import HTTPError, URLError
from urllib.parse import urljoin, urlparse, urlunparse
from urllib.request import Request, urlopen


DEFAULT_SOURCE_URL = "https://cursor.com/llms.txt"
DEFAULT_TIMEOUT_SECONDS = 15
DEFAULT_MAX_SECTIONS = 4
DEFAULT_MAX_LINKS = 5
DEFAULT_MAX_SUGGESTIONS = 6

STOPWORDS = {
    "a",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "by",
    "can",
    "cursor",
    "did",
    "difference",
    "do",
    "does",
    "for",
    "from",
    "get",
    "how",
    "i",
    "in",
    "is",
    "it",
    "me",
    "my",
    "of",
    "on",
    "or",
    "set",
    "setup",
    "that",
    "the",
    "this",
    "to",
    "up",
    "use",
    "what",
    "when",
    "where",
    "which",
    "why",
    "with",
    "work",
    "works",
}

KEYWORD_EXPANSIONS = {
    "agent": {"ask", "agent", "debug", "mode", "plan"},
    "billing": {"billing", "invoice", "overage", "pricing", "refund"},
    "browser": {"agent", "browser", "tools"},
    "bugbot": {"automations", "bugbot", "cloud"},
    "cli": {"cli", "command", "commands", "headless", "shell"},
    "cloud": {"automations", "bugbot", "cloud"},
    "context": {"context", "prompting", "rules", "skills"},
    "debug": {"agent", "debug", "mode"},
    "enterprise": {"compliance", "enterprise", "governance", "privacy", "scim", "sso"},
    "integration": {"github", "gitlab", "integration", "integrations", "jetbrains", "linear", "slack"},
    "integrations": {"github", "gitlab", "integration", "integrations", "jetbrains", "linear", "slack"},
    "mcp": {"cli", "context", "mcp", "model", "protocol"},
    "model": {"limits", "model", "models", "pricing", "usage"},
    "models": {"limits", "model", "models", "pricing", "usage"},
    "plan": {"agent", "mode", "plan"},
    "pricing": {"billing", "limits", "model", "models", "pricing", "usage"},
    "prompt": {"context", "prompt", "prompting", "rules"},
    "rules": {"context", "prompting", "rule", "rules", "skills"},
    "rule": {"context", "prompting", "rule", "rules", "skills"},
    "shared": {"shared", "transcript", "transcripts"},
    "skill": {"agent", "customization", "skill", "skills"},
    "skills": {"agent", "customization", "skill", "skills"},
    "terminal": {"agent", "cli", "shell", "terminal", "tools"},
    "transcript": {"shared", "transcript", "transcripts"},
    "transcripts": {"shared", "transcript", "transcripts"},
    "troubleshoot": {"error", "install", "issue", "network", "performance", "troubleshooting"},
    "troubleshooting": {"error", "install", "issue", "network", "performance", "troubleshooting"},
}


@dataclass(frozen=True)
class LinkEntry:
    label: str
    url: str
    path: str
    order: int


@dataclass
class Section:
    name: str
    order: int
    entries: list[LinkEntry]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Fetch Cursor's live llms.txt sitemap and emit a compact, "
            "session-only routing overlay for the current question."
        )
    )
    parser.add_argument(
        "query",
        nargs="*",
        help="Current user question or topic to rank live documentation routes against.",
    )
    parser.add_argument(
        "--source-url",
        default=DEFAULT_SOURCE_URL,
        help=f"Source llms.txt URL. Defaults to {DEFAULT_SOURCE_URL}.",
    )
    parser.add_argument(
        "--timeout",
        type=int,
        default=DEFAULT_TIMEOUT_SECONDS,
        help=f"HTTP timeout in seconds. Defaults to {DEFAULT_TIMEOUT_SECONDS}.",
    )
    parser.add_argument(
        "--max-sections",
        type=int,
        default=DEFAULT_MAX_SECTIONS,
        help=f"Maximum number of ranked sections to print. Defaults to {DEFAULT_MAX_SECTIONS}.",
    )
    parser.add_argument(
        "--max-links",
        type=int,
        default=DEFAULT_MAX_LINKS,
        help=f"Maximum number of links to print per section. Defaults to {DEFAULT_MAX_LINKS}.",
    )
    parser.add_argument(
        "--max-suggestions",
        type=int,
        default=DEFAULT_MAX_SUGGESTIONS,
        help=(
            "Maximum number of suggested starting pages to print. "
            f"Defaults to {DEFAULT_MAX_SUGGESTIONS}."
        ),
    )
    return parser.parse_args()


def fetch_text(source_url: str, timeout: int) -> str:
    request = Request(
        source_url,
        headers={"User-Agent": "cursor-genius-index-updater/1.0"},
    )
    try:
        with urlopen(request, timeout=timeout) as response:
            charset = response.headers.get_content_charset() or "utf-8"
            return response.read().decode(charset, errors="replace")
    except HTTPError as exc:
        raise RuntimeError(f"HTTP {exc.code} while fetching {source_url}") from exc
    except URLError as exc:
        raise RuntimeError(f"Failed to reach {source_url}: {exc.reason}") from exc


def clean_heading(raw_heading: str) -> str:
    return re.sub(r"\s+", " ", raw_heading.strip())


def normalize_url(raw_value: str) -> tuple[str | None, bool]:
    candidate = raw_value.strip().strip("`").rstrip(".,);")
    changed = False

    if not candidate:
        return None, False

    match = re.search(r"(https?://\S+|/\S+|cursor\.com/\S+)", candidate)
    if not match:
        return None, False
    candidate = match.group(1)

    if candidate.startswith("/"):
        candidate = urljoin("https://cursor.com", candidate)
        changed = True
    elif candidate.startswith("cursor.com/"):
        candidate = f"https://{candidate}"
        changed = True

    for prefix in ("https://cursor.com", "http://cursor.com"):
        if candidate.count(prefix) > 1:
            candidate = candidate[candidate.rfind(prefix) :]
            changed = True

    parsed = urlparse(candidate)
    if not parsed.scheme and candidate.startswith("cursor.com"):
        parsed = urlparse(f"https://{candidate}")
        changed = True

    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        return None, changed

    netloc = parsed.netloc.lower()
    if netloc == "www.cursor.com":
        netloc = "cursor.com"
        changed = True

    if netloc != "cursor.com":
        return None, changed

    path = re.sub(r"/{2,}", "/", parsed.path or "/")
    if path != (parsed.path or "/"):
        changed = True

    normalized = urlunparse(("https", netloc, path, "", "", ""))
    if normalized != candidate:
        changed = True

    return normalized, changed


def build_section_name(headings: list[str]) -> str:
    if not headings:
        return "General"
    return " / ".join(heading for heading in headings if heading)


def slug_to_title(slug: str) -> str:
    if not slug:
        return "Home"
    return slug.replace(".md", "").replace("-", " ").replace("_", " ").strip().title()


def label_from_url(url: str) -> str:
    path = urlparse(url).path
    if path == "/llms.txt":
        return "LLM Sitemap"
    if path in {"/", ""}:
        return "Home"
    if path in {"/docs.md", "/docs"}:
        return "Docs Hub"
    if path in {"/help", "/help/"}:
        return "Help Center"
    last_segment = path.rstrip("/").split("/")[-1]
    return slug_to_title(last_segment)


def parse_sections(text: str) -> tuple[list[Section], dict[str, int]]:
    sections: OrderedDict[str, Section] = OrderedDict()
    headings: list[str] = []
    seen_urls: set[str] = set()
    stats = {
        "kept": 0,
        "duplicates_removed": 0,
        "malformed_dropped": 0,
        "urls_normalized": 0,
    }

    for raw_line in text.splitlines():
        stripped = raw_line.strip()
        if not stripped or stripped.startswith("```"):
            continue

        heading_match = re.match(r"^(#{1,6})\s+(.*)$", stripped)
        if heading_match:
            level = len(heading_match.group(1))
            heading = clean_heading(heading_match.group(2))
            headings = headings[: level - 1]
            headings.append(heading)
            continue

        bullet_match = re.match(r"^\s*-\s+(.*)$", raw_line)
        if not bullet_match:
            continue

        normalized, changed = normalize_url(bullet_match.group(1))
        if not normalized:
            stats["malformed_dropped"] += 1
            continue
        if changed:
            stats["urls_normalized"] += 1
        if normalized in seen_urls:
            stats["duplicates_removed"] += 1
            continue

        seen_urls.add(normalized)
        section_name = build_section_name(headings)
        section = sections.setdefault(
            section_name,
            Section(name=section_name, order=len(sections), entries=[]),
        )
        path = urlparse(normalized).path
        section.entries.append(
            LinkEntry(
                label=label_from_url(normalized),
                url=normalized,
                path=path,
                order=len(section.entries),
            )
        )
        stats["kept"] += 1

    return list(sections.values()), stats


def tokenize_query(query: str) -> list[str]:
    raw_tokens = re.findall(r"[a-z0-9][a-z0-9.+-]*", query.lower())
    tokens: set[str] = set()
    for token in raw_tokens:
        if token in STOPWORDS or len(token) <= 1:
            continue
        tokens.add(token)
        if token.endswith("s") and len(token) > 3:
            tokens.add(token[:-1])
        if token in KEYWORD_EXPANSIONS:
            tokens.update(KEYWORD_EXPANSIONS[token])
    return sorted(tokens)


def tokenize_text(text: str) -> set[str]:
    return set(re.findall(r"[a-z0-9][a-z0-9.+-]*", text.lower()))


def score_entry(section_name: str, entry: LinkEntry, tokens: Iterable[str]) -> int:
    section_tokens = tokenize_text(section_name)
    label_tokens = tokenize_text(entry.label)
    path_tokens = tokenize_text(entry.path)
    score = 0
    for token in tokens:
        if token in label_tokens:
            score += 8
        elif token in path_tokens:
            score += 6
        elif token in section_tokens:
            score += 3
    return score


def rank_sections(
    sections: list[Section],
    tokens: list[str],
    max_sections: int,
    max_links: int,
) -> list[dict[str, object]]:
    ranked: list[dict[str, object]] = []
    for section in sections:
        scored_entries = []
        for entry in section.entries:
            score = score_entry(section.name, entry, tokens)
            scored_entries.append((score, entry.order, entry))

        section_tokens = tokenize_text(section.name)
        section_score = sum(3 for token in tokens if token in section_tokens)
        section_score += sum(min(score, 10) for score, _, _ in scored_entries if score > 0)

        if tokens and section_score == 0:
            continue

        scored_entries.sort(key=lambda item: (-item[0], item[1]))
        if tokens:
            selected_entries = [entry for score, _, entry in scored_entries if score > 0][:max_links]
        else:
            selected_entries = [entry for _, _, entry in scored_entries[:max_links]]
        if not selected_entries and scored_entries:
            selected_entries = [scored_entries[0][2]]
        ranked.append(
            {
                "section": section.name,
                "section_score": section_score if tokens else 1,
                "entries": selected_entries,
                "scored_entries": scored_entries,
                "order": section.order,
            }
        )

    ranked.sort(key=lambda item: (-int(item["section_score"]), int(item["order"])))
    if ranked:
        return ranked[:max_sections]

    # If nothing matches the query, fall back to the first sections in original order.
    fallback = []
    for section in sections[:max_sections]:
        fallback.append(
            {
                "section": section.name,
                "section_score": 0,
                "entries": section.entries[:max_links],
                "scored_entries": [(0, entry.order, entry) for entry in section.entries],
                "order": section.order,
            }
        )
    return fallback


def build_suggestions(
    ranked_sections: list[dict[str, object]],
    max_suggestions: int,
) -> list[tuple[int, str, LinkEntry]]:
    suggestions: list[tuple[int, str, LinkEntry]] = []
    seen_urls: set[str] = set()
    for ranked_section in ranked_sections:
        section_name = str(ranked_section["section"])
        for score, _, entry in ranked_section["scored_entries"]:
            if entry.url in seen_urls:
                continue
            seen_urls.add(entry.url)
            suggestions.append((score, section_name, entry))

    suggestions.sort(key=lambda item: (-item[0], item[2].order, item[1]))
    return suggestions[:max_suggestions]


def render_overlay(
    query: str,
    source_url: str,
    stats: dict[str, int],
    ranked_sections: list[dict[str, object]],
    suggestions: list[tuple[int, str, LinkEntry]],
) -> str:
    lines: list[str] = []
    lines.append("# Cursor Live Index Overlay")
    lines.append("")
    lines.append(f"- Source: `{source_url}`")
    lines.append("- Session-only: `yes`")
    lines.append("- Writes to curated index: `no`")
    if query:
        lines.append(f"- Query: `{query}`")
    lines.append(
        "- Normalization summary:"
        f" kept={stats['kept']},"
        f" normalized={stats['urls_normalized']},"
        f" duplicates_removed={stats['duplicates_removed']},"
        f" malformed_dropped={stats['malformed_dropped']}"
    )
    lines.append("")

    if suggestions:
        lines.append("## Suggested Starting Pages")
        lines.append("")
        for idx, (_, section_name, entry) in enumerate(suggestions, start=1):
            lines.append(f"{idx}. `{entry.label}` in `{section_name}` -> `{entry.url}`")
        lines.append("")

    lines.append("## Ranked Sections")
    lines.append("")
    for ranked_section in ranked_sections:
        section_name = str(ranked_section["section"])
        section_score = int(ranked_section["section_score"])
        entries = ranked_section["entries"]
        lines.append(f"### {section_name} (score: {section_score})")
        for entry in entries:
            lines.append(f"- `{entry.label}` -> `{entry.url}`")
        lines.append("")

    lines.append("## Usage Notes")
    lines.append("")
    lines.append("- Treat this overlay as temporary session context.")
    lines.append("- Do not rewrite `references/llms-index.md` from this output.")
    lines.append("- If the local curated index already answers the question, prefer it and skip this updater.")
    return "\n".join(lines).rstrip() + "\n"


def main() -> int:
    args = parse_args()
    query = " ".join(args.query).strip()

    try:
        source_text = fetch_text(args.source_url, args.timeout)
        sections, stats = parse_sections(source_text)
        if not sections:
            raise RuntimeError("Parsed zero usable sections from the live llms.txt source.")

        tokens = tokenize_query(query)
        ranked_sections = rank_sections(
            sections=sections,
            tokens=tokens,
            max_sections=max(1, args.max_sections),
            max_links=max(1, args.max_links),
        )
        suggestions = build_suggestions(
            ranked_sections=ranked_sections,
            max_suggestions=max(1, args.max_suggestions),
        )
        overlay = render_overlay(
            query=query,
            source_url=args.source_url,
            stats=stats,
            ranked_sections=ranked_sections,
            suggestions=suggestions,
        )
        sys.stdout.write(overlay)
        return 0
    except RuntimeError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
