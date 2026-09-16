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
<https://docs.futa.finance/>. The custom domain comes from `docs/CNAME`, which
is built into the Pages artifact.
