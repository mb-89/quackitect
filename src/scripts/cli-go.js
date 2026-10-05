// The one Go module this tree holds, and what a Go test reads. The
// module stands at the root, and a package folder under src joins it, so every
// import names the folder. Every package builds with Go alone, so it runs on every box.
// [[spec/rationales/go-stands-as-one-module]]
// [[spec/design_output/index#the-compiler-it-needs]]

const SRC = "src";
// The module path every tree import opens on. [[spec/tickets/go-code-shares-one-module]]
const MODULE = "quackitect";

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

// The test functions the named Go test files declare, each once, in order. [[spec/design_output/pull#the-test-verb]]
export function goTestNames(paths, read) {
  const names = [];
  for (const path of paths.filter((one) => one.endsWith("_test.go"))) {
    let text = "";
    try {
      text = read(path);
    } catch {}
    for (const found of text.matchAll(/^func (Test\w+)\(/gm)) names.push(found[1]);
  }
  return [...new Set(names)].sort();
}

// The environment a Go test runs under: Go alone, and no C compiler. [[spec/design_output/index#the-compiler-it-needs]]
export function goEnvOf() {
  return { CGO_ENABLED: "0" };
}

