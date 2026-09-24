"""Show a page's `last_modified:` front matter at the foot of the right rail.

The date sits under the table of contents, inside the secondary sidebar, so it
is swapped with the rest of the page on instant navigation. A page without the
field, or with an empty one, gets nothing: no label and no placeholder.

YAML reads an unquoted `2026-09-23` as a date, which is printed as-is; a
quoted string is printed verbatim, and gets a machine-readable `datetime` only
when it is an ISO date. The markup is injected here rather than through a
template override so Material's own partials stay stock (see extra.css).
"""

from __future__ import annotations

import datetime
import html

SIDEBAR = 'class="md-sidebar md-sidebar--secondary"'
CONTENT = 'data-md-component="content"'
NAV_END = "</nav>"


def _date_markup(value) -> str | None:
    if isinstance(value, datetime.datetime):
        value = value.date()
    if isinstance(value, datetime.date):
        iso = value.isoformat()
        return f'<time datetime="{iso}">{iso}</time>'
    if isinstance(value, str) and value.strip():
        text = value.strip()
        try:
            iso = datetime.date.fromisoformat(text).isoformat()
        except ValueError:
            return html.escape(text)
        return f'<time datetime="{iso}">{html.escape(text)}</time>'
    return None


def on_post_page(output: str, page, config, **kwargs) -> str:
    date = _date_markup(page.meta.get("last_modified"))
    if date is None:
        return output

    # The rail's table of contents is the last <nav> before the content
    # column; the note goes straight after it, inside the rail.
    sidebar = output.find(SIDEBAR)
    content = output.find(CONTENT, sidebar)
    if sidebar == -1 or content == -1:
        return output
    nav_end = output.rfind(NAV_END, sidebar, content)
    if nav_end == -1:
        return output
    insert_at = nav_end + len(NAV_END)

    note = f'<p class="futa-last-modified">Last modified {date}</p>'
    return output[:insert_at] + note + output[insert_at:]
