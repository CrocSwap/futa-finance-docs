# Public documentation

The public FUTA documentation: the user-facing guides under `docs/use-futa/` and
the integrator reference under `docs/build-with-futa/`.

The documentation is maintained next to the code it describes —
`docs/use-futa/` tracks the app and `docs/build-with-futa/` tracks the
on-chain programs — so a change to a button label or an instruction signature
can update the documentation in the same commit. Internal engineering notes
are kept separately and are not published.

## Structure

- `docs/` contains the published Markdown pages.
- `docs/SUMMARY.md` defines the navigation for both GitBook and GitHub Pages.
- `mkdocs.yml` configures the GitHub Pages site.
- `hooks/nav_from_summary.py` translates `docs/SUMMARY.md` into MkDocs navigation.
- `hooks/agent_markdown.py` publishes Markdown copies and an `llms.txt` index
  for AI agents.
- `hooks/topic_cards.py` renders a group page's list of topic links (for
  example `docs/use-futa/concepts/README.md`) as a grid of cards on the site.
  A card's text is the topic page's optional `description:` front matter, or
  the first sentence of its intro when that field is absent. The Markdown
  itself stays a plain list for GitBook and the agent copies.
- `hooks/last_modified.py` prints a page's optional `last_modified:` front
  matter (for example `last_modified: 2026-09-23`) at the foot of the table of
  contents rail. Pages without the field show nothing there.
- `docs/javascripts/bookmarks.js` adds a bookmark toggle beside each page title
  and lists bookmarked pages in the right rail. Bookmarks are kept only in the
  reader's browser (`localStorage`, key `futa-docs:bookmarks`).
- `scripts/check-docs.sh` validates navigation and internal links.
- `/.gitbook.yaml` at the repository root points GitBook at `website/docs`.

## Check the documentation

```bash
./website/scripts/check-docs.sh
```

## Preview the site locally

```bash
cd website
python3 -m venv .venv
.venv/bin/pip install -r requirements-docs.txt
.venv/bin/mkdocs serve
```

The preview is served at <http://127.0.0.1:8000/>.

## Build the site

```bash
cd website && .venv/bin/mkdocs build --strict
```

The generated site is written to `website/site/`, which is not tracked in git.
Every rendered page also has a plain Markdown counterpart in the build output,
and `site/llms.txt` indexes those pages for AI agents. The **Ask AI** menu uses
these files to hand the current page to ChatGPT, Claude, or another AI tool.

## Publishing

`.github/workflows/docs.yml` checks every pull request that touches `website/`
and builds the site with MkDocs; the site is published to GitHub Pages at
<https://crocswap.github.io/futa-finance-docs/>. It will move to
`docs.futa.finance` once that DNS record exists: the custom domain is then set
by adding a `docs/CNAME` file (containing `docs.futa.finance`), which is built
into the Pages artifact, and pointing `site_url` in `mkdocs.yml` at it.
