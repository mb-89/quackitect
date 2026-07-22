#!/usr/bin/env sh
# RUNME — run me: start an agent in the workspace.
# Setup happens only when missing. Verification lives in `npm run verify`.
set -e

fail() { echo "RUNME: $1" >&2; exit 1; }

command -v node >/dev/null 2>&1 || fail "install Node >= 22 first (https://nodejs.org)"
major=$(node --version | sed 's/^v//' | cut -d. -f1)
[ "$major" -ge 22 ] || fail "Node >= 22 required, found $(node --version)"

dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
[ -f "$dir/../benjamin/package.json" ] || fail "sibling checkout missing: clone mb-89/benjamin next to this repo (../benjamin)"

if [ ! -d "$dir/product/deliverable/node_modules" ]; then
  (cd "$dir/product/deliverable" && npm ci)
fi

command -v claude >/dev/null 2>&1 || fail "Claude Code not found - install it, then re-run (or start your agent in workspace/ yourself)"
cd "$dir/workspace"
exec claude
