#!/usr/bin/env sh
# RUNME. The one command that always works.
#
# It installs what this tree needs. Bare, it then opens the editor here with
# the quackitect panel showing. With a verb, it hands the verb to the command
# line.
set -eu
here=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)

sh "$here/src/scripts/install.sh"

# A cloud box reads each variable as cloudVariables in src/quack/command.go does: trimmed, and empty, 0 or false names a desk. [[spec/tickets/bare-runme-exits-clean]]
cloud_box() {
  for name in CLAUDE_CODE_REMOTE SE_CLOUD; do
    eval "said=\${$name:-}"
    said=${said#"${said%%[![:space:]]*}"}
    said=${said%"${said##*[![:space:]]}"}
    case $said in
    '' | 0 | [Ff][Aa][Ll][Ss][Ee]) ;;
    *) return 0 ;;
    esac
  done
  return 1
}

# A bare call on a cloud box prints the verbs, since no editor opens there. [[spec/tickets/bare-runme-exits-clean]]
[ "$#" -eq 0 ] && cloud_box && set -- help

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
  # The setup runs in the index, so a box with no index names its build as the step to take. [[spec/tickets/setup-road-without-index]]
  printf '%s\n' "  no index here, so the setup waits: bring go, and run sh src/scripts/install.sh again." >&2
  exec node "$program" "$@"
fi
printf '%s\n' "No quack binary stands at $bin, so help and $1 answer nothing. Run sh src/scripts/install.sh." >&2
exit 2
