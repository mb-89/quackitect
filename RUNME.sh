#!/usr/bin/env sh
# RUNME. The one command that always works.
#
# It does two things: it installs what this tree needs, then it hands every
# argument to the command line. No logic lives here. What the command line
# does is the command line's business, and what has to be installed is the
# install script's.
#
#   ./RUNME.sh            what this tree can do
#   ./RUNME.sh check      the tests, then the rules over the tree
set -eu
here=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)

sh "$here/src/scripts/install.sh"
exec node "$here/src/scripts/cli.mjs" "$@"
