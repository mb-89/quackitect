#!/usr/bin/env sh
# RUNME — quackitect v2, POSIX. See RUNME.ps1 for the Windows path.
set -e

fail() { echo "RUNME: FAIL - $1" >&2; exit 1; }

command -v node >/dev/null 2>&1 || fail "install Node >= 22 first (https://nodejs.org)"
major=$(node --version | sed 's/^v//' | cut -d. -f1)
[ "$major" -ge 22 ] || fail "Node >= 22 required, found $(node --version)"

dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
[ -f "$dir/../benjamin/package.json" ] || fail "sibling checkout missing: clone mb-89/benjamin next to this repo (../benjamin)"

cd "$dir"
npm ci
npm run verify

echo ""
echo "RUNME: GREEN - quackitect v2 verified on this machine"
