#!/usr/bin/env sh
# RUNME. The one command that always works.
#
# It installs what has to be installed, then hands every argument through to
# the command line interface. What that interface is written in is not this
# script's business: .se/runme.json says what to run.
#
#   ./RUNME.sh --version
set -eu
here=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
spec="$here/.se/runme.json"
[ -f "$spec" ] || { echo "This folder has no .se/runme.json, so it is not a project yet." >&2; exit 1; }

field() { sed -n 's/.*"'"$1"'"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "$2" | head -1; }

command_rel=$(field command "$spec")
install_rel=$(field install "$spec")
driver=$(field driver "$spec")

if [ -n "$command_rel" ]; then
  cmd="$here/$command_rel"
  if [ ! -x "$cmd" ] && [ -n "$install_rel" ]; then
    echo "not built yet - installing"
    "$here/$install_rel"
  fi
  [ -x "$cmd" ] || { echo "still no $cmd after installing" >&2; exit 1; }
  exec "$cmd" "$@"
fi

# A project names the copy that drives it. The register turns that identity
# into a place, so either tree can be moved or renamed.
dirs=${SE_REGISTRY:-$HOME/.se}
root=""
IFS=:
for d in $dirs; do
  reg="$d/registry.json"
  [ -f "$reg" ] || continue
  root=$(awk -v id="$driver" '
    /"id"/        { cur_id = $0; sub(/.*"id"[[:space:]]*:[[:space:]]*"/, "", cur_id); sub(/".*/, "", cur_id) }
    /"method_root"/ { mr = $0; sub(/.*"method_root"[[:space:]]*:[[:space:]]*"/, "", mr); sub(/".*/, "", mr);
                      if (cur_id == id) { print mr; exit } }' "$reg")
  [ -n "$root" ] && break
done
unset IFS
if [ -z "$root" ] && [ -z "$driver" ]; then
  # No copy is recorded yet. One copy is not a choice: use it.
  IFS=:
  for d in $dirs; do
    reg="$d/registry.json"
    [ -f "$reg" ] || continue
    all=$(sed -n 's/.*"method_root"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "$reg")
    n=$(printf '%s\n' "$all" | grep -c . || true)
    if [ "$n" = "1" ]; then root=$all; fi
  done
  unset IFS
fi
if [ -z "$root" ]; then
  if [ -z "$driver" ]; then
    echo "more than one copy is on this machine, or none. Start this folder from the editor once, or run: <copy>/.bin/se --attach --work ." >&2
  else
    echo "the copy that drives this folder ($driver) is not on this machine." >&2
  fi
  exit 1
fi

engine="$root/.bin/se"
if [ ! -x "$engine" ]; then
  echo "the driver is not built yet - installing"
  "$root/util/setup/install.sh" --profile headless
fi
exec "$engine" --work "$here" "$@"
