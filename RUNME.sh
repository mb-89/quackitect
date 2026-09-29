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

# The binary picks the road off the verbs slice, and cli.js answers where no binary stands. [[spec/tickets/runme-hands-verbs-to-quack]]
bin="$here/.se/.runtime/bin/se-index"
[ -x "$bin.exe" ] && bin="$bin.exe"
[ -x "$bin" ] && exec "$bin" verb "$here/src/scripts/cli.js" "$@"
exec node "$here/src/scripts/cli.js" "$@"
