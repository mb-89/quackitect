// The tests every held ticket carries, which the commit door counts beside the
// staged ones, driven through a fake disk.
// [[spec/design_output/tree#the-rules-over-two-files]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { heldTests } from "../../src/scripts/held-tests.js";

const ROOT = "/tree";
const at = (path) => join(ROOT, ...path.split("/"));
const ticket = (line) =>
  `# Ask\n\nThe prose names test/level0/prose.test.js.\n\n### tests\n\n    ${line}\n`;

// Several hands hold on one box, and the commit door reads the tests every held ticket carries. [[spec/design_output/tree#the-rules-over-two-files]]
test("the tests each held ticket carries come back once, and a hold whose ticket stands nowhere adds none", () => {
  const it = {
    root: ROOT,
    join,
    disk: fakeDisk({
      [at(".se/.runtime/hold/a-hand.json")]: JSON.stringify({
        ticket: "one",
        path: "spec/tickets/one.md",
      }),
      [at(".se/.runtime/hold/b-hand.json")]: JSON.stringify({
        ticket: "two",
        path: "spec/tickets/two.md",
      }),
      [at(".se/.runtime/hold/c-hand.json")]: JSON.stringify({
        ticket: "gone",
        path: "spec/tickets/gone.md",
      }),
      [at("spec/tickets/one.md")]: ticket("./RUNME.sh branch test test/level0/one.test.js"),
      [at("spec/tickets/two.md")]: ticket(
        "./RUNME.sh branch test test/level0/one.test.js src/engine/queue/pick_test.go",
      ),
    }),
  };

  assert.deepEqual(heldTests(it), [
    "test/level0/one.test.js",
    "src/engine/queue/pick_test.go",
  ]);
  assert.deepEqual(heldTests({ ...it, disk: fakeDisk({}) }), []);
});
