"""Draw each heading's permanent link as a link icon instead of a pilcrow.

The toc extension (`permalink: true` in mkdocs.yml) writes the anchor's text as
`&para;`, and only takes plain text, so the icon is swapped in here. The link
keeps its `title="Permanent link"`, which stays its accessible name; the icon is
hidden from assistive technology. Its colour and hit area are in extra.css.
"""

from __future__ import annotations

import re

# Python-Markdown's toc output for a heading's permanent link.
PILCROW_LINK = re.compile(r'(<a class="headerlink" [^>]*>)&para;(</a>)')

# Ionicons 5 `link-sharp` (react-icons `IoLinkSharp`), MIT licensed. Stroked
# in currentColor so the link's colour states apply to it.
LINK_ICON = (
    '<svg class="futa-permalink-icon" viewBox="0 0 512 512" '
    'aria-hidden="true" focusable="false">'
    '<path fill="none" stroke="currentColor" stroke-linecap="square" '
    'stroke-linejoin="round" stroke-width="48" '
    'd="M200.66 352H144a96 96 0 0 1 0-192h55.41m113.18 0H368a96 96 0 0 1 '
    '0 192h-56.66m-142.27-96h175.86"/></svg>'
)


def on_page_content(html_content: str, page, config, files, **kwargs) -> str:
    return PILCROW_LINK.sub(rf"\g<1>{LINK_ICON}\g<2>", html_content)
