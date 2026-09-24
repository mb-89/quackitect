// The work group's buttons, read off the declaration this tree ships. Each
// stands declared and undrawn, and each line it runs names a verb the command
// line knows. The engine keys nothing reads stand nowhere.
// [[spec/design_input/the-editor-draws-the-ticket#the-work-group]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { disk } from "../../src/doors/disk.js";
import { verbs } from "../../src/scripts/cli.js";
import { entriesIn } from "../../src/extension/lib/widgets.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const schema = JSON.parse(disk().read(join(root, "spec/config/level0.schema.json")));
const keyed = new Map(entriesIn(schema).map((one) => [one.key, one]));
const BUTTONS = ["work.editor", "work.pull", "work.new"];

test("the engine keys nothing reads stand nowhere in the declaration", () => {
  assert.equal(keyed.has("engine.state"), false);
  assert.equal(keyed.has("engine.beat"), false);
});

// Whether each waits undrawn, and says what it is, stands in test/contract/tree.test.js.
test("the work section keeps its knobs, and declares its three buttons", () => {
  assert.ok(keyed.has("work.staleAfter"), "a knob the work verbs read stays");
  for (const key of BUTTONS) {
    const one = keyed.get(key);
    assert.ok(one, `${key} stands in the declaration`);
    assert.equal(one.widget, "action");
    assert.ok(one.icon, `${key} wears a mark`);
  }
});

test("each line a work button runs or counts names a verb the command line knows", () => {
  const lines = BUTTONS.flatMap((key) => [keyed.get(key)?.runs, keyed.get(key)?.counts])
    .filter(Boolean);
  assert.deepEqual(lines, [
    "./RUNME.sh tui work",
    "./RUNME.sh ticket yours --count",
    "./RUNME.sh ticket yours --next",
  ]);
  for (const line of lines) {
    const verb = line.split(" ")[1];
    assert.ok(verbs[verb], `${line} names a verb the command line knows`);
  }
});

test("new ticket asks a name, and opens the file under the tickets folder it names", () => {
  const one = keyed.get("work.new");
  assert.equal(one?.asks, "name");
  assert.equal(one?.opens, "spec/tickets/<name>.md");
});
