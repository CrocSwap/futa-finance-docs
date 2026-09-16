"""Build the MkDocs navigation from docs/SUMMARY.md.

SUMMARY.md is the GitBook navigation file and stays the single source of truth.
GitBook renders `## Heading` as a top-level section and nested list items as
child pages; this hook maps both onto the equivalent MkDocs `nav` structure.
"""

from __future__ import annotations

import re
from pathlib import Path

HEADING = re.compile(r"^##\s+(?P<title>.+?)\s*$")
ITEM = re.compile(r"^(?P<indent>\s*)[-*]\s+\[(?P<title>.+?)\]\((?P<target>[^)]+)\)\s*$")


def _collapse(nav):
    """Turn single-page entries back into plain `Title: page.md` mappings."""
    collapsed = []
    for entry in nav:
        (title, children), = entry.items()
        if isinstance(children, str):
            collapsed.append(entry)
        elif len(children) == 1 and isinstance(children[0], str):
            collapsed.append({title: children[0]})
        else:
            collapsed.append({title: _collapse_mixed(children)})
    return collapsed


def _collapse_mixed(children):
    return [child if isinstance(child, str) else _collapse([child])[0] for child in children]


def on_config(config, **kwargs):
    summary = Path(config.docs_dir) / "SUMMARY.md"
    if not summary.is_file():
        raise FileNotFoundError(f"Expected navigation file at {summary}")

    nav: list = []
    section: list = nav
    stack: list[tuple[int, list]] = [(-1, section)]

    for line in summary.read_text(encoding="utf-8").splitlines():
        heading = HEADING.match(line)
        if heading:
            section = []
            nav.append({heading["title"]: section})
            stack = [(-1, section)]
            continue

        item = ITEM.match(line)
        if not item:
            continue

        target = item["target"]
        if target.startswith(("http://", "https://", "mailto:")):
            entry, children = target, None
        else:
            children = [target]
            entry = children

        indent = len(item["indent"].expandtabs(4))
        while stack and stack[-1][0] >= indent:
            stack.pop()
        stack[-1][1].append({item["title"]: entry})
        if children is not None:
            stack.append((indent, children))

    config.nav = _collapse_mixed(nav)
    return config
