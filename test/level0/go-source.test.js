// The Go binaries' stamps, over a fake disk. A binary keys on a hash of its
// folder, of every tree package it imports to the end of the chain, and of the
// root go.mod and go.sum, so a move in a shared package rebuilds it the way a
// move in its own folder does. [[spec/tickets/go-code-shares-one-module]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { goFoldersOf } from "../../src/scripts/cli-go.js";
import { BUILDS, foldersOf, fresh, stamps } from "../../src/scripts/go-source.js";

const ROOT = "/box";

const tree = () =>
  fakeDisk({
    [`${ROOT}/go.mod`]: "module quackitect\n",
    [`${ROOT}/go.sum`]: "",
    [`${ROOT}/src/front/cmd/main.go`]:
      'package main\n\nimport (\n\t"fmt"\n\n\t"quackitect/src/engine/swap"\n\t"quackitect/src/yaml"\n)\n',
    [`${ROOT}/src/front/cmd/main_test.go`]:
      'package main\n\nimport "quackitect/src/tui"\n',
    [`${ROOT}/src/yaml/yaml.go`]: 'package yaml\n\nimport "quackitect/src/pointer"\n',
    [`${ROOT}/src/pointer/pointer.go`]: "package pointer\n",
    [`${ROOT}/src/engine/swap/swap.go`]: "package swap\n",
    [`${ROOT}/src/tui/main.go`]: "package main\n",
  });

test("the two binaries name their folders", () => {
  assert.deepEqual(BUILDS, {
    "se-index": "src/quack",
    "se-front": "src/front/cmd",
  });
});

// [[spec/tickets/go-code-shares-one-module]]
test("a binary's folders take every tree package it imports, to the end of the chain", () => {
  assert.deepEqual(goFoldersOf(tree(), ROOT, "src/front/cmd"), [
    "src/front/cmd",
    "src/engine/swap",
    "src/pointer",
    "src/yaml",
  ]);
});

// [[spec/tickets/go-code-shares-one-module]]
test("the stamp reads the folders and the root module files", () => {
  assert.deepEqual(foldersOf(tree(), ROOT, "src/front/cmd"), [
    `${ROOT}/src/front/cmd`,
    `${ROOT}/src/engine/swap`,
    `${ROOT}/src/pointer`,
    `${ROOT}/src/yaml`,
    `${ROOT}/go.mod`,
    `${ROOT}/go.sum`,
  ]);
});

// [[spec/tickets/go-code-shares-one-module]]
test("a move in the folder, an imported folder or the module rebuilds the binary, and a test file moves nothing", () => {
  const disk = tree();
  assert.equal(fresh(disk, ROOT, "se-front"), false, "no stamp reads as stale");

  stamps(disk, ROOT, "se-front");
  assert.equal(fresh(disk, ROOT, "se-front"), true, "the stamp holds the source");

  disk.write(`${ROOT}/src/front/cmd/main_test.go`, "package main // moved");
  disk.write(`${ROOT}/src/tui/main.go`, "package main // moved");
  assert.equal(
    fresh(disk, ROOT, "se-front"),
    true,
    "a test file and a stranger move nothing",
  );

  disk.write(`${ROOT}/src/pointer/pointer.go`, "package pointer // moved");
  assert.equal(
    fresh(disk, ROOT, "se-front"),
    false,
    "a package two imports away moves the binary",
  );

  stamps(disk, ROOT, "se-front");
  disk.write(`${ROOT}/go.sum`, "one\n");
  assert.equal(fresh(disk, ROOT, "se-front"), false, "a moved sum moves it");

  stamps(disk, ROOT, "se-front");
  disk.write(`${ROOT}/src/front/cmd/main.go`, "package main // moved");
  assert.equal(fresh(disk, ROOT, "se-front"), false, "its own folder moves it");
});
