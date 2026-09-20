// The Go half of the battery: which folders are modules, what the run reads,
// and the findings the formatter's list reads as.
// [[spec/design_output/index#the-compiler-it-needs]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { formatFaults, goEnvOf, goModulesIn } from "../../src/scripts/cli-go.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";

const ROOT = "/tree";
const at = (path) => join(ROOT, ...path.split("/"));

function box(files = {}) {
  return { disk: fakeDisk(files), join, root: ROOT };
}

test("a folder under src holding a module file is a module, and one holding none is not", () => {
  const it = box({
    [at("src/config/go.mod")]: "module quackitect/config\n",
    [at("src/tui/go.mod")]: "module quackitect/tui\n",
    [at("src/scripts/cli.js")]: "",
  });
  assert.deepEqual(goModulesIn(it), ["src/config", "src/tui"]);
  assert.deepEqual(goModulesIn(box()), [], "a tree with no src folder holds no module");
});

test("the run names the pinned compiler where it stands, and leaves it out where it stands nowhere", () => {
  const bare = goEnvOf(box());
  assert.equal(bare.CC, undefined);
  assert.match(bare.GOFLAGS, /sqlite_fts5/);
});

// The gate the round before this one wired, held by a case of its own. [[spec/tickets/the-colours-stand-in-config]]
test("the formatter's list reads as one finding a file, named under its module", () => {
  const said = formatFaults("src/config", "probe.go\nother.go\n");
  assert.equal(said.length, 2);
  assert.match(said[0], /^src\/config\/probe\.go: Gofmt: /);
  assert.match(said[1], /^src\/config\/other\.go: Gofmt: /);
});

// [[spec/tickets/the-colours-stand-in-config]]
test("a formatter answering nothing leaves the check green", () => {
  assert.deepEqual(formatFaults("src/config", ""), []);
  assert.deepEqual(formatFaults("src/config", "\n  \n"), []);
  assert.deepEqual(formatFaults("src/config", undefined), []);
});
