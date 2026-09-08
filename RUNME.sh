#!/bin/sh
# The tree's one entry. Level zero needs no build, so this runs its checks.
set -e
here=$(cd "$(dirname "$0")" && pwd)
cd "$here"
case "${1:-check}" in
  check) node --test "src/level0/test/*.test.mjs" && node src/level0/bin/lint.mjs . ;;
  lint)  shift; node src/level0/bin/lint.mjs "$@" ;;
  fix)   shift; node src/level0/bin/lint.mjs --fix "$@" ;;
  test)  node --test "src/level0/test/*.test.mjs" ;;
  *) echo "usage: ./RUNME.sh [check|lint|fix|test]"; exit 2 ;;
esac
