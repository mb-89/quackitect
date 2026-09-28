// The one Go module this tree holds, and how a battery runs its tests. The
// module stands at the root, and a package folder under src joins it, so every
// import names the folder. Every package builds with Go alone, so it runs on every box.
// [[spec/rationales/go-stands-as-one-module]]
// [[spec/design_output/index#the-compiler-it-needs]]

const SRC = "src";
// The module path every tree import opens on. [[spec/tickets/go-code-shares-one-module]]
const MODULE = "quackitect";
// The build tag a contract suite stands under, which the gate runs beside every other test. [[spec/design_output/model#the-fake-keeps-a-contract]]
const CONTRACT = "contract";

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

// The findings the Go formatter's list reads as, one a file it names, each named from the root. [[spec/design_output/index#the-compiler-it-needs]]
export function formatFaults(said) {
  return `${said ?? ""}`
    .split("\n")
    .map((one) => one.trim())
    .filter(Boolean)
    .map(
      (name) =>
        `${name}: Gofmt: the file reads another way than the formatter writes it.`,
    );
}

// The Go gate: the tests and the formatter at the root, through the run door it takes. [[spec/tickets/go-checks-need-go]]
export function goGate({ go, run, say, quiet = false, skip = [] }) {
  let ran;
  try {
    ran = run([go, "test", "-tags", CONTRACT, ...skip, "./..."], { quiet });
  } catch {
    say(
      "go stands nowhere, so the check refuses: run ./RUNME.sh tools, or install Go.",
    );
    return 1;
  }
  if (ran.exitCode) return ran.exitCode;
  // The root holds more than Go, so the formatter reads src alone. [[spec/tickets/go-code-shares-one-module]]
  const listed = run(["gofmt", "-l", SRC], { quiet: true });
  const faults = formatFaults(listed.stdout);
  for (const one of faults) say(one);
  return faults.length ? 1 : 0;
}
