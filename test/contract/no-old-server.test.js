// The old language server leaves whole: no source names its binary, its
// standing file or its port client, and its folder stands nowhere. The case
// reads the real tree through git, which is what puts it here.
// [[spec/tickets/the-lsp-server-leaves]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { disk } from "../../src/doors/disk.js";
import { proc } from "../../src/doors/proc.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));

// The folders a source stands in, past the packages npm installs and this case, which names the words it looks for. [[spec/tickets/the-lsp-server-leaves]]
const SWEPT = [
  "src",
  ".claude",
  "test",
  "RUNME.sh",
  ":!**/node_modules/**",
  ":!test/contract/no-old-server.test.js",
];

// The files git tracks under the swept folders that carry the words, one path a line. [[spec/tickets/the-lsp-server-leaves]]
function naming(words) {
  const ran = proc().run(["git", "grep", "-l", "-F", words, "--", ...SWEPT], {
    cwd: root,
  });
  return String(ran?.stdout ?? "")
    .split("\n")
    .filter(Boolean);
}

// [[spec/tickets/the-lsp-server-leaves]]
test("no source names lsp.json or se-lsp", () => {
  for (const words of ["lsp.json", "se-lsp", "cli-served"]) {
    assert.deepEqual(naming(words), [], `sources name ${words}`);
  }
});

// [[spec/tickets/the-lsp-server-leaves]]
test("the old server's folder stands nowhere", () => {
  assert.equal(disk().exists(join(root, "src", "lsp")), false);
});
