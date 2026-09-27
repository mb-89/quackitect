// The one Go module this tree holds, and how a battery runs its tests. The
// module stands at the root, and a package folder under src joins it, so every
// import names the folder. Every package builds with Go alone, so it runs on every box.
// [[spec/rationales/go-stands-as-one-module]]
// [[spec/design_output/index#the-compiler-it-needs]]

const SRC = "src";
const MOD = "go.mod";
// The module path every tree import opens on. [[spec/tickets/go-code-shares-one-module]]
const MODULE = "quackitect";

// The root holds the module, and a module a folder under src still holds stands beside it, so a stray one runs and shows. [[spec/tickets/go-code-shares-one-module]]
export function goModulesIn(it) {
  const root = it.disk.exists(it.join(it.root, MOD)) ? ["."] : [];
  return [...root, ...modulesUnder(it, SRC).sort()];
}

// Every module at or below a folder, read a folder at a time so a module inside a module stands. [[spec/tickets/an-engine-takes-bridge-work]]
function modulesUnder(it, folder) {
  const at = it.join(it.root, ...folder.split("/"));
  if (!it.disk.exists(at)) return [];
  const out = [];
  for (const one of it.disk.list(at)) {
    // A package folder holds no module of this tree, and it holds thousands of folders. [[spec/tickets/an-engine-takes-bridge-work]]
    if (one.kind !== "dir" || one.name === "node_modules") continue;
    const below = `${folder}/${one.name}`;
    if (it.disk.exists(it.join(at, one.name, MOD))) out.push(below);
    else out.push(...modulesUnder(it, below));
  }
  return out;
}

// A tree import names a package folder under the root, and a test file's import builds no binary. [[spec/tickets/go-code-shares-one-module]]
const IMPORT = new RegExp(`"${MODULE}/(${SRC}/[^"]+)"`, "g");

// A package folder and every tree package it imports, to the end of the chain: the source a binary builds from. [[spec/tickets/go-code-shares-one-module]]
export function goFoldersOf(disk, root, folder) {
  const seen = new Set([folder]);
  const queue = [folder];
  while (queue.length) {
    for (const next of importsOf(disk, `${root}/${queue.shift()}`)) {
      if (seen.has(next)) continue;
      seen.add(next);
      queue.push(next);
    }
  }
  // A folder below another the build reads already rides in that one's hash. [[spec/tickets/go-code-shares-one-module]]
  const [own, ...rest] = [...seen].filter(
    (one, _, all) => !all.some((other) => one.startsWith(`${other}/`)),
  );
  return [own, ...rest.sort()];
}

// The tree packages a folder's own Go files import, the folders below it read too, since the build takes them with it. [[spec/tickets/go-code-shares-one-module]]
function importsOf(disk, at) {
  if (!disk.exists(at)) return [];
  const out = [];
  for (const one of disk.list(at)) {
    const path = `${at}/${one.name}`;
    if (one.kind === "dir") out.push(...importsOf(disk, path));
    else if (one.name.endsWith(".go") && !one.name.endsWith("_test.go"))
      for (const found of String(disk.read(path)).matchAll(IMPORT)) out.push(found[1]);
  }
  return out;
}

// The environment a Go test runs under: Go alone, and no C compiler. [[spec/design_output/index#the-compiler-it-needs]]
export function goEnvOf() {
  return { CGO_ENABLED: "0" };
}

// The findings the Go formatter's list reads as, one a file it names, under the module that ran it. [[spec/design_output/index#the-compiler-it-needs]]
export function formatFaults(folder, said) {
  return `${said ?? ""}`
    .split("\n")
    .map((one) => one.trim())
    .filter(Boolean)
    .map(
      (name) =>
        `${folder === "." ? "" : `${folder}/`}${name}: Gofmt: the file reads another way than the formatter writes it.`,
    );
}

// The Go gate: the tests and the formatter at the root, through the run door it takes. [[spec/tickets/go-checks-need-go]]
export function goGate() {
  return 0;
}
