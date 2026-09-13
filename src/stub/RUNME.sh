#!/usr/bin/env sh
# The shim. A stub carries no method, so this finds the vehicle that
# vehicle.json names and hands every argument to the vehicle's RUNME, with
# the work root set to this folder. Two roads: SE_VEHICLE, then the folder
# a cloud box clones the vehicle into.
# [[spec/design_output/vehicle#two-roads-to-the-vehicle]]
set -eu
here=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)

name=$(sed -n 's/^ *"name": *"\([^"]*\)".*/\1/p' "$here/vehicle.json" | head -n 1)
vehicle="${SE_VEHICLE:-$HOME/.se/vehicles/$name}"

if [ ! -f "$vehicle/RUNME.sh" ]; then
  printf '%s\n' "No vehicle stands at $vehicle. Set SE_VEHICLE to the vehicle's folder, or let the bridgehead install it on the first session." >&2
  exit 1
fi

SE_WORK="$here" exec sh "$vehicle/RUNME.sh" "$@"
