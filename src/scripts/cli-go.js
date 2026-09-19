// Every Go module this tree holds, and how a battery runs its tests. A module
// is a folder under src holding a go.mod, and a module reaching C through cgo
// builds with the Zig the install pins, so every module runs on every box.
// [[spec/design_output/index#the-compiler-it-needs]]

import { BIN } from "../../.claude/skills/level0/lib/tools.js";

const SRC = "src";
const MOD = "go.mod";
// The tag the index builds its full-text search under, which every module ignores but the index. [[spec/design_output/index#the-compiler-it-needs]]
const TAGS = "-tags=sqlite_fts5";

// A folder under src holds a module, and a folder below that one holds a module too, because the engine folder takes one. [[spec/tickets/an-engine-takes-bridge-work]]
export function goModulesIn(it) {
  return modulesUnder(it, SRC).sort();
}

// Every module at or below a folder, read a folder at a time so a module inside a module stands. [[spec/tickets/an-engine-takes-bridge-work]]
function modulesUnder(it, folder) {
  const at = it.join(it.root, ...folder.split("/"));
  if (!it.disk.exists(at)) return [];
  const out = [];
  for (const one of it.disk.list(at)) {
    if (one.kind !== "dir") continue;
    const below = `${folder}/${one.name}`;
    if (it.disk.exists(it.join(at, one.name, MOD))) out.push(below);
    else out.push(...modulesUnder(it, below));
  }
  return out;
}

// The environment a Go test runs under, naming the pinned Zig where it stands. [[spec/design_output/index#the-compiler-it-needs]]
export function goEnvOf(it) {
  for (const name of ["zig.exe", "zig"]) {
    const zig = it.join(it.root, ...BIN.split("/"), "zig", name);
    if (it.disk.exists(zig))
      return { CC: `${zig} cc`, CGO_ENABLED: "1", GOFLAGS: TAGS };
  }
  return { GOFLAGS: TAGS };
}
