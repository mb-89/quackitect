// The Go binaries' stamps, over a fake disk. A binary keys on a hash of its
// folder and of every folder its go.mod replaces, so a move in a shared
// package rebuilds it the way a move in its own folder does.
// [[spec/tickets/every-server-stands-and-answers]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { BUILDS, foldersOf, fresh, stamps } from "../../src/scripts/go-source.js";

const ROOT = "/box";

const GO_MOD = [
  "module quackitect/lsp",
  "",
  "require quackitect/yaml v0.0.0",
  "",
  "replace quackitect/yaml => ../yaml",
  "",
  "replace quackitect/swap => ../engine/swap",
  "",
  "replace github.com/far/away => github.com/near/by v1.0.0",
].join("\n");

const tree = () =>
  fakeDisk({
    [`${ROOT}/src/lsp/go.mod`]: GO_MOD,
    [`${ROOT}/src/lsp/main.go`]: "package main",
    [`${ROOT}/src/lsp/main_test.go`]: "package main",
    [`${ROOT}/src/yaml/yaml.go`]: "package yaml",
    [`${ROOT}/src/engine/swap/swap.go`]: "package swap",
    [`${ROOT}/src/tui/main.go`]: "package main",
  });

test("the two binaries name their folders", () => {
  assert.deepEqual(BUILDS, { "se-lsp": "src/lsp", "se-index": "src/index" });
});

test("the folders are the binary's own and each local folder its go.mod replaces", () => {
  assert.deepEqual(foldersOf(tree(), ROOT, "src/lsp"), [
    `${ROOT}/src/lsp`,
    `${ROOT}/src/yaml`,
    `${ROOT}/src/engine/swap`,
  ]);
});

// [[spec/tickets/every-server-stands-and-answers]]
test("a move in the folder or a replaced folder rebuilds the binary, and a test file moves nothing", () => {
  const disk = tree();
  assert.equal(fresh(disk, ROOT, "se-lsp"), false, "no stamp reads as stale");

  stamps(disk, ROOT, "se-lsp");
  assert.equal(fresh(disk, ROOT, "se-lsp"), true, "the stamp holds the source");

  disk.write(`${ROOT}/src/lsp/main_test.go`, "package main // moved");
  disk.write(`${ROOT}/src/tui/main.go`, "package main // moved");
  assert.equal(fresh(disk, ROOT, "se-lsp"), true, "a test file and a stranger move nothing");

  disk.write(`${ROOT}/src/yaml/yaml.go`, "package yaml // moved");
  assert.equal(fresh(disk, ROOT, "se-lsp"), false, "a replaced package moves the binary");

  stamps(disk, ROOT, "se-lsp");
  disk.write(`${ROOT}/src/lsp/main.go`, "package main // moved");
  assert.equal(fresh(disk, ROOT, "se-lsp"), false, "its own folder moves it");
});
