// The Go binaries the install builds, and the folders each reads. go-stamp.sh
// stamps each binary, and test/contract/go-stamp.test.js drives it.
// [[spec/tickets/go-code-shares-one-module]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { goFoldersOf } from "../../src/scripts/cli-go.js";
import { BUILDS } from "../../src/scripts/go-source.js";

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
