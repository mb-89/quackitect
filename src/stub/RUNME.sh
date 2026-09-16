#!/usr/bin/env sh
# The shim. A stub carries no method, so this finds the vehicle that
# vehicle.json names and hands every argument to the vehicle's RUNME, with
# the work root set to this folder. Three roads: SE_VEHICLE, the register,
# then the folder a cloud box clones the vehicle into.
# [[spec/design_output/vehicle#two-roads-to-the-vehicle]]
set -eu
here=$(CDPATH= cd -- "$(dirname -- "$0")" && (pwd -W 2>/dev/null || pwd))

field() {
  tr -d '\n' < "$2" | tr ',{}' '\n\n\n' | sed -n "s/^ *\"$1\": *\"\([^\"]*\)\".*/\1/p" | head -n 1
}

name=$(field name "$here/vehicle.json")
id=$(field vehicle "$here/vehicle.json")
upstream=$(field upstream "$here/vehicle.json")
cloned="$HOME/.se/vehicles/$name"

registered() {
  [ -n "$id" ] || return 0
  old_ifs=$IFS
  IFS=';'
  for dir in ${SE_REGISTRY:-$HOME/.se}; do
    IFS=$old_ifs
    file="$dir/registry.json"
    [ -f "$file" ] || continue
    found=$(tr -d '\n' < "$file" | tr '{' '\n' | grep "\"id\": *\"$id\"" |
      sed -n 's/.*"method_root": *"\([^"]*\)".*/\1/p' | sed 's/\\\\/\//g; s/\\/\//g' | head -n 1)
    if [ -n "$found" ]; then
      printf '%s\n' "$found"
      return 0
    fi
  done
  IFS=$old_ifs
}

vehicle=${SE_VEHICLE:-}
[ -n "$vehicle" ] || vehicle=$(registered)
[ -n "$vehicle" ] || vehicle=$cloned

if [ ! -f "$vehicle/RUNME.sh" ]; then
  printf '%s\n' "No vehicle stands for $name: set SE_VEHICLE to its folder, or let the bridgehead clone $upstream into $cloned on the first session." >&2
  exit 1
fi

SE_WORK_ROOT="$here" exec sh "$vehicle/RUNME.sh" "$@"
