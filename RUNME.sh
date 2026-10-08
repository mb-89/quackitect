#!/usr/bin/env sh
# RUNME. The one command that always works.
#
# It installs what this tree needs. Bare, it then opens the editor here with
# the quackitect panel showing. With a verb, it hands the verb to the command
# line.
set -eu
# The folder comes off $0 by the shell's own words, so a box whose dirname fails still finds it, and an absolute folder stands as given. [[spec/tickets/bare-runme-exits-clean]]
dir=.
case $0 in */*) dir=${0%/*} ;; esac
case ${0##*/} in *\\*) dir=${0%\\*} ;; esac
case $dir in
'') here=/ ;;
/* | [A-Za-z]:*) here=$dir ;;
*) here=$(CDPATH= cd -- "$dir" && pwd) ;;
esac

sh "$here/install.sh"

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

# The binary picks the road off the verbs slice, and a box with no binary hears the install that builds it. [[spec/tickets/cli-js-leaves]] [[spec/tickets/scripts-folder-leaves]]
bin="$here/.se/.runtime/bin/se-index"
[ -x "$bin.exe" ] && bin="$bin.exe"
[ -x "$bin" ] && exec "$bin" verb "$here/src/scripts" "$@"
printf '%s\n' "No quack binary stands at $bin, so help and $1 answer nothing. Run sh install.sh." >&2
exit 2
