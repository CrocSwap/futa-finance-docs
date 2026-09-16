# futadocs

Public documentation for [FUTA](https://futa.finance/), a Solana protocol for
launching ticker markets. Published to <https://docs.futa.finance/>.

The contents of `website/` are synced here from upstream; edits made directly
to them will be overwritten by the next sync. To request a change, open an
issue or a pull request and it will be ported upstream.

## Layout

- `website/docs/` — the published Markdown pages.
- `website/docs/SUMMARY.md` — navigation for both GitBook and GitHub Pages.
- `website/mkdocs.yml` — the MkDocs configuration.
- `website/scripts/check-docs.sh` — navigation and link checks (runs in CI).
- `.github/workflows/docs.yml` — builds the site and deploys it to GitHub
  Pages.

## Preview locally

```bash
./website/scripts/run-mkdocs.sh serve
```

This creates `website/.venv` on first run, then serves the site at
<http://127.0.0.1:8000/>.
