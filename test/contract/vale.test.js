// The Vale door against the binary, with the fake held to the same answer.
// [[spec/design_output/doors#one-contract-test-per-door]]

import assert from "node:assert/strict";
import { dirname } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { disk } from "../../src/doors/disk.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeProc } from "../../src/doors/fake/proc.js";
import { proc } from "../../src/doors/proc.js";
import { vale } from "../../src/doors/vale.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const files = disk();
const outside = proc();
const NOTE = "notes.md";
const ifVale = vale(files, outside, root).stands() ? test : test.skip;

// The real run teaches the fake, so the door answers the same through both. [[spec/design_output/doors#one-contract-test-per-door]]
ifVale(
  "the door stands where the binary is, reads a text under its path, and the fake answers the same",
  async () => {
    const taught = {};
    const recording = {
      run: (argv, init) => {
        const said = outside.run(argv, init);
        taught[argv.join(" ")] = said;
        return said;
      },
    };
    const door = vale(files, recording, root);
    assert.equal(door.stands(), true);

    const text = "THIS IS THE SHOUTED PART, and it follows.\n";
    const said = await door.lint(text, NOTE);
    assert.equal(said.ran, true, said.why);
    assert.deepEqual(
      said.found.map((one) => one.rule),
      ["ShoutedLead"],
    );

    const twin = vale(files, fakeProc(taught), root);
    assert.deepEqual(await twin.lint(text, NOTE), said);
  },
);

test("a box with no binary reads no rule, and says so", async () => {
  const door = vale(fakeDisk(), fakeProc(), "/tree");
  assert.equal(door.stands(), false);
  assert.deepEqual(await door.lint("A line.\n", NOTE), {
    ran: false,
    why: "no vale stands here",
    found: [],
  });
});
