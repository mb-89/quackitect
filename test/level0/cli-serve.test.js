// The serve verb on a desk: it runs the index standing and returns, and its
// exit code says whether the hooks door stands.
// [[spec/design_output/level0#a-desk-serve-returns]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeProc } from "../../src/doors/fake/proc.js";
import { serveBridge } from "../../src/scripts/verbs/serve.js";

const ROOT = "/tree";
const INDEX_AT = join(ROOT, ".se", ".runtime", "bin", "se-index");
const HOOKS_AT = join(ROOT, ".se", ".runtime", "hooks.json");

function doors(answer) {
  const disk = fakeDisk();
  const proc = fakeProc({ node: { exitCode: 1 } });
  proc.teach([INDEX_AT, "standing"], () => {
    if (!answer.exitCode) disk.write(HOOKS_AT, '{"port":7001,"token":"t"}');
    return answer;
  });
  return { proc, disk, env: {}, root: ROOT, join, node: "node" };
}

async function heard(what) {
  const lines = [];
  const was = console.log;
  console.log = (...said) => lines.push(said.join(" "));
  try {
    return { code: await what(), said: lines.join("\n") };
  } finally {
    console.log = was;
  }
}

// [[spec/design_output/level0#a-desk-serve-returns]]
test("the serve verb starts the index, exits zero, and says the port", async () => {
  const { code, said } = await heard(() => serveBridge([], doors({ exitCode: 0 })));
  assert.equal(code, 0);
  assert.match(said, /index starts at port 7001/);
});

// [[spec/design_output/level0#a-desk-serve-returns]]
test("the serve verb exits one where the index falls", async () => {
  const { code, said } = await heard(() =>
    serveBridge([], doors({ exitCode: 1, stderr: "no door" })),
  );
  assert.equal(code, 1);
  assert.match(said, /falls: no door/);
});

// [[spec/design_output/level0#a-desk-serve-returns]]
test("the serve verb takes no debugger, and runs the index standing alone", async () => {
  const held = doors({ exitCode: 0 });
  const { code } = await heard(() => serveBridge(["--inspect"], held));
  assert.equal(code, 0);
  assert.deepEqual(
    held.proc.ran.map((one) => one.argv),
    [[INDEX_AT, "standing"]],
  );
});
