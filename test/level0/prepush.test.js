// The push door a terminal meets, fed the lines git pipes and a stamp.
// [[spec/design_output/work#the-battery-answers-first]]

import assert from "node:assert/strict";
import test from "node:test";
import { holds, refsIn } from "../../src/scripts/prepush.js";

const SHA = "a1b2c3d4e5f6a7b8";
const toTrunk = `refs/heads/main ${SHA} refs/heads/main 0000000000000000\n`;
const toWork = `refs/heads/work/x ${SHA} refs/heads/work/x 0000000000000000\n`;

function stamp(over = {}) {
  return JSON.stringify({ sha: SHA, ok: true, clean: true, at: "now", ...over });
}

test("git's lines read as refs, and a blank line reads as nothing", () => {
  assert.deepEqual(refsIn(`${toTrunk}\n${toWork}`), [
    { local: "refs/heads/main", sha: SHA, remote: "refs/heads/main" },
    { local: "refs/heads/work/x", sha: SHA, remote: "refs/heads/work/x" },
  ]);
});

test("a push to a work branch meets no door, whatever the stamp says", () => {
  assert.deepEqual(holds(refsIn(toWork), ""), { code: 0, said: "" });
  assert.deepEqual(holds(refsIn(toWork), stamp({ ok: false })), { code: 0, said: "" });
});

test("a push to trunk on a green stamp lands", () => {
  assert.deepEqual(holds(refsIn(toTrunk), stamp()), { code: 0, said: "" });
});

test("a push to trunk with no check refuses, and says so", () => {
  const said = holds(refsIn(toTrunk), "");
  assert.equal(said.code, 1);
  assert.match(said.said, /no check has run here/);
});

test("a push to trunk on a stale, unclean or red stamp refuses, each by name", () => {
  assert.match(holds(refsIn(toTrunk), stamp({ sha: "ffff" })).said, /ran against ffff/);
  assert.match(holds(refsIn(toTrunk), stamp({ clean: false })).said, /unclean tree/);
  assert.match(holds(refsIn(toTrunk), stamp({ ok: false })).said, /answered red/);
});

test("the refusal names the way out", () => {
  assert.match(holds(refsIn(toTrunk), "").said, /Run `\.\/RUNME\.sh check` last/);
});
