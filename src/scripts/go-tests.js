// Every Go module this tree holds, and how a battery runs its tests. A module
// is a folder under src holding a go.mod, and a module reaching C through cgo
// builds with the Zig the install pins, so every module runs on every box.
// [[spec/design_output/index#the-compiler-it-needs]]

import { BIN } from "../../.claude/skills/level0/lib/tools.js";

const SRC = "src";
const MOD = "go.mod";
// The tag the index builds its full-text search under, which every module ignores but the index. [[spec/design_output/index#the-compiler-it-needs]]
const TAGS = "-tags=sqlite_fts5";

// [[spec/design_output/index#the-compiler-it-needs]]
export function goModulesIn(it) {
  const at = it.join(it.root, SRC);
  if (!it.disk.exists(at)) return [];
  return it.disk
    .list(at)
    .filter((one) => one.kind === "dir" && it.disk.exists(it.join(at, one.name, MOD)))
    .map((one) => `${SRC}/${one.name}`)
    .sort();
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

// The findings the Go formatter's list reads as, one a file it names. [[spec/design_output/index#the-compiler-it-needs]]
export function formatFaults(folder, said) {
  return `${said ?? ""}`
    .split("\n")
    .map((one) => one.trim())
    .filter(Boolean)
    .map((name) => `${folder}/${name}: Gofmt: the file reads another way than the formatter writes it.`);
}
