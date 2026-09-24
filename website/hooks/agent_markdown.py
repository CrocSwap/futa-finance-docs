"""Publish agent-readable copies of every documentation page.

MkDocs turns source Markdown into directory-style HTML URLs. This hook keeps a
plain Markdown counterpart beside each rendered page and generates llms.txt as
an index agents can use to discover the rest of the documentation.
"""

from __future__ import annotations

import re
import shutil
from pathlib import Path, PurePosixPath

SUMMARY_LINK = re.compile(r"\[(?P<title>[^]]+)]\((?P<target>[^)]+\.md)\)")


def _published_markdown_path(source_path: str) -> PurePosixPath:
    path = PurePosixPath(source_path)
    if path.name == "README.md":
        return path.parent / "index.md"
    return path


def _copy_agent_page(source_path: Path, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(source_path, destination)
    shutil.copyfile(source_path, destination.with_suffix(".txt"))


def _agent_index(config) -> str:
    site_url = config.site_url.rstrip("/")
    summary_path = Path(config.docs_dir) / "SUMMARY.md"

    def replace_link(match: re.Match[str]) -> str:
        published_path = _published_markdown_path(match["target"])
        return f'[{match["title"]}]({site_url}/{published_path.as_posix()})'

    navigation = SUMMARY_LINK.sub(replace_link, summary_path.read_text(encoding="utf-8"))
    navigation = navigation.removeprefix("# Summary").lstrip()
    return (
        "# FUTA Documentation\n\n"
        "> FUTA is a Solana protocol for launching ticker markets, discovering "
        "their opening price through an auction, and continuing trade in a "
        "treasury-backed market.\n\n"
        "Use the Markdown pages below as the primary sources for questions about "
        "FUTA.\n\n"
        f"{navigation}"
    )


def on_post_page(output: str, page, config, **kwargs) -> str:
    """Point each rendered page at its Markdown counterpart.

    The Ask AI menu reads this link, since a page's URL alone does not say
    whether its source was `name.md` or `name/README.md`.
    """
    published_path = _published_markdown_path(page.file.src_uri)
    href = f"/{published_path.as_posix()}"
    link = f'<link rel="alternate" type="text/markdown" href="{href}">'
    return output.replace("</head>", f"{link}\n</head>", 1)


def on_post_build(config, **kwargs) -> None:
    docs_dir = Path(config.docs_dir)
    site_dir = Path(config.site_dir)

    for source_path in docs_dir.rglob("*.md"):
        relative_path = source_path.relative_to(docs_dir)
        if relative_path == Path("SUMMARY.md"):
            continue

        published_path = _published_markdown_path(relative_path.as_posix())
        destination = site_dir / published_path
        _copy_agent_page(source_path, destination)

    (site_dir / "llms.txt").write_text(_agent_index(config), encoding="utf-8")
