#!/usr/bin/env bash

set -euo pipefail

website_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
repo_root="$(cd "$website_root/.." && pwd)"
summary="$website_root/docs/SUMMARY.md"
status=0

if [[ ! -f "$repo_root/.gitbook.yaml" ]]; then
    echo "Missing .gitbook.yaml" >&2
    status=1
fi

if [[ ! -f "$summary" ]]; then
    echo "Missing website/docs/SUMMARY.md" >&2
    exit 1
fi

while IFS= read -r target; do
    target="${target%%#*}"
    if [[ "$target" == http://* || "$target" == https://* || -z "$target" ]]; then
        continue
    fi

    if [[ ! -f "$website_root/docs/$target" ]]; then
        echo "Broken SUMMARY link: $target" >&2
        status=1
    fi
done < <(sed -nE 's/.*\]\(([^)]+)\).*/\1/p' "$summary")

while IFS= read -r page; do
    relative_page="${page#"$website_root/docs/"}"
    if [[ "$relative_page" == "SUMMARY.md" ]]; then
        continue
    fi

    if ! grep -F -q "($relative_page)" "$summary"; then
        echo "Public page missing from SUMMARY: $relative_page" >&2
        status=1
    fi
done < <(find "$website_root/docs" -type f -name '*.md' | sort)

while IFS= read -r page; do
    while IFS= read -r target; do
        target="${target%%#*}"
        if [[ "$target" == http://* || "$target" == https://* || "$target" == mailto:* || -z "$target" ]]; then
            continue
        fi

        candidate="$(dirname "$page")/$target"
        if [[ ! -f "$candidate" ]]; then
            echo "Broken page link in ${page#"$repo_root/"}: $target" >&2
            status=1
        fi
    done < <(sed -nE 's/.*\]\(([^)]+)\).*/\1/p' "$page")
done < <(find "$website_root/docs" -type f -name '*.md' | sort)

# Prose only: the theme stylesheet legitimately contains words like
# `::placeholder`, and every other check here is scoped to the pages too.
if grep -rn -iE --include='*.md' '\b(TODO|TBD|PLACEHOLDER)\b' "$website_root/docs"; then
    echo "Draft markers found in public documentation" >&2
    status=1
fi

if grep -rn -iE --include='*.md' '\b(command[ -]?palette|dashboard)\b' "$website_root/docs"; then
    echo "Internal-only product surfaces found in public documentation" >&2
    status=1
fi

if [[ $status -ne 0 ]]; then
    exit "$status"
fi

echo "Documentation structure checks passed."
