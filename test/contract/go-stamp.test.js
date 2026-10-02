// The stamp beside a Go binary the install builds, driven over a real module.
// The stamp keys on every file the build reads, so a move in a package the
// binary imports rebuilds it. [[spec/design_output/lsp#the-build-beside-the-index]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { disk } from "../../src/doors/disk.js";
import { proc } from "../../src/doors/proc.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));

const goHere = () => {
  try {
    return proc().run(["go", "version"]).exitCode === 0;
  } catch {
    return false;
  }
};

// A module carrying no go.sum and no git stamps too. [[spec/tickets/go-stamp-takes-bare-modules]]
test("the source stamp reads fresh after a stamp, and stale once a source the build reads changes", { skip: !goHere() && "no go here" }, () => {
  const files = disk();
  const tree = files.tempDir("go-stamp-");
  try {
    const script = join(tree, "src", "scripts", "go-stamp.sh");
    for (const one of ["scripts", "quack", "q"]) files.makeDir(join(tree, "src", one));
    files.write(script, files.read(join(root, "src", "scripts", "go-stamp.sh")));
    files.write(join(tree, "go.mod"), "module stamped\n\ngo 1.24\n");
    files.write(join(tree, "src", "quack", "main.go"), 'package main\n\nimport "stamped/src/q"\n\nfunc main() { q.Do() }\n');
    files.write(join(tree, "src", "q", "q.go"), "package q\n\nfunc Do() {}\n");
    const stamp = (verb) => proc().run(["sh", script, verb, "se-index"], { cwd: tree }).exitCode;
    assert.equal(stamp("fresh"), 1, "no stamp reads stale");
    assert.equal(stamp("stamp"), 0, "the stamp lands");
    assert.equal(stamp("fresh"), 0, "the stamp reads fresh");
    files.write(join(tree, "src", "q", "q.go"), "package q\n\nfunc Do() { _ = 1 }\n");
    assert.equal(stamp("fresh"), 1, "a change in an imported package reads stale");
  } finally {
    files.remove(tree);
  }
});
