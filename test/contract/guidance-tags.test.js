// Guidance resolves by tags, read over this tree itself: the schemas admit the
// tags. TestEveryGuidanceNoteUnderASubfolderReachesSomeLeaf holds the reach.
// [[spec/design_input/level-two#guidance]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { listOf } from "../../.claude/skills/level0/lib/guidance.js";
import { checkNote, readYaml } from "../../.claude/skills/level0/lib/schema.js";
import { disk } from "../../src/doors/disk.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const files = disk();
const schemaOf = (name) =>
  readYaml(String(files.read(join(root, "spec", "schemas", `${name}.schema.yaml`))));
const tagFaults = (faults) =>
  faults.filter((one) => /\btags\b/.test(JSON.stringify(one)));

// [[spec/design_input/level-two#guidance]]
test("the ticket schema admits tags on a step, and the guidance schema admits tags on a note", () => {
  const ticket = `---\nkind: [[ticket]]\nstate: open\nurgency: soon\nsteps:\n  - name: do\n    tags: [code]\n    does: makes the change\n---\n\n# Ask\n\nOne thing.\n\n# do\n\n# Discussion\n`;
  const note = `---\nkind: [[guidance]]\nscope: ["a hand"]\ntags: [testing]\n---\n\n# Actionables\n\n1. Watch a test fail first.\n`;
  assert.deepEqual(tagFaults(checkNote(ticket, schemaOf("ticket"), "ticket")), []);
  assert.deepEqual(tagFaults(checkNote(note, schemaOf("guidance"), "note")), []);
});

// The mint tool writes a flow list quoted, and a quoted tag reaches the step its bare word reaches. [[spec/design_input/level-two#guidance]]
test("a quoted tag reads as its bare word, and a bare tag reads as itself", () => {
  assert.deepEqual(listOf('["testing", \'code\']'), ["testing", "code"]);
  assert.deepEqual(listOf("[testing, code]"), ["testing", "code"]);
});
