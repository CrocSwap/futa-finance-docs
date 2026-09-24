"""Render a group page's list of topics as a grid of cards.

A group page (a section's README.md, such as use-futa/concepts/) is an intro
followed by a bare bullet list of links, one per topic. On the rendered site
that list becomes a card per topic: its title, plus a one-line description.

The Markdown is not changed: GitBook and the agent-readable copies keep the
plain list. Each card's description comes from the topic page's optional
`description:` front matter; without one, the first sentence of the page's
intro is used, and a page with no usable first sentence gets a title-only card.
"""

from __future__ import annotations

import html
import posixpath
import re
from pathlib import Path

from mkdocs.utils.meta import get_data

# Python-Markdown's output for a list whose every item is one bare link.
LINK_LIST = re.compile(
    r"<ul>\n(?P<items>(?:<li><a href=\"[^\"]+\">[^<]+</a></li>\n)+)</ul>"
)
LINK_ITEM = re.compile(r"<li><a href=\"(?P<href>[^\"]+)\">(?P<title>[^<]+)</a></li>")

# A paragraph opening with one of these is a heading, table, list, quote or
# fence, not an intro sentence.
BLOCK_START = re.compile(r"^(#|\||[-*+]\s|>|```|~~~|\d+\.\s)")
FIRST_SENTENCE = re.compile(r"^(?P<sentence>.+?[.!?])(?=\s|$)", re.DOTALL)
MD_LINK = re.compile(r"\[([^\]]+)\]\([^)]*\)")
MD_EMPHASIS = re.compile(r"(\*\*|__|\*|_)(?=\S)(.+?)(?<=\S)\1")
MD_CODE = re.compile(r"`([^`]+)`")


def _first_sentence(markdown: str) -> str | None:
    """The first sentence of the paragraph after the page's `# ` title."""
    lines = markdown.splitlines()
    try:
        start = next(i for i, line in enumerate(lines) if line.startswith("# ")) + 1
    except StopIteration:
        return None

    paragraph: list[str] = []
    for line in lines[start:]:
        if not line.strip():
            if paragraph:
                break
            continue
        if not paragraph and BLOCK_START.match(line.lstrip()):
            return None
        paragraph.append(line.strip())

    match = FIRST_SENTENCE.match(" ".join(paragraph))
    return match["sentence"] if match else None


def _inline_html(text: str) -> str:
    """Plain card text: links and emphasis flattened, inline code kept."""
    text = MD_LINK.sub(r"\1", text)
    text = MD_EMPHASIS.sub(r"\2", text)
    parts = MD_CODE.split(text)
    # split() alternates plain text and code spans.
    return "".join(
        f"<code>{html.escape(part)}</code>" if i % 2 else html.escape(part)
        for i, part in enumerate(parts)
    )


def _description(file) -> str | None:
    markdown, meta = get_data(Path(file.abs_src_path).read_text(encoding="utf-8"))
    curated = meta.get("description")
    if isinstance(curated, str) and curated.strip():
        return _inline_html(curated.strip())
    sentence = _first_sentence(markdown)
    return _inline_html(sentence) if sentence else None


def _card(href: str, title: str, description: str | None) -> str:
    text = f'<span class="futa-card__title">{title}</span>'
    if description:
        text += f'<span class="futa-card__description">{description}</span>'
    return f'<li><a class="futa-card" href="{href}">{text}</a></li>'


def on_page_content(html_content: str, page, config, files, **kwargs) -> str:
    if not page.file.src_uri.endswith("README.md"):
        return html_content

    pages_by_url = {file.url: file for file in files.documentation_pages()}

    def target(href: str):
        if "://" in href or href.startswith(("#", "/", "mailto:")):
            return None
        url = posixpath.normpath(posixpath.join(page.file.url, href.split("#")[0]))
        url = "" if url == "." else url
        return pages_by_url.get(f"{url}/") or pages_by_url.get(url)

    def replace(match: re.Match[str]) -> str:
        links = [(m["href"], m["title"]) for m in LINK_ITEM.finditer(match["items"])]
        targets = [target(href) for href, _ in links]
        # Leave a list alone unless every link is a page in this site.
        if not links or not all(targets):
            return match[0]
        cards = "\n".join(
            _card(href, title, _description(file))
            for (href, title), file in zip(links, targets)
        )
        return f'<ul class="futa-cards">\n{cards}\n</ul>'

    return LINK_LIST.sub(replace, html_content)
