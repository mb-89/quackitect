#!/usr/bin/env sh
# RUNME. The one command that always works.
#
# It installs what this tree needs. Bare, it then opens the editor here with
# the quackitect panel showing. With a verb, it hands the verb to the command
# line.
set -eu
here=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)

sh "$here/src/scripts/install.sh"

# [[spec/design_output/editor#one-command-opens-the-editor]]
if [ "$#" -eq 0 ]; then
  mkdir -p "$here/.se/.runtime"
  printf 'show\n' > "$here/.se/.runtime/show-panel"
  [ -n "${SE_EDITOR_OPENS:-}" ] && exit 0
  if command -v code >/dev/null 2>&1; then
    code "$here"
    exit 0
  fi
  printf '%s\n' "No code stands on the PATH. Install VS Code, then open this folder in it." >&2
  exit 1
fi

# The binary picks the road off the verbs slice, and the verb's program answers where no binary stands. [[spec/tickets/cli-js-leaves]]
bin="$here/.se/.runtime/bin/se-index"
[ -x "$bin.exe" ] && bin="$bin.exe"
[ -x "$bin" ] && exec "$bin" verb "$here/src/scripts" "$@"
program="$here/src/scripts/verbs/$1.js"
if [ -f "$program" ]; then
  shift
  # The install brings no Node, so a box lacking it hears so in one line. [[spec/tickets/bare-desk-names-missing-node]]
  command -v node >/dev/null 2>&1 || {
    printf '%s\n' "No node stands on the PATH, and every verb without a Go twin runs on it. Install node, and run this again." >&2
    exit 2
  }
  # The install hands its JavaScript steps to the index, and this road stands where no index does. [[spec/tickets/setup-runs-without-an-index]]
  node "$here/src/scripts/verbs/setup.js" >&2 ||
    printf '%s\n' "  the setup stopped, so the editor, the survey, the Copilot setup and the brand stand as they stood." >&2
  exec node "$program" "$@"
fi
printf '%s\n' "No quack binary stands at $bin, so help and $1 answer nothing. Run sh src/scripts/install.sh." >&2
exit 2
