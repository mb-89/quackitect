#!/usr/bin/env sh
# RUNME. The one command that always works.
#
# It installs what has to be installed, then hands every argument through to
# the command line interface. What that interface is written in is not this
# script's business: .se/runme.json says what to run.
#
# Installing may use the network, and nothing after it does:
# [[the-installer-needs-the-network-and-nothing-else-does]].
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
sources_rel=$(field sources "$spec")

# A FAILED BUILD REFUSES OUT LOUD. Falling back to the binary already in .bin
# runs code the source no longer says, and it exits 0, so nobody finds out.
build_it() {
  if ! "$here/$install_rel"; then
    echo "the build failed, so $cmd was not run ($1). Fix the build and run this again." >&2
    exit 1
  fi
}

if [ -n "$command_rel" ]; then
  cmd="$here/$command_rel"
  if [ ! -x "$cmd" ] && [ -n "$install_rel" ]; then
    echo "not built yet - installing"
    build_it "it was never built"
  fi
  [ -x "$cmd" ] || { echo "still no $cmd after installing" >&2; exit 1; }
  # A BINARY OLDER THAN ITS SOURCE IS THE WRONG PROGRAM. It runs, and it
  # answers for code that is no longer there. sources says where the source
  # lives; the installer builds everything this tree builds, so one rebuild
  # covers every binary in .bin and not only the one about to run.
  if [ -n "$install_rel" ] && [ -n "$sources_rel" ]; then
    newer=""
    for s in $sources_rel; do
      if [ -d "$here/$s" ]; then
        newer=$(find "$here/$s" -type f -newer "$cmd" | head -1)
      fi
      if [ -n "$newer" ]; then break; fi
    done
    if [ -n "$newer" ]; then
      echo "$command_rel is older than its source - rebuilding"
      build_it "$newer is newer than it"
    fi
  fi
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
# The work root rides out of band: an argument added here would sit where
# the verb belongs, and the engine reads the verb as its first argument.
SE_WORK="$here"
export SE_WORK
exec "$engine" "$@"
