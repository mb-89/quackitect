// The record's values, over the writer alone: what goes in quotes, what stays
// plain, and what a YAML reader makes of the entry afterwards.
// [[spec/design_output/work#the-record-quotes-its-value]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { readNote } from "../../.claude/skills/level0/lib/schema.js";
import { quoted, recordIn, withEntry } from "../../src/engine/group.js";

const NOTE = "---\nkind: [[ticket]]\nstate: open\n---\n\n# Ask\n\nA thing.\n";

test("a value carrying a mapping, a comment or a leading mark goes in quotes", () => {
  assert.equal(
    quoted("The word `pair` names three things: the entry, the pointer and the hook"),
    '"The word `pair` names three things: the entry, the pointer and the hook"',
  );
  assert.equal(quoted("#4 stands open"), '"#4 stands open"');
  assert.equal(quoted('"already quoted"'), '"\\"already quoted\\""');
  assert.equal(quoted("[a list]"), '"[a list]"');
  assert.equal(
    quoted("a path C:\\tree and a colon: here"),
    '"a path C:\\\\tree and a colon: here"',
  );
});

test("a plain value stays plain", () => {
  assert.equal(
    quoted("the box leaves it while step-changes-hand"),
    "the box leaves it while step-changes-hand",
  );
  assert.equal(quoted("design/review"), "design/review");
  assert.equal(quoted(3), "3");
});

test("a reader takes back the reason a hand-back writes, colon and all", () => {
  const why =
    "The approach names no server: `./RUNME.sh serve` starts it.; Step 8 installs the plugin, and the approach writes a hook.";
  const text = withEntry(NOTE, {
    step: "design/review",
    hand: "box 99aa60a14c3f",
    returns: 1,
    why,
    answered: [
      { name: "check", exit: 0, said: "64 stand at warning: the panel draws them" },
    ],
  });
  assert.equal(readNote(text).front.stands, true, "the frontmatter reads whole");
  const entry = recordIn(text).at(-1);
  assert.equal(entry.why, why);
  assert.equal(entry.answered[0].said, "64 stand at warning: the panel draws them");
  assert.equal(entry.returns, 1);
});
