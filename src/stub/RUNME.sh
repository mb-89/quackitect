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
  # The runtime folder .claude/skills/level0/lib/folders.js owns, spelled again
  # here because a stub carries no vehicle and a shell script imports nothing.
  for dir in ${SE_REGISTRY:-$HOME/.se/.runtime}; do
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

# The vehicle's folder is a marketplace, and this stub enables the plugin under
# the brand. The path differs per box, so it lands in the file git ignores.
# [[spec/design_output/level0#a-stub-names-its-vehicle]]
node -e '
  const [lib, at, vehicle, brand] = process.argv.slice(1);
  const { shimSettings } = await import(lib);
  const fs = await import("node:fs");
  let was = "";
  try { was = fs.readFileSync(at, "utf8"); } catch {}
  const made = shimSettings(was, vehicle, brand);
  if (made !== was) {
    fs.mkdirSync(at.replace(/[\/][^\/]*$/, ""), { recursive: true });
    fs.writeFileSync(at, made);
  }
' "$vehicle/.claude/skills/level0/lib/vehicle.js" "$here/.claude/settings.local.json" "$vehicle" "$name" 2>/dev/null ||
  printf '%s\n' "The marketplace reached no settings, so this session loads the plugin from wherever it already stands." >&2

SE_WORK_ROOT="$here" exec sh "$vehicle/RUNME.sh" "$@"
