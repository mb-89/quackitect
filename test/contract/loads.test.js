// The cage answers for itself only while it loads. A module failing to import
// registers no door, so every door inside it stays silent about the fault.
// This test stands outside the harness and asks in its place.
// [[spec/design_output/level0#god-mode]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { register } from "../../.claude/skills/level0/hooks/level0.js";
import { disk } from "../../src/doors/disk.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const CAGE = join(root, ".claude", "skills", "level0");
const files = disk();

const DOORS = [
  "session.start",
  "prompt.submit",
  "tool.call",
  "turn.complete",
  "agent.spawn",
];

test("the module imports, and every door it names reaches a hook", () => {
  const seen = [];
  register((event) => seen.push(event), {});

  for (const one of DOORS) {
    assert.ok(seen.includes(one), `${one} reaches no hook`);
  }
});

// [[spec/design_output/level0#god-mode]]
test("no file in the cage carries a conflict marker", () => {
  for (const path of filesUnder(CAGE)) {
    const text = files.read(path);
    assert.ok(!/^<{7} /m.test(text), `${path} carries a conflict marker`);
    assert.ok(!/^>{7} /m.test(text), `${path} carries a conflict marker`);
  }
});

function filesUnder(at) {
  const out = [];
  for (const one of files.list(at)) {
    const under = join(at, one.name);
    if (one.kind === "dir") out.push(...filesUnder(under));
    else out.push(under);
  }
  return out;
}
