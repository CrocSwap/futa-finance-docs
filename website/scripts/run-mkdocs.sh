#!/usr/bin/env bash
#
# Runs mkdocs from website/.venv, creating and populating that virtualenv first
# if it is missing or out of date. All arguments are passed through to mkdocs,
# e.g. `run-mkdocs.sh serve` or `run-mkdocs.sh build --strict`.

set -euo pipefail

website_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
venv="$website_root/.venv"
requirements="$website_root/requirements-docs.txt"
# Records the requirements file the virtualenv was last installed from.
stamp="$venv/.requirements-docs.stamp"

cd "$website_root"

if [[ ! -x "$venv/bin/pip" ]]; then
    echo "Setting up the docs virtualenv in website/.venv ..."
    python3 -m venv "$venv"
    "$venv/bin/pip" install --quiet --upgrade pip
fi

if ! cmp --silent "$requirements" "$stamp" 2>/dev/null; then
    echo "Installing docs dependencies ..."
    "$venv/bin/pip" install --quiet -r "$requirements"
    cp "$requirements" "$stamp"
fi

exec "$venv/bin/mkdocs" "$@"
